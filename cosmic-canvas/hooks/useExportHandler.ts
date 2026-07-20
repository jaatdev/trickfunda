import { useState, useCallback } from 'react';
import { useStore } from '@cosmic/store/useStore';
import { PDFDocument, rgb, StandardFonts, LineCapStyle } from 'pdf-lib';
import getStroke from 'perfect-freehand';
import { getSvgPathFromStroke } from '@cosmic/utils/ink';
import { PDF_PAGE_GAP } from '@cosmic/constants/canvas';
import { loadPdf } from '@cosmic/utils/storage';
import { Stroke, CanvasImage, TextNode } from '@cosmic/types';

function hexToRgb(hex: string) {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
    const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
    const b = parseInt(cleanHex.slice(4, 6), 16) / 255;
    return rgb(r, g, b);
}

const getStrokeOptions = (size: number) => ({
    size,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    easing: (t: number) => t,
    start: { taper: 0, cap: true },
    end: { taper: size * 3, cap: true },
});

export const useExportHandler = () => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = useCallback(async () => {
        setIsExporting(true);

        try {
            const state = useStore.getState();
            const {
                strokes,
                images,
                textNodes,
                pageCount,
                projectName,
                documentId,
                canvasDimensions,
                pdfPageMapping,
                hiddenPdfPages,
                canvasBackground,
            } = state;

            const pageWidth = canvasDimensions.width;
            const pageHeight = canvasDimensions.height;
            const bgColor = canvasBackground ? hexToRgb(canvasBackground) : rgb(1, 1, 1);

            let pdfDoc = await PDFDocument.create();

            if (documentId) {
                let pdfBytes: ArrayBuffer | null = null;

                if (documentId.startsWith('http://') || documentId.startsWith('https://') || documentId.startsWith('/')) {
                    try {
                        const response = await fetch(documentId);
                        if (response.ok) {
                            pdfBytes = await response.arrayBuffer();
                        }
                    } catch (e) {
                        console.error('Failed to fetch PDF for export:', e);
                    }
                }

                if (!pdfBytes) {
                    pdfBytes = await loadPdf(documentId);
                }

                if (!pdfBytes) throw new Error('Original PDF not found in browser storage or could not be fetched');

                const originalPdf = await PDFDocument.load(pdfBytes);
                
                const effectiveMapping = pdfPageMapping && pdfPageMapping.length > 0 
                    ? pdfPageMapping 
                    : Array.from({ length: pageCount }, (_, i) => i + 1);

                const pagesToCopy = effectiveMapping
                    .filter((p: number | null) => p !== null && !(hiddenPdfPages && hiddenPdfPages.includes(p)))
                    .map((p: number | null) => (p as number) - 1);

                let copiedPages: any[] = [];
                if (pagesToCopy.length > 0) {
                    copiedPages = await pdfDoc.copyPages(originalPdf, pagesToCopy);
                }

                const firstPdfPage = originalPdf.getPage(0);
                const targetPdfWidth = firstPdfPage.getWidth();
                const targetPdfHeight = firstPdfPage.getHeight();

                let copyIndex = 0;
                for (let i = 0; i < effectiveMapping.length; i++) {
                    const pdfPageNumber = effectiveMapping[i];
                    const isHidden = hiddenPdfPages && pdfPageNumber !== null && hiddenPdfPages.includes(pdfPageNumber);

                    if (pdfPageNumber !== null && !isHidden) {
                        pdfDoc.addPage(copiedPages[copyIndex]);
                        copyIndex++;
                    } else {
                        const blankPage = pdfDoc.addPage([targetPdfWidth, targetPdfHeight]);
                        blankPage.drawRectangle({
                            x: 0,
                            y: 0,
                            width: targetPdfWidth,
                            height: targetPdfHeight,
                            color: bgColor,
                        });
                    }
                }
            } else {
                for (let i = 0; i < pageCount; i++) {
                    const blankPage = pdfDoc.addPage([pageWidth, pageHeight]);
                    blankPage.drawRectangle({
                        x: 0,
                        y: 0,
                        width: pageWidth,
                        height: pageHeight,
                        color: bgColor,
                    });
                }
            }

            const pages = pdfDoc.getPages();
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Load Watermark
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let watermarkEmbed: any = null;
            try {
                const wmRes = await fetch('/trickfunda-official-banner.jpeg');
                if (wmRes.ok) {
                    const wmBuffer = await wmRes.arrayBuffer();
                    watermarkEmbed = await pdfDoc.embedJpg(wmBuffer);
                }
            } catch (e) {
                console.warn('Could not load watermark banner', e);
            }

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const offsetY = i * (pageHeight + PDF_PAGE_GAP);
                
                const pdfPageWidth = page.getWidth();
                const pdfPageHeight = page.getHeight();
                
                const scaleX = pdfPageWidth / pageWidth;
                const scaleY = pdfPageHeight / pageHeight;

                const strokesOnPage = (strokes as Stroke[]).filter(s => 
                    s.points.some(p => p.y >= offsetY && p.y < offsetY + pageHeight)
                );

                for (const stroke of strokesOnPage) {
                    if (stroke.points.length < 2) continue;

                    const inputPoints = stroke.points.map(p => {
                        const localX = p.x;
                        const localY = p.y - offsetY;
                        const scaledX = localX * scaleX;
                        const scaledY = localY * scaleY;
                        return [scaledX, scaledY, p.pressure || 0.5] as [number, number, number];
                    });

                    const scaledSize = stroke.size * ((scaleX + scaleY) / 2);

                    // Shapes are drawn as exact lines instead of perfect-freehand ink
                    if (stroke.isShape) {
                        let shapePath = '';
                        for (let j = 0; j < inputPoints.length; j++) {
                            const [px, py] = inputPoints[j];
                            if (j === 0) shapePath += `M ${px} ${py} `;
                            else shapePath += `L ${px} ${py} `;
                        }
                        
                        page.drawSvgPath(shapePath, {
                            x: 0,
                            y: pdfPageHeight,
                            borderColor: hexToRgb(stroke.color),
                            borderWidth: scaledSize,
                            borderLineCap: LineCapStyle.Round,
                            borderOpacity: stroke.opacity ?? 1,
                        });
                        continue;
                    }

                    const strokeOutline = getStroke(inputPoints, getStrokeOptions(scaledSize));
                    const pathData = getSvgPathFromStroke(strokeOutline);

                    page.drawSvgPath(pathData, {
                        x: 0,
                        y: pdfPageHeight,
                        color: hexToRgb(stroke.isEraser ? '#ffffff' : stroke.color),
                        opacity: stroke.isHighlighter ? 0.4 : (stroke.opacity ?? 1),
                    });
                }

                // --- Export Images ---
                const imagesOnPage = (images as CanvasImage[]).filter(img => 
                    img.y >= offsetY && img.y < offsetY + pageHeight
                );

                for (const img of imagesOnPage) {
                    try {
                        let imageEmbed;
                        
                        // Fetch the image data to handle blob:, data:, and http: URLs uniformly
                        const response = await fetch(img.url);
                        const arrayBuffer = await response.arrayBuffer();

                        try {
                            // Try embedding as PNG first
                            imageEmbed = await pdfDoc.embedPng(arrayBuffer);
                        } catch (pngError) {
                            try {
                                // Fallback to JPG
                                imageEmbed = await pdfDoc.embedJpg(arrayBuffer);
                            } catch (jpgError) {
                                console.error('Image is neither valid PNG nor JPG:', jpgError);
                            }
                        }
                        
                        if (imageEmbed) {
                            page.drawImage(imageEmbed, {
                                x: img.x * scaleX,
                                y: pdfPageHeight - ((img.y - offsetY) * scaleY) - (img.height * scaleY),
                                width: img.width * scaleX,
                                height: img.height * scaleY,
                            });
                        }
                    } catch (e) {
                        console.error('Failed to embed image:', e);
                    }
                }

                // --- Export Text Nodes ---
                const textNodesOnPage = (textNodes as TextNode[]).filter(t => 
                    t.y >= offsetY && t.y < offsetY + pageHeight
                );

                for (const t of textNodesOnPage) {
                    const localY = t.y - offsetY;
                    // Adjust Y for pdf-lib's bottom-left origin. Approximate baseline offset.
                    const textY = pdfPageHeight - (localY * scaleY) - (t.fontSize * scaleY * 0.8);
                    
                    page.drawText(t.content, {
                        x: t.x * scaleX,
                        y: textY,
                        size: t.fontSize * scaleY,
                        font: helveticaFont,
                        color: hexToRgb(t.color),
                    });
                }

                // --- Add Watermark ---
                if (watermarkEmbed) {
                    const watermarkWidth = 160;
                    const watermarkHeight = 45;
                    const paddingRight = 0;
                    const paddingBottom = 0;
                    
                    page.drawImage(watermarkEmbed, {
                        x: pdfPageWidth - paddingRight - watermarkWidth,
                        y: paddingBottom,
                        width: watermarkWidth,
                        height: watermarkHeight,
                    });
                }
            }

            const pdfBytesOut = await pdfDoc.save();
            const blob = new Blob([pdfBytesOut.buffer as BlobPart], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = projectName ? `${projectName}.pdf` : 'cosmic-canvas-export.pdf';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            console.log("PDF Export Successful");

        } catch (error) {
            console.error('Export Failed:', error);
            alert('Failed to export PDF. Check console for details.');
        } finally {
            setIsExporting(false);
        }
    }, []);

    return { handleExport, isExporting };
};
