import { PDFDocument, PDFName, PDFDict, PDFStream } from 'pdf-lib';
import { PDFAnalysis, PageDetail } from './types';

export async function analyzePDF(pdfBytes: ArrayBuffer): Promise<PDFAnalysis> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const totalPages = pdfDoc.getPageCount();
  const pageDetails: PageDetail[] = [];
  
  let totalImages = 0;
  let totalFonts = 0;

  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
    const resources = page.node.get(PDFName.of('Resources'));
    
    let pageImageCount = 0;
    let pageFontCount = 0;

    if (resources instanceof PDFDict) {
      const xObjects = resources.get(PDFName.of('XObject'));
      if (xObjects instanceof PDFDict) {
        for (const [name, ref] of xObjects.entries()) {
          const xObj = pdfDoc.context.lookup(ref);
          if (xObj instanceof PDFStream) {
            const subtype = xObj.dict.get(PDFName.of('Subtype'));
            if (subtype === PDFName.of('Image')) {
              pageImageCount++;
              totalImages++;
            }
          }
        }
      }

      const fonts = resources.get(PDFName.of('Font'));
      if (fonts instanceof PDFDict) {
        pageFontCount += fonts.entries().length;
        totalFonts += fonts.entries().length;
      }
    }

    pageDetails.push({
      pageNumber: i + 1,
      imageCount: pageImageCount,
      fontCount: pageFontCount
    });
  }

  const estimatedCompressedSize = pdfBytes.byteLength * 0.5;

  return {
    totalPages,
    totalImages,
    totalFonts,
    estimatedCompressedSize,
    hasEncryption: pdfDoc.isEncrypted,
    fileSize: pdfBytes.byteLength,
    pageDetails
  };
}
