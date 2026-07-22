/**
 * PDF Compression Pipeline Orchestrator
 * 
 * This is the main compression pipeline that chains all optimization modules
 * in optimal order with detailed progress tracking.
 * 
 * Pipeline stages:
 * 1. ANALYZE  → Load PDF, count pages/images
 * 2. COMPRESS → Recompress each embedded image (biggest savings)
 * 3. DEDUPLICATE → Find and flag duplicate streams
 * 4. STRIP METADATA → Remove XMP, doc info, etc.
 * 5. OPTIMIZE FONTS → Remove unused fonts
 * 6. REBUILD → Save optimized PDF with object streams
 */

import {
  PDFDocument,
  PDFName,
  PDFDict,
  PDFStream,
  PDFRawStream,
  PDFRef,
  PDFNumber,
} from 'pdf-lib';
import { CompressionOptions, CompressionProgress, CompressionResult } from './types';
import { QUALITY_PRESETS } from './constants';
import { compressImage } from './image-compressor';
import { findDuplicateStreams, deduplicateStreams } from './deduplicator';
import { stripMetadata } from './metadata-stripper';
import { removeUnusedFonts } from './font-optimizer';
import { createTimer, clamp, calculateETA } from './utils';

/** Abort flag — set by worker on ABORT message */
let abortRequested = false;

export function requestAbort() {
  abortRequested = true;
}

export function resetAbort() {
  abortRequested = false;
}

/**
 * Detect if a PDF stream has a DCTDecode (JPEG) or JPXDecode (JPEG2000) filter,
 * meaning it's already an encoded image format.
 */
function isEncodedImageStream(stream: PDFStream): boolean {
  const filter = stream.dict.get(PDFName.of('Filter'));
  if (!filter) return false;

  const filterStr = filter.toString();
  return (
    filterStr.includes('DCTDecode') ||
    filterStr.includes('JPXDecode')
  );
}

/**
 * Get the color space string from a PDF image XObject.
 */
function getColorSpace(stream: PDFStream): string {
  const cs = stream.dict.get(PDFName.of('ColorSpace'));
  if (!cs) return 'DeviceRGB';
  const csStr = cs.toString();
  if (csStr.includes('DeviceGray') || csStr.includes('CalGray')) return 'DeviceGray';
  if (csStr.includes('DeviceCMYK')) return 'DeviceCMYK';
  return 'DeviceRGB';
}

/**
 * Set of refs we've already processed (for cross-page deduplication).
 * If the same image ref appears on multiple pages, we only compress it once.
 */
type ProcessedSet = Set<string>;

export async function compressPDF(
  pdfBytes: ArrayBuffer,
  options: CompressionOptions,
  onProgress: (progress: CompressionProgress) => void
): Promise<CompressionResult> {
  resetAbort();
  const timer = createTimer();
  const originalSize = pdfBytes.byteLength;

  const breakdown = {
    imagesSaved: 0,
    fontsSaved: 0,
    metadataSaved: 0,
    otherSaved: 0,
  };

  // Merge quality preset into options
  const preset = QUALITY_PRESETS[options.quality];
  const imageQuality = options.imageQuality ?? preset.imageQuality ?? 0.75;
  const maxDimension = (options as any).maxDimension ?? preset.maxDimension ?? Infinity;
  const shouldDedup = options.deduplicateStreams ?? true;
  const shouldStripMeta = options.stripMetadata ?? true;
  const shouldOptimizeFonts = options.optimizeFonts ?? true;

  // ── Stage 1: ANALYZE ──
  onProgress({
    phase: 'analyzing',
    pagesProcessed: 0,
    totalPages: 0,
    bytesProcessed: 0,
    bytesSaved: 0,
    currentOperation: 'Loading PDF document...',
    estimatedTimeRemaining: 0,
    percentage: 2,
  });

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  } catch (err) {
    throw new Error(`Failed to load PDF: ${err instanceof Error ? err.message : String(err)}`);
  }

  const totalPages = pdfDoc.getPageCount();
  if (totalPages === 0) {
    throw new Error('PDF has no pages.');
  }

  onProgress({
    phase: 'analyzing',
    pagesProcessed: 0,
    totalPages,
    bytesProcessed: 0,
    bytesSaved: 0,
    currentOperation: `Found ${totalPages} pages. Starting compression...`,
    estimatedTimeRemaining: 0,
    percentage: 5,
  });

  // ── Stage 2: COMPRESS IMAGES ──
  let imagesCompressed = 0;
  let totalBytesSaved = 0;
  const processedRefs: ProcessedSet = new Set();
  const compressionStartTime = performance.now();

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (abortRequested) throw new Error('Compression aborted by user.');

    const page = pdfDoc.getPage(pageIdx);
    
    // Resolve Resources — may be a direct dict or an indirect reference
    let resources: PDFDict | undefined;
    const rawResources = page.node.get(PDFName.of('Resources'));
    if (rawResources instanceof PDFDict) {
      resources = rawResources;
    } else if (rawResources instanceof PDFRef) {
      const resolved = pdfDoc.context.lookup(rawResources);
      if (resolved instanceof PDFDict) {
        resources = resolved;
      }
    }

    if (resources) {
      // Get XObject dictionary (may also be indirect ref)
      let xObjectDict: PDFDict | undefined;
      const rawXObjects = resources.get(PDFName.of('XObject'));
      if (rawXObjects instanceof PDFDict) {
        xObjectDict = rawXObjects;
      } else if (rawXObjects instanceof PDFRef) {
        const resolved = pdfDoc.context.lookup(rawXObjects);
        if (resolved instanceof PDFDict) {
          xObjectDict = resolved;
        }
      }

      if (xObjectDict) {
        const entries = xObjectDict.entries();
        for (const [name, ref] of entries) {
          if (abortRequested) throw new Error('Compression aborted by user.');

          // Skip if we've already processed this ref (cross-page dedup)
          const refKey = ref instanceof PDFRef ? ref.toString() : String(ref);
          if (processedRefs.has(refKey)) continue;
          processedRefs.add(refKey);

          // Resolve the XObject
          const xObj = ref instanceof PDFRef
            ? pdfDoc.context.lookup(ref)
            : ref;

          if (!(xObj instanceof PDFStream)) continue;

          // Check if it's an Image subtype
          const subtype = xObj.dict.get(PDFName.of('Subtype'));
          if (!subtype || !subtype.toString().includes('Image')) continue;

          try {
            const imgWidth = (xObj.dict.get(PDFName.of('Width')) as PDFNumber)?.asNumber?.() || 0;
            const imgHeight = (xObj.dict.get(PDFName.of('Height')) as PDFNumber)?.asNumber?.() || 0;

            if (imgWidth <= 0 || imgHeight <= 0) continue;

            // Bypass image compression entirely if quality is set to 1.0 (Ultra)
            if (imageQuality >= 1) continue;

            // Get the decoded image bytes
            const imageBytes = xObj.getContents();
            if (!imageBytes || imageBytes.byteLength < 5120) continue;

            const isEncoded = isEncodedImageStream(xObj);
            const colorSpace = getColorSpace(xObj);

            const compressedBytes = await compressImage(
              imageBytes,
              imgWidth,
              imgHeight,
              colorSpace,
              { quality: imageQuality, maxDimension },
              isEncoded
            );

            if (compressedBytes && compressedBytes.byteLength < imageBytes.byteLength) {
              // ── Replace the image stream in the PDF ──
              // We create a new PDFRawStream with the JPEG data and replace the old stream
              const newStreamDict = xObj.dict.clone(pdfDoc.context);
              
              // Update filter to DCTDecode (JPEG)
              newStreamDict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
              
              // Remove FlateDecode and other decode params that don't apply to JPEG
              newStreamDict.delete(PDFName.of('DecodeParms'));
              newStreamDict.delete(PDFName.of('DP'));
              
              // Update dimensions if downscaled
              // Note: We keep original dimensions in the dict since the PDF viewer
              // will scale the image to fit the content stream's CTM anyway.
              // But if we actually downscaled, update Width/Height
              if (maxDimension < Infinity && (imgWidth > maxDimension || imgHeight > maxDimension)) {
                const ratio = Math.min(maxDimension / imgWidth, maxDimension / imgHeight);
                const newW = Math.max(1, Math.round(imgWidth * ratio));
                const newH = Math.max(1, Math.round(imgHeight * ratio));
                newStreamDict.set(PDFName.of('Width'), PDFNumber.of(newW));
                newStreamDict.set(PDFName.of('Height'), PDFNumber.of(newH));
              }
              
              // Set color space to DeviceRGB (JPEG output is always RGB)
              newStreamDict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
              
              // Set BitsPerComponent to 8 for JPEG
              newStreamDict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));
              
              // Remove Length — pdf-lib recalculates this
              newStreamDict.delete(PDFName.of('Length'));

              // Create the new raw stream and register it
              const newRawStream = PDFRawStream.of(newStreamDict, compressedBytes);
              
              if (ref instanceof PDFRef) {
                // Replace the object at this ref
                pdfDoc.context.assign(ref, newRawStream);
              }

              const saved = imageBytes.byteLength - compressedBytes.byteLength;
              totalBytesSaved += saved;
              breakdown.imagesSaved += saved;
              imagesCompressed++;
            }
          } catch (e) {
            console.warn(`[PDFCompressor] Failed to compress image on page ${pageIdx + 1}:`, e);
            // Continue with next image — don't let one failure stop everything
          }
        }
      }
    }

    // Report progress
    const elapsed = performance.now() - compressionStartTime;
    const eta = calculateETA(pageIdx + 1, totalPages, elapsed);
    
    onProgress({
      phase: 'compressing',
      pagesProcessed: pageIdx + 1,
      totalPages,
      bytesProcessed: ((pageIdx + 1) / totalPages) * originalSize,
      bytesSaved: totalBytesSaved,
      currentOperation: `Compressed page ${pageIdx + 1} of ${totalPages} (${imagesCompressed} images optimized)`,
      estimatedTimeRemaining: eta,
      percentage: clamp(10 + ((pageIdx + 1) / totalPages) * 70, 10, 80),
    });
  }

  // ── Stage 3: DEDUPLICATE STREAMS ──
  if (shouldDedup && !abortRequested) {
    onProgress({
      phase: 'rebuilding',
      pagesProcessed: totalPages,
      totalPages,
      bytesProcessed: originalSize,
      bytesSaved: totalBytesSaved,
      currentOperation: 'Deduplicating object streams...',
      estimatedTimeRemaining: 0,
      percentage: 82,
    });

    try {
      const dupMap = await findDuplicateStreams(pdfDoc);
      const saved = await deduplicateStreams(pdfDoc, dupMap);
      totalBytesSaved += saved;
      breakdown.otherSaved += saved;
    } catch (e) {
      console.warn('[PDFCompressor] Deduplication failed:', e);
    }
  }

  // ── Stage 4: STRIP METADATA ──
  if (shouldStripMeta && !abortRequested) {
    onProgress({
      phase: 'rebuilding',
      pagesProcessed: totalPages,
      totalPages,
      bytesProcessed: originalSize,
      bytesSaved: totalBytesSaved,
      currentOperation: 'Stripping metadata...',
      estimatedTimeRemaining: 0,
      percentage: 88,
    });

    try {
      const saved = await stripMetadata(pdfDoc);
      totalBytesSaved += saved;
      breakdown.metadataSaved += saved;
    } catch (e) {
      console.warn('[PDFCompressor] Metadata stripping failed:', e);
    }
  }

  // ── Stage 5: OPTIMIZE FONTS ──
  if (shouldOptimizeFonts && !abortRequested) {
    try {
      const saved = await removeUnusedFonts(pdfDoc);
      totalBytesSaved += saved;
      breakdown.fontsSaved += saved;
    } catch (e) {
      console.warn('[PDFCompressor] Font optimization failed:', e);
    }
  }

  if (abortRequested) throw new Error('Compression aborted by user.');

  // ── Stage 6: REBUILD & SAVE ──
  onProgress({
    phase: 'finalizing',
    pagesProcessed: totalPages,
    totalPages,
    bytesProcessed: originalSize,
    bytesSaved: totalBytesSaved,
    currentOperation: 'Saving compressed PDF...',
    estimatedTimeRemaining: 0,
    percentage: 93,
  });

  const finalPdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    // addDefaultPage: false, // Don't add extra blank pages
  });

  const compressedSize = finalPdfBytes.byteLength;
  const timeTaken = timer.stop();

  onProgress({
    phase: 'finalizing',
    pagesProcessed: totalPages,
    totalPages,
    bytesProcessed: originalSize,
    bytesSaved: originalSize - compressedSize,
    currentOperation: 'Complete!',
    estimatedTimeRemaining: 0,
    percentage: 100,
  });

  return {
    originalSize,
    compressedSize,
    compressionRatio: originalSize > 0 ? (originalSize - compressedSize) / originalSize : 0,
    timeTaken,
    pagesProcessed: totalPages,
    imagesCompressed,
    fontsOptimized: 0,
    metadataStripped: shouldStripMeta ? 1 : 0,
    compressedBytes: finalPdfBytes,
    breakdown: {
      imagesSaved: breakdown.imagesSaved,
      fontsSaved: breakdown.fontsSaved,
      metadataSaved: breakdown.metadataSaved,
      otherSaved: breakdown.otherSaved,
    },
  };
}
