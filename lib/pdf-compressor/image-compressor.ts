/**
 * PDF Image Compressor
 * 
 * The heart of the compression engine. Uses OffscreenCanvas (in workers)
 * or HTMLCanvasElement (main thread) for high-performance image recompression.
 * 
 * Handles both already-encoded images (JPEG/PNG from PDF streams) and
 * raw pixel data. Automatically detects and handles color spaces.
 */

interface CompressImageOptions {
  quality: number;
  maxDimension: number;
}

/**
 * Compress a raw image extracted from a PDF stream.
 * 
 * PDF images can be in various formats:
 * - Already JPEG-encoded (DCTDecode filter) — we re-encode at lower quality
 * - Already Flate-compressed raw pixels — decoded by pdf-lib's getContents()
 * - Raw uncompressed pixel data
 * 
 * We use createImageBitmap for already-encoded images, and manual ImageData
 * construction for raw pixel data.
 */
export async function compressImage(
  imageData: Uint8Array,
  width: number,
  height: number,
  colorSpace: string,
  options: CompressImageOptions,
  isEncodedImage: boolean = false
): Promise<Uint8Array | null> {
  // Skip tiny images — not worth the processing overhead
  if (imageData.byteLength < 5120) { // 5KB minimum
    return null;
  }

  if (width <= 0 || height <= 0) {
    return null;
  }

  try {
    // Calculate target dimensions (downscale oversized images)
    let targetWidth = width;
    let targetHeight = height;

    if (
      isFinite(options.maxDimension) &&
      options.maxDimension > 0 &&
      (width > options.maxDimension || height > options.maxDimension)
    ) {
      const ratio = Math.min(options.maxDimension / width, options.maxDimension / height);
      targetWidth = Math.max(1, Math.round(width * ratio));
      targetHeight = Math.max(1, Math.round(height * ratio));
    }

    // Create the canvas (OffscreenCanvas for workers, HTMLCanvasElement for main thread)
    let canvas: OffscreenCanvas | HTMLCanvasElement;
    let ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;

    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(targetWidth, targetHeight);
      ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    } else if (typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    } else {
      return null; // No canvas available
    }

    if (!ctx) return null;

    // Draw the image onto the canvas
    let drawn = false;

    // Path 1: Try createImageBitmap for already-encoded images (JPEG, PNG, etc.)
    if (isEncodedImage) {
      try {
        const blob = new Blob([imageData as any]);
        const bitmap = await createImageBitmap(blob);
        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
        bitmap.close();
        drawn = true;
      } catch {
        // Not a valid encoded image, fall through to raw pixel path
      }
    }

    // Path 2: Construct ImageData from raw pixel data
    if (!drawn) {
      try {
        const expectedRGBSize = width * height * 3;
        const expectedRGBASize = width * height * 4;
        const expectedGraySize = width * height;

        let rgbaData: Uint8ClampedArray | undefined;

        if (colorSpace === 'DeviceGray' || imageData.byteLength === expectedGraySize) {
          // Grayscale → RGBA
          rgbaData = new Uint8ClampedArray(width * height * 4);
          for (let i = 0; i < width * height; i++) {
            const gray = imageData[i] ?? 0;
            rgbaData[i * 4] = gray;
            rgbaData[i * 4 + 1] = gray;
            rgbaData[i * 4 + 2] = gray;
            rgbaData[i * 4 + 3] = 255;
          }
        } else if (colorSpace === 'DeviceCMYK' && imageData.byteLength >= width * height * 4) {
          // CMYK → RGBA (approximate conversion)
          rgbaData = new Uint8ClampedArray(width * height * 4);
          for (let i = 0; i < width * height; i++) {
            const c = imageData[i * 4] ?? 0;
            const m = imageData[i * 4 + 1] ?? 0;
            const y = imageData[i * 4 + 2] ?? 0;
            const k = imageData[i * 4 + 3] ?? 0;
            rgbaData[i * 4] = 255 * (1 - c / 255) * (1 - k / 255);
            rgbaData[i * 4 + 1] = 255 * (1 - m / 255) * (1 - k / 255);
            rgbaData[i * 4 + 2] = 255 * (1 - y / 255) * (1 - k / 255);
            rgbaData[i * 4 + 3] = 255;
          }
        } else if (imageData.byteLength >= expectedRGBASize) {
          // Already RGBA
          rgbaData = new Uint8ClampedArray(imageData.buffer, imageData.byteOffset, expectedRGBASize);
        } else if (imageData.byteLength >= expectedRGBSize) {
          // RGB → RGBA
          rgbaData = new Uint8ClampedArray(width * height * 4);
          for (let i = 0; i < width * height; i++) {
            rgbaData[i * 4] = imageData[i * 3] ?? 0;
            rgbaData[i * 4 + 1] = imageData[i * 3 + 1] ?? 0;
            rgbaData[i * 4 + 2] = imageData[i * 3 + 2] ?? 0;
            rgbaData[i * 4 + 3] = 255;
          }
        } else {
          // Unknown format — try createImageBitmap as last resort
          try {
            const blob = new Blob([imageData as any]);
            const bitmap = await createImageBitmap(blob);
            ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
            bitmap.close();
            drawn = true;
          } catch {
            return null;
          }
        }

        if (!drawn && rgbaData) {
          // Create ImageData at original dimensions, then draw scaled
          const imgData = new ImageData(rgbaData as unknown as Uint8ClampedArray<ArrayBuffer>, width, height);
          
          if (targetWidth !== width || targetHeight !== height) {
            // Draw to a temp canvas at original size, then scale
            let tempCanvas: OffscreenCanvas | HTMLCanvasElement;
            let tempCtx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
            
            if (typeof OffscreenCanvas !== 'undefined') {
              tempCanvas = new OffscreenCanvas(width, height);
              tempCtx = tempCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
            } else {
              tempCanvas = document.createElement('canvas');
              tempCanvas.width = width;
              tempCanvas.height = height;
              tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
            }
            
            if (tempCtx) {
              tempCtx.putImageData(imgData, 0, 0);
              ctx.drawImage(tempCanvas as any, 0, 0, targetWidth, targetHeight);
              drawn = true;
            }
          } else {
            ctx.putImageData(imgData, 0, 0);
            drawn = true;
          }
        }
      } catch {
        return null;
      }
    }

    if (!drawn) return null;

    // Export as JPEG
    let compressedBlob: Blob | null = null;

    if (canvas instanceof OffscreenCanvas) {
      compressedBlob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: options.quality,
      });
    } else {
      compressedBlob = await new Promise<Blob | null>((resolve) => {
        (canvas as HTMLCanvasElement).toBlob(
          (b) => resolve(b),
          'image/jpeg',
          options.quality
        );
      });
    }

    if (!compressedBlob) return null;

    const arrayBuffer = await compressedBlob.arrayBuffer();
    const compressedBytes = new Uint8Array(arrayBuffer);

    // Only return if compression actually saved space
    if (compressedBytes.byteLength >= imageData.byteLength * 0.95) {
      return null; // Less than 5% savings — not worth it
    }

    return compressedBytes;
  } catch (error) {
    console.warn('[PDFCompressor] Image compression failed:', error);
    return null;
  }
}
