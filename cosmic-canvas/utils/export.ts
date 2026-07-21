import { jsPDF } from 'jspdf';
import getStroke from 'perfect-freehand';
import { getSvgPathFromStroke } from './ink';
import { Stroke, CanvasImage, Pattern, ExportConfig } from '@cosmic/types';
import { PDF_PAGE_GAP } from '@cosmic/constants/canvas';
import { useStore } from '@cosmic/store/useStore';
// Types missing from pdfjs-dist 4.x
type PDFDocumentProxy = any;

// pdfjs worker is configured lazily on first use (see initPdfWorker)
let pdfjsWorkerInitialized = false;

/**
 * Initialize pdfjs worker source (called once before PDF operations)
 */
const initPdfWorker = async (): Promise<typeof import('react-pdf')['pdfjs']> => {
    const { pdfjs } = await import('react-pdf');
    if (!pdfjsWorkerInitialized) {
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
        pdfjsWorkerInitialized = true;
    }
    return pdfjs;
};

// perfect-freehand options
const getStrokeOptions = (size: number) => ({
    size,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    easing: (t: number) => t,
    start: { taper: 0, cap: true },
    end: { taper: size * 3, cap: true },
});

/**
 * Get pattern color based on background brightness
 */
const getPatternColor = (backgroundColor: string): string => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) || 255;
    const g = parseInt(hex.substr(2, 2), 16) || 255;
    const b = parseInt(hex.substr(4, 2), 16) || 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
};

/**
 * Draw pattern on PDF page using jsPDF lines
 */
const drawPatternOnPdf = (
    pdf: jsPDF,
    pattern: Pattern,
    width: number,
    height: number,
    backgroundColor: string
) => {
    if (pattern === 'none') return;

    const color = getPatternColor(backgroundColor);
    // Parse rgba to get opacity-adjusted color
    const isLight = color.includes('255,255,255');
    const lineColor = isLight ? 220 : 30;
    pdf.setDrawColor(lineColor, lineColor, lineColor);
    pdf.setLineWidth(0.5);

    switch (pattern) {
        case 'grid':
            for (let x = 0; x <= width; x += 40) {
                pdf.line(x, 0, x, height);
            }
            for (let y = 0; y <= height; y += 40) {
                pdf.line(0, y, width, y);
            }
            break;

        case 'dots':
            const dotColor = isLight ? 220 : 30;
            pdf.setFillColor(dotColor, dotColor, dotColor);
            for (let x = 20; x < width; x += 20) {
                for (let y = 20; y < height; y += 20) {
                    pdf.circle(x, y, 1.5, 'F');
                }
            }
            break;

        case 'lines':
            for (let y = 40; y <= height; y += 40) {
                pdf.line(0, y, width, y);
            }
            break;

        case 'isometric':
            // 60° triangular grid
            for (let x = 0; x <= width + 86.6; x += 86.6) {
                for (let y = 0; y <= height + 100; y += 100) {
                    pdf.line(x, y, x + 43.3, y + 50);
                    pdf.line(x + 86.6, y, x + 43.3, y + 50);
                    pdf.line(x + 43.3, y - 50, x + 43.3, y + 50);
                }
            }
            break;

        case 'music':
            // 5-line staves every 200px
            for (let staveY = 20; staveY < height; staveY += 200) {
                for (let line = 0; line < 5; line++) {
                    const y = staveY + line * 20;
                    if (y < height) {
                        pdf.line(0, y, width, y);
                    }
                }
            }
            break;

        case 'cornell':
            // Cue column at 200px
            pdf.setLineWidth(1);
            pdf.line(200, 0, 200, height);
            // Summary line 200px from bottom
            pdf.line(0, height - 200, width, height - 200);
            break;
    }
};

/**
 * Draw stroke on canvas (for rasterizing ink layer)
 */
const drawStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: Stroke,
    offsetY: number = 0
) => {
    if (stroke.points.length < 2) return;

    // Set transparency for highlighters
    const wasHighlighter = stroke.isHighlighter;
    if (wasHighlighter) {
        ctx.globalAlpha = 0.4; // Slightly more transparent than on-screen for better print result
    }

    if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.globalCompositeOperation = 'source-over';
    }

    // Handle shape strokes with clean lines
    if (stroke.isShape) {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = wasHighlighter ? 'butt' : 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y - offsetY);
        for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y - offsetY);
        }
        ctx.stroke();
        if (wasHighlighter) {
            ctx.globalAlpha = 1.0;
            ctx.lineCap = 'round';
        }
        return;
    }

    // Highlighter strokes: use simple line drawing for chisel tip feel
    if (wasHighlighter) {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y - offsetY);
        for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y - offsetY);
        }
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.lineCap = 'round';
        return;
    }

    // Freehand strokes with perfect-freehand
    const inputPoints = stroke.points.map(p => [p.x, p.y - offsetY, p.pressure]);
    const strokeOutline = getStroke(inputPoints, getStrokeOptions(stroke.size));
    const pathData = getSvgPathFromStroke(strokeOutline);
    const path = new Path2D(pathData);

    ctx.fillStyle = stroke.isEraser ? '#000000' : stroke.color;
    ctx.fill(path);
};

/**
 * Load image and determine format
 */
const loadImageWithFormat = async (url: string): Promise<{ img: HTMLImageElement; format: 'PNG' | 'JPEG' }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // Determine format from URL or default to PNG
            const format = url.toLowerCase().includes('jpg') || url.toLowerCase().includes('jpeg') ? 'JPEG' : 'PNG';
            resolve({ img, format });
        };
        img.onerror = reject;
        img.src = url;
    });
};

/**
 * Render a PDF page to a canvas using a pre-loaded PDF document.
 * This is optimized to reuse the already-parsed document across pages.
 * 
 * @param pdfDocument - Pre-loaded PDFDocumentProxy (loaded ONCE before loop)
 * @param pageNumber - 1-based PDF page number
 * @param width - Target canvas width
 * @param height - Target canvas height
 */
const renderPdfPageToCanvas = async (
    pdfDocument: PDFDocumentProxy,
    pageNumber: number,
    width: number,
    height: number
): Promise<HTMLCanvasElement> => {
    const page = await pdfDocument.getPage(pageNumber);

    // Get natural viewport and scale to fit target dimensions
    const naturalViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(width / naturalViewport.width, height / naturalViewport.height);
    const scaledViewport = page.getViewport({ scale });

    // Create canvas at target dimensions
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Failed to get canvas context');

    // Center the PDF page on canvas (in case aspect ratios differ)
    const offsetX = (width - scaledViewport.width) / 2;
    const offsetY = (height - scaledViewport.height) / 2;

    ctx.translate(offsetX, offsetY);

    // Render PDF page to canvas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: ctx, viewport: scaledViewport } as any).promise;

    return canvas;
};

/**
 * Export canvas content to multi-page PDF with dynamic screen dimensions
 * 
 * COMPOSITE EXPORT: Renders PDF backgrounds FIRST, then overlays strokes.
 * PDF document is loaded ONCE before the loop for performance.
 */
export const exportToPdf = async (
    strokes: Stroke[],
    images: CanvasImage[],
    config: ExportConfig
): Promise<void> => {
    const { pageCount, projectName, background, pattern, pdfFile, pdfPageMapping, hiddenPdfPages } = config;

    // Get dynamic canvas dimensions from store
    const { canvasDimensions } = useStore.getState();
    const pageWidth = canvasDimensions.width;
    const pageHeight = canvasDimensions.height;

    // Load PDF document ONCE if we have a PDF file (hoisted for performance)
    let pdfDocument: PDFDocumentProxy | null = null;
    if (pdfFile) {
        try {
            const pdfjs = await initPdfWorker();
            const arrayBuffer = await pdfFile.arrayBuffer();
            pdfDocument = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        } catch (error) {
            console.error('Failed to load PDF for export:', error);
            // Continue without PDF background
        }
    }

    // Create PDF with dynamic dimensions (matches screen size)
    const pdf = new jsPDF({
        orientation: canvasDimensions.width > canvasDimensions.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pageWidth, pageHeight], // EXACT MATCH to screen
    });

    // Process each page
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        // Canvas Y position includes gaps between pages
        const pageY = pageIndex * (pageHeight + PDF_PAGE_GAP);

        // Add new page if not first
        if (pageIndex > 0) {
            pdf.addPage([pageWidth, pageHeight], canvasDimensions.width > canvasDimensions.height ? 'landscape' : 'portrait');
        }

        // Layer 1: Background color
        const bgHex = background.replace('#', '');
        const r = parseInt(bgHex.substr(0, 2), 16) || 255;
        const g = parseInt(bgHex.substr(2, 2), 16) || 255;
        const b = parseInt(bgHex.substr(4, 2), 16) || 255;
        pdf.setFillColor(r, g, b);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Layer 2: Pattern
        drawPatternOnPdf(pdf, pattern, pageWidth, pageHeight, background);

        // Layer 3: PDF Background (NEW - Composite Export)
        // Render PDF page if: we have a document AND this page maps to a PDF page AND it's not hidden
        const pdfPageNumber = pdfPageMapping?.[pageIndex]; // 1-based PDF page number or null
        const isHiddenPage = hiddenPdfPages?.includes(pdfPageNumber as number);

        if (pdfDocument && pdfPageNumber !== null && pdfPageNumber !== undefined && !isHiddenPage) {
            try {
                const pdfCanvas = await renderPdfPageToCanvas(pdfDocument, pdfPageNumber, pageWidth, pageHeight);
                // Use JPEG with compression for PDF backgrounds (much smaller than PNG)
                const pdfDataUrl = pdfCanvas.toDataURL('image/jpeg', 0.85);
                pdf.addImage(pdfDataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
            } catch (error) {
                console.warn(`Failed to render PDF page ${pdfPageNumber} for export, continuing without it:`, error);
                // Continue export without this PDF page background
            }
        }

        // Layer 4: User Images (DIRECT to PDF for quality preservation)
        for (const img of images) {
            const imgTop = img.y;
            const imgBottom = img.y + img.height;
            const pageTop = pageY;
            const pageBottom = pageY + pageHeight;

            if (imgBottom > pageTop && imgTop < pageBottom) {
                try {
                    const { img: loadedImg, format } = await loadImageWithFormat(img.url);
                    // Add image directly to PDF - preserves original quality
                    pdf.addImage(
                        loadedImg,
                        format,
                        img.x,
                        img.y - pageY,
                        img.width,
                        img.height
                    );
                } catch (error) {
                    console.warn(`Failed to load image ${img.id}:`, error);
                }
            }
        }

        // Layer 5: Ink strokes (rasterize only the ink, not images)
        // Use 1.5x resolution (good balance of quality vs file size)
        const inkScale = 1.5;
        const inkCanvas = document.createElement('canvas');
        inkCanvas.width = pageWidth * inkScale;
        inkCanvas.height = pageHeight * inkScale;
        const ctx = inkCanvas.getContext('2d');

        if (ctx) {
            ctx.scale(inkScale, inkScale);

            // Only strokes visible on this page
            let hasStrokes = false;
            for (const stroke of strokes) {
                const strokeMinY = Math.min(...stroke.points.map(p => p.y));
                const strokeMaxY = Math.max(...stroke.points.map(p => p.y));

                if (strokeMaxY > pageY && strokeMinY < pageY + pageHeight) {
                    drawStroke(ctx, stroke, pageY);
                    hasStrokes = true;
                }
            }
            ctx.globalCompositeOperation = 'source-over';

            // Only add ink layer if there are strokes on this page
            if (hasStrokes) {
                // Use PNG for ink to preserve transparency, but only when needed
                const inkData = inkCanvas.toDataURL('image/png');
                pdf.addImage(inkData, 'PNG', 0, 0, pageWidth, pageHeight);
            }
        }

        // Layer 6: Watermark
        try {
            // Use the same dimensions and padding as the UI WatermarkLayer
            const watermarkUrl = '/trickfunda-official-banner.jpeg';
            const { img: loadedLogo, format: logoFormat } = await loadImageWithFormat(watermarkUrl);
            
            const watermarkWidth = 160;
            const watermarkHeight = 45;
            const paddingRight = 0;
            const paddingBottom = 0;

            pdf.addImage(
                loadedLogo,
                logoFormat,
                pageWidth - paddingRight - watermarkWidth,
                pageHeight - paddingBottom - watermarkHeight,
                watermarkWidth,
                watermarkHeight
            );
        } catch (error) {
            console.warn('Failed to render PDF watermark:', error);
        }

        // Layer 7: Full Page YouTube Link
        try {
            pdf.link(0, 0, pageWidth, pageHeight, { url: 'https://www.youtube.com/@TrickFunda' });
        } catch (error) {
            console.warn('Failed to add PDF link:', error);
        }
    }

    // Save PDF
    pdf.save(`${projectName}.pdf`);
};

export default exportToPdf;
