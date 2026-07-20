import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { generateSvgPath } from './InkGeometry';
import { Stroke, TextNode } from '@cosmic/types';
import { PDF_PAGE_GAP } from '@cosmic/constants/canvas';

/**
 * PDFExportEngine.ts
 * "The Publisher"
 * 
 * Responsible for converting the vector "Beast" strokes and React text nodes 
 * into a high-fidelity PDF document.
 * 
 * Features:
 * - Vector-perfect rendering (SVG Paths)
 * - Coordinate system normalization (Canvas Top-Left -> PDF Bottom-Left)
 * - Smart Layering (Background PDF + Ink + Text)
 * - Multi-page support with PDF_PAGE_GAP handling
 */

// Helper: Convert Hex color (#RRGGBB) to pdf-lib RGB (0-1 range)
const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
};

/**
 * Determine which page a canvas Y coordinate belongs to
 * @param canvasY - Y position on the infinite canvas
 * @param pageHeight - Height of each page
 * @returns pageIndex (0-based)
 */
const getPageIndexForY = (canvasY: number, pageHeight: number): number => {
    const singlePageTotal = pageHeight + PDF_PAGE_GAP;
    return Math.floor(canvasY / singlePageTotal);
};

/**
 * Convert canvas Y to page-local Y (accounting for gaps)
 * @param canvasY - Y position on the infinite canvas
 * @param pageIndex - Which page this Y belongs to
 * @param pageHeight - Height of each page
 * @returns Y position relative to the page's top
 */
const getLocalY = (canvasY: number, pageIndex: number, pageHeight: number): number => {
    const singlePageTotal = pageHeight + PDF_PAGE_GAP;
    const pageTop = pageIndex * singlePageTotal;
    return canvasY - pageTop;
};

export const generatePDF = async (
    strokes: Stroke[],
    textNodes: TextNode[],
    backgroundPdfBytes?: ArrayBuffer,
    canvasSize: { w: number, h: number } = { w: 800, h: 600 },
    layoutPageHeight: number = 1123  // Canvas layout page height (A4 default: 1123px)
): Promise<Uint8Array> => {

    // 1. Initialize Document
    const pdfDoc = await PDFDocument.create();

    // Register fontkit to support custom fonts if needed in future
    pdfDoc.registerFontkit(fontkit);

    let pages: PDFPage[] = [];
    let pdfPageHeight: number;  // Actual PDF page height
    let pdfPageWidth: number;   // Actual PDF page width

    // 2. Setup Pages (Scenario A vs B)
    if (backgroundPdfBytes) {
        // Scenario B: Uploaded PDF - copy all pages
        const srcDoc = await PDFDocument.load(backgroundPdfBytes);
        const copiedPages = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices());

        copiedPages.forEach((cp) => {
            pdfDoc.addPage(cp);
        });

        pages = pdfDoc.getPages();

        // Use the first page dimensions as reference for new pages
        const { width, height } = pages[0].getSize();
        pdfPageWidth = width;
        pdfPageHeight = height;

    } else {
        // Scenario A: Blank Canvas - create a single page initially
        const page = pdfDoc.addPage([canvasSize.w, canvasSize.h]);
        pages = [page];
        pdfPageWidth = canvasSize.w;
        pdfPageHeight = canvasSize.h;
    }

    // Determine total pages needed based on strokes and text
    // Use layoutPageHeight for canvas coordinate calculations
    let maxPageIndex = 0;
    for (const stroke of strokes) {
        if (stroke.points.length > 0) {
            const minY = Math.min(...stroke.points.map(p => p.y));
            const maxY = Math.max(...stroke.points.map(p => p.y));
            maxPageIndex = Math.max(maxPageIndex, getPageIndexForY(maxY, layoutPageHeight));
            maxPageIndex = Math.max(maxPageIndex, getPageIndexForY(minY, layoutPageHeight));
        }
    }
    for (const node of textNodes) {
        maxPageIndex = Math.max(maxPageIndex, getPageIndexForY(node.y, layoutPageHeight));
    }

    // Ensure we have enough pages (for blank canvas scenario)
    while (pages.length <= maxPageIndex) {
        const newPage = pdfDoc.addPage([pdfPageWidth, pdfPageHeight]);
        pages.push(newPage);
    }

    // 3. Embed font for text (do once)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 4. Render Strokes (Vector "Beast" Layer) - draw on correct pages
    for (const stroke of strokes) {
        if (stroke.points.length < 2) continue;

        // Find which page(s) this stroke spans (use layoutPageHeight for canvas coords)
        const minY = Math.min(...stroke.points.map(p => p.y));
        const maxY = Math.max(...stroke.points.map(p => p.y));
        const startPage = getPageIndexForY(minY, layoutPageHeight);
        const endPage = getPageIndexForY(maxY, layoutPageHeight);

        // For each page the stroke touches, render the relevant portion
        for (let pageIdx = startPage; pageIdx <= endPage && pageIdx < pages.length; pageIdx++) {
            const page = pages[pageIdx];
            const currentPdfPageHeight = page.getSize().height;

            // TRANSFORM: Canvas (Top-Left 0,0) -> PDF (Bottom-Left 0,0)
            // Also account for page offset with gaps using layoutPageHeight
            const transformedPoints = stroke.points.map(p => {
                const localY = getLocalY(p.y, pageIdx, layoutPageHeight);
                return {
                    ...p,
                    x: p.x,
                    y: currentPdfPageHeight - localY  // Flip for PDF coordinate system
                };
            });

            // Generate SVG Path String using "Beast Geometry" with transformed points
            const pathData = generateSvgPath(transformedPoints, stroke.size);

            // Skip empty paths
            if (!pathData) continue;

            // Convert color
            const strokeColor = hexToRgb(stroke.color);

            // Draw the stroke
            page.drawSvgPath(pathData, {
                color: strokeColor,
                opacity: stroke.isHighlighter ? 0.5 : 1,
            });
        }
    }

    // 5. Render Text (Real Text Layer) - draw on correct pages
    for (const node of textNodes) {
        const pageIdx = getPageIndexForY(node.y, layoutPageHeight);

        if (pageIdx < 0 || pageIdx >= pages.length) continue;

        const page = pages[pageIdx];
        const currentPdfPageHeight = page.getSize().height;

        // Convert to page-local coordinates using layoutPageHeight
        const localY = getLocalY(node.y, pageIdx, layoutPageHeight);

        // PDF Y = PageHeight - LocalY - FontSize baseline adjustment
        const pdfY = currentPdfPageHeight - localY - (node.fontSize * 0.75);

        page.drawText(node.content, {
            x: node.x,
            y: pdfY,
            size: node.fontSize,
            font: font,
            color: hexToRgb(node.color),
        });
    }

    // 6. Output
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};
