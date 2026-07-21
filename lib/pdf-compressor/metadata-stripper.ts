import { PDFDocument, PDFName } from 'pdf-lib';

export async function stripMetadata(pdfDoc: PDFDocument): Promise<number> {
  let savedBytes = 0;

  try {
    // Strip Document Info
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');
    pdfDoc.setKeywords([]);

    // Remove XMP Metadata
    const catalog = pdfDoc.catalog;
    if (catalog.has(PDFName.of('Metadata'))) {
      catalog.delete(PDFName.of('Metadata'));
      savedBytes += 2048; // Estimate
    }

    if (catalog.has(PDFName.of('PieceInfo'))) {
      catalog.delete(PDFName.of('PieceInfo'));
      savedBytes += 512;
    }

  } catch (error) {
    console.warn('Failed to strip some metadata:', error);
  }

  return savedBytes;
}
