import { useState, useCallback } from 'react';
import { useStore } from '@cosmic/store/useStore';
import { PDFDocument, rgb, StandardFonts, LineCapStyle } from 'pdf-lib';
import getStroke from 'perfect-freehand';
import { getSvgPathFromStroke } from '@cosmic/utils/ink';
import { PDF_PAGE_GAP } from '@cosmic/constants/canvas';
import { loadPdf } from '@cosmic/utils/storage';
import { Stroke, CanvasImage, TextNode } from '@cosmic/types';
import { getTFThemeById } from '@cosmic/constants/tfThemes';

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
                tfPageThemes,
                tfHeaderBrand,
                tfHeaderTopic,
                tfHeaderYoutube,
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
                        const theme = tfPageThemes[i] ? getTFThemeById(tfPageThemes[i]) : null;
                        const pageBg = theme ? hexToRgb(theme.bgColor) : bgColor;
                        blankPage.drawRectangle({
                            x: 0,
                            y: 0,
                            width: targetPdfWidth,
                            height: targetPdfHeight,
                            color: pageBg,
                        });
                    }
                }
            } else {
                for (let i = 0; i < pageCount; i++) {
                    const blankPage = pdfDoc.addPage([pageWidth, pageHeight]);
                    const theme = tfPageThemes[i] ? getTFThemeById(tfPageThemes[i]) : null;
                    const pageBg = theme ? hexToRgb(theme.bgColor) : bgColor;
                    blankPage.drawRectangle({
                        x: 0,
                        y: 0,
                        width: pageWidth,
                        height: pageHeight,
                        color: pageBg,
                    });
                }
            }

            const pages = pdfDoc.getPages();
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            // Load Watermarks
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let watermarkEmbed: any = null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let leftLogoEmbed: any = null;
            try {
                const wmRes = await fetch('/trickfunda-official-banner.jpeg');
                if (wmRes.ok) {
                    const wmBuffer = await wmRes.arrayBuffer();
                    watermarkEmbed = await pdfDoc.embedJpg(wmBuffer);
                }
            } catch (e) {
                console.warn('Could not load watermark banner', e);
            }
            try {
                const logoRes = await fetch('/tf-logo.jpeg');
                if (logoRes.ok) {
                    const logoBuffer = await logoRes.arrayBuffer();
                    try {
                        leftLogoEmbed = await pdfDoc.embedJpg(logoBuffer);
                    } catch {
                        // If embedJpg fails (format mismatch), re-encode through canvas
                        const blob = new Blob([logoBuffer]);
                        const blobUrl = URL.createObjectURL(blob);
                        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                            const el = new Image();
                            el.onload = () => resolve(el);
                            el.onerror = reject;
                            el.src = blobUrl;
                        });
                        const canvas = document.createElement('canvas');
                        canvas.width = 400;
                        canvas.height = 400;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            const scale = Math.min(400 / img.naturalWidth, 400 / img.naturalHeight);
                            const w = img.naturalWidth * scale;
                            const h = img.naturalHeight * scale;
                            canvas.width = w;
                            canvas.height = h;
                            ctx.drawImage(img, 0, 0, w, h);
                        }
                        URL.revokeObjectURL(blobUrl);
                        const pngDataUrl = canvas.toDataURL('image/png');
                        const pngBase64 = pngDataUrl.split(',')[1];
                        const pngBytes = Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0));
                        leftLogoEmbed = await pdfDoc.embedPng(pngBytes);
                    }
                }
            } catch (e) {
                console.warn('Could not load left logo', e);
            }

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const offsetY = i * (pageHeight + PDF_PAGE_GAP);
                
                const pdfPageWidth = page.getWidth();
                const pdfPageHeight = page.getHeight();
                
                const scaleX = pdfPageWidth / pageWidth;
                const scaleY = pdfPageHeight / pageHeight;

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

                // --- Export Strokes ---
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

                // --- Export Text Nodes ---
                const textNodesOnPage = (textNodes as TextNode[]).filter(t => 
                    t.y >= offsetY && t.y < offsetY + pageHeight
                );

                for (const t of textNodesOnPage) {
                    const localY = t.y - offsetY;
                    // Adjust Y for pdf-lib's bottom-left origin. Approximate baseline offset.
                    const textY = pdfPageHeight - (localY * scaleY) - (t.fontSize * scaleY * 0.8);
                    
                    const textContent = t.content || (t as any).text || '';
                    if (!textContent) continue;

                    try {
                        page.drawText(textContent, {
                            x: t.x * scaleX,
                            y: textY,
                            size: t.fontSize * scaleY,
                            font: helveticaFont,
                            color: hexToRgb(t.color),
                        });
                    } catch (err) {
                        // Fallback for non-WinAnsi characters (e.g. Hindi, Emojis)
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (!ctx) continue;

                        const pixelRatio = 4; // High res for sharp PDF export
                        const fontSize = t.fontSize * scaleY * pixelRatio;
                        const fontStyle = t.fontStyle || 'normal';
                        const fontWeight = t.fontWeight || 'normal';
                        const fontFamily = t.fontFamily || 'sans-serif';
                        
                        const fontString = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
                        ctx.font = fontString;

                        const lines = textContent.split('\n');
                        let maxWidth = 0;
                        const lineHeight = fontSize * 1.2;
                        for (const line of lines) {
                            maxWidth = Math.max(maxWidth, ctx.measureText(line).width);
                        }

                        const hasBg = t.backgroundColor && t.backgroundColor !== 'transparent';
                        const paddingDom = hasBg ? (t.padding || 8) : 4;
                        const padX = paddingDom * scaleX * pixelRatio;
                        const padY = paddingDom * scaleY * pixelRatio;
                        
                        canvas.width = Math.max(1, maxWidth) + padX * 2;
                        canvas.height = Math.max(1, lines.length * lineHeight) + padY * 2;
                        
                        // Must set font again after resizing canvas
                        ctx.font = fontString;
                        ctx.textBaseline = 'top';

                        if (hasBg) {
                            ctx.fillStyle = t.backgroundColor!;
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }

                        ctx.fillStyle = t.color;
                        for (let i = 0; i < lines.length; i++) {
                            ctx.fillText(lines[i], padX, padY + i * lineHeight);
                        }

                        const pngDataUrl = canvas.toDataURL('image/png');
                        const pngBase64 = pngDataUrl.split(',')[1];
                        const pngImage = await pdfDoc.embedPng(pngBase64);
                        
                        const pdfImgWidth = canvas.width / pixelRatio;
                        const pdfImgHeight = canvas.height / pixelRatio;
                        
                        page.drawImage(pngImage, {
                            // Adjust X and Y to match standard text positioning with paddings
                            x: (t.x * scaleX) - (padX / pixelRatio),
                            y: pdfPageHeight - (localY * scaleY) - pdfImgHeight,
                            width: pdfImgWidth,
                            height: pdfImgHeight,
                        });
                    }
                }

                // --- Add Watermarks / TF Branding ---
                const tfThemeId = tfPageThemes ? tfPageThemes[i] : null;
                const theme = tfThemeId ? getTFThemeById(tfThemeId) : null;

                if (theme) {
                    const HEADER_HEIGHT = 50;
                    const FOOTER_HEIGHT = 28;

                    // Header Bg
                    page.drawRectangle({
                        x: 0,
                        y: pdfPageHeight - HEADER_HEIGHT,
                        width: pdfPageWidth,
                        height: HEADER_HEIGHT,
                        color: hexToRgb(theme.headerBg),
                    });
                    
                    // Header Accent Line
                    page.drawRectangle({
                        x: 0,
                        y: pdfPageHeight - HEADER_HEIGHT - 3,
                        width: pdfPageWidth,
                        height: 3,
                        color: hexToRgb(theme.headerAccent),
                    });

                    // Footer Bg
                    page.drawRectangle({
                        x: 0,
                        y: 0,
                        width: pdfPageWidth,
                        height: FOOTER_HEIGHT,
                        color: hexToRgb(theme.footerBg),
                    });

                    // Left Logo
                    if (leftLogoEmbed) {
                        page.drawImage(leftLogoEmbed, {
                            x: 20,
                            y: pdfPageHeight - 44,
                            width: 38,
                            height: 38,
                        });
                    }

                    // Brand Text
                    const stripEmojis = (str: string) => str.replace(/[\u1000-\uFFFF]+/g, '').trim();
                    const brandTxt = stripEmojis(tfHeaderBrand || "TrickFunda");
                    try {
                        page.drawText(brandTxt, {
                            x: 68,
                            y: pdfPageHeight - 32,
                            size: 18,
                            font: helveticaFont,
                            color: hexToRgb(theme.headerAccent),
                        });
                    } catch(e) {}

                    // Topic Text
                    if (tfHeaderTopic) {
                        try {
                            const safeTopic = stripEmojis(tfHeaderTopic);
                            const topicWidth = helveticaFont.widthOfTextAtSize(safeTopic, 18);
                            page.drawText(safeTopic, {
                                x: (pdfPageWidth - topicWidth) / 2,
                                y: pdfPageHeight - 32,
                                size: 18,
                                font: helveticaFont,
                                color: hexToRgb(theme.headerAccent),
                            });
                        } catch(e) {}
                    }

                    // Youtube Text
                    const ytText = stripEmojis(tfHeaderYoutube || "youtube.com/@TrickFunda");
                    try {
                        const ytWidth = helveticaFont.widthOfTextAtSize(ytText, 12);
                        
                        // Youtube Logo SVG
                        const ytLogoPath = 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z';
                        page.drawSvgPath(ytLogoPath, {
                            x: pdfPageWidth - 20 - ytWidth - 28, // 28px padding for logo
                            y: pdfPageHeight - 13, // Top of SVG bounding box (y-down)
                            color: rgb(1, 0, 0),
                            scale: 0.8, // 24x24 slightly scaled down
                        });

                        page.drawText(ytText, {
                            x: pdfPageWidth - 20 - ytWidth,
                            y: pdfPageHeight - 30,
                            size: 12,
                            font: helveticaFont,
                            color: rgb(0.8, 0.8, 0.8),
                        });
                    } catch(e) {}

                    // Footer Text
                    const footerText = "TrickFunda | Smart Learning Platform";
                    try {
                        const fWidth = helveticaFont.widthOfTextAtSize(footerText, 10);
                        page.drawText(footerText, {
                            x: (pdfPageWidth - fWidth) / 2,
                            y: 10,
                            size: 10,
                            font: helveticaFont,
                            color: hexToRgb(theme.footerText),
                        });
                    } catch(e) {}

                    // Center Watermark (Shield Logo)
                    try {
                        const wmOpacity = theme.watermarkOpacity;
                        
                        // 1. Outer Glow Ring
                        page.drawEllipse({
                            x: pdfPageWidth / 2,
                            y: pdfPageHeight / 2,
                            xScale: 170, // 340 / 2
                            yScale: 200, // 400 / 2
                            borderColor: hexToRgb(theme.watermarkColor),
                            borderWidth: 3,
                            color: undefined,
                            borderOpacity: wmOpacity,
                        });

                        // 2. Outer Shield Shape
                        const outerShieldPath = 'M 140 0 L 280 26.4 L 280 181.5 L 238 247.5 L 140 330 L 42 247.5 L 0 181.5 L 0 26.4 Z';
                        page.drawSvgPath(outerShieldPath, {
                            x: pdfPageWidth / 2 - 140,
                            y: pdfPageHeight / 2 + 165,
                            color: hexToRgb(theme.watermarkSecondary),
                            opacity: wmOpacity * 0.5,
                        });

                        // 3. Inner Shield Shape
                        const innerShieldPath = 'M 125 0 L 250 23.68 L 250 162.8 L 212.5 222 L 125 296 L 37.5 222 L 0 162.8 L 0 23.68 Z';
                        page.drawSvgPath(innerShieldPath, {
                            x: pdfPageWidth / 2 - 125,
                            y: pdfPageHeight / 2 + 148,
                            color: hexToRgb(theme.watermarkColor),
                            opacity: wmOpacity * 0.8,
                        });

                        // 4. Top Divider
                        page.drawRectangle({
                            x: pdfPageWidth / 2 - 60,
                            y: pdfPageHeight / 2 + 82,
                            width: 120,
                            height: 2,
                            color: hexToRgb(theme.watermarkColor),
                            opacity: wmOpacity * 0.7,
                        });

                        // 5. Top Stars
                        const starPath = 'M 5 0 L 6.5 3.1 L 10 3.6 L 7.5 6 L 8 9.5 L 5 7.8 L 2 9.5 L 2.5 6 L 0 3.6 L 3.5 3.1 Z';
                        const drawStar = (xOff: number, yPos: number) => {
                            page.drawSvgPath(starPath, {
                                x: pdfPageWidth / 2 + xOff,
                                y: yPos,
                                color: hexToRgb(theme.watermarkColor),
                                opacity: wmOpacity * 0.8,
                                scale: 1.5,
                            });
                        };
                        drawStar(-35, pdfPageHeight / 2 + 75);
                        drawStar(-7.5, pdfPageHeight / 2 + 75);
                        drawStar(20, pdfPageHeight / 2 + 75);

                        // 6. TF Letters
                        const wmText1 = "TF";
                        const wmSize1 = 100;
                        const w1 = timesBoldFont.widthOfTextAtSize(wmText1, wmSize1);
                        page.drawText(wmText1, {
                            x: (pdfPageWidth - w1) / 2,
                            y: pdfPageHeight / 2 - 20, // Centered vertically in shield
                            size: wmSize1,
                            font: timesBoldFont,
                            color: hexToRgb(theme.watermarkColor),
                            opacity: wmOpacity * 1.5,
                        });

                        // 7. TRICKFUNDA Text
                        const wmText2 = "TRICKFUNDA";
                        const wmSize2 = 18;
                        const w2 = helveticaBoldFont.widthOfTextAtSize(wmText2, wmSize2);
                        page.drawText(wmText2, {
                            x: (pdfPageWidth - w2) / 2,
                            y: pdfPageHeight / 2 - 50,
                            size: wmSize2,
                            font: helveticaBoldFont,
                            color: hexToRgb(theme.watermarkColor),
                            opacity: wmOpacity * 1.5,
                        });

                        // 8. Bottom Stars
                        drawStar(-35, pdfPageHeight / 2 - 70);
                        drawStar(-7.5, pdfPageHeight / 2 - 70);
                        drawStar(20, pdfPageHeight / 2 - 70);

                        // 9. Bottom Divider
                        page.drawRectangle({
                            x: pdfPageWidth / 2 - 60,
                            y: pdfPageHeight / 2 - 95,
                            width: 120,
                            height: 2,
                            color: hexToRgb(theme.watermarkColor),
                            opacity: wmOpacity * 0.7,
                        });
                    } catch(e) {}

                } else {
                    // Standard Watermarks (Non-TF Page)
                    if (leftLogoEmbed) {
                        const leftLogoWidth = 100;
                        const leftLogoHeight = 100;
                        const paddingLeft = 20;
                        const paddingBottom = 20;
                        
                        page.drawImage(leftLogoEmbed, {
                            x: paddingLeft,
                            y: paddingBottom,
                            width: leftLogoWidth,
                            height: leftLogoHeight,
                        });
                    }

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
