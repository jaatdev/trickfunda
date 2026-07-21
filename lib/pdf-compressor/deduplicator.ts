import { PDFDocument, PDFStream } from 'pdf-lib';
import { computeHash } from './utils';

export async function findDuplicateStreams(pdfDoc: PDFDocument): Promise<Map<string, any>> {
  const hashes = new Map<string, any>();
  const duplicateMap = new Map<any, any>();

  const objects = pdfDoc.context.enumerateIndirectObjects();
  
  for (const [ref, obj] of objects) {
    if (obj instanceof PDFStream) {
      try {
        const bytes = obj.getContentsString();
        const buffer = new TextEncoder().encode(bytes).buffer;
        const hash = await computeHash(buffer);

        if (hashes.has(hash)) {
          duplicateMap.set(ref, hashes.get(hash));
        } else {
          hashes.set(hash, ref);
        }
      } catch (e) {
        // Skip streams that can't be read easily
      }
    }
  }

  return duplicateMap;
}

export async function deduplicateStreams(pdfDoc: PDFDocument, duplicateMap: Map<any, any>): Promise<number> {
  let savedBytes = 0;
  
  for (const [duplicateRef, canonicalRef] of duplicateMap.entries()) {
    try {
      pdfDoc.context.delete(duplicateRef);
      savedBytes += 1024;
    } catch (e) {
      // Ignore
    }
  }

  return savedBytes;
}
