'use client';

import { useState } from 'react';
import { useStore } from '@cosmic/store/useStore';
import { Plus, Unlock } from 'lucide-react';
import { renderPdfPageToImage } from '@cosmic/utils/pdfUtils';
import { PDF_PAGE_GAP } from '@cosmic/constants/canvas';

export default function PageNavigator() {
    const {
        currentPage,
        pageCount,
        insertPageAfter,
        documentId,
        addImage,
        selectImage,
        setCanvasDimensions,
        hidePdfPage,
        canvasDimensions,
        pdfPageMapping,
    } = useStore();

    const [isLoading, setIsLoading] = useState(false);

    const handleAddPage = () => {
        insertPageAfter(currentPage - 1);
    };

    const handleUnlock = async () => {
        const { currentPage, pdfPageMapping, documentId, addImage, setCanvasDimensions, hidePdfPage, selectImage, canvasDimensions } = useStore.getState();

        // 1. Convert 1-based Page to 0-based Index
        const mapIndex = currentPage - 1;

        // 2. Safety Check: Bounds validation
        if (mapIndex < 0 || mapIndex >= pdfPageMapping.length) {
            console.error("Unlock Error: Page index out of bounds", { currentPage, mapIndex, mappingLength: pdfPageMapping.length });
            alert("Cannot unlock: Page index out of bounds.");
            return;
        }

        // 3. Get PDF Page Index (1-based from mapping)
        const pdfPageIndex = pdfPageMapping[mapIndex];

        // 4. Check if it is a PDF page (not null/blank)
        if (pdfPageIndex === null || pdfPageIndex === undefined) {
            alert("This is already a blank page.");
            return;
        }

        // 5. Validate document exists
        if (!documentId) {
            console.warn("No PDF document loaded.");
            alert("No PDF document to unlock.");
            return;
        }

        setIsLoading(true);

        try {
            // 6. Render Image (Fetch the single page PDF first)
            const pageUrl = `/documents/${documentId}/pages/${pdfPageIndex}.pdf`;
            const res = await fetch(pageUrl);
            const blob = await res.blob();
            const singlePageFile = new File([blob], 'page.pdf', { type: 'application/pdf' });
            
            // Pass index 0 because it's a single-page PDF
            const img = await renderPdfPageToImage(singlePageFile, 0);

            // 7. Adjust Y coordinate for the current page
            const pageHeight = canvasDimensions.height;
            // Use mapIndex (view position) for Y calculation
            const pageTop = mapIndex * (pageHeight + PDF_PAGE_GAP);
            img.y += pageTop;

            // 8. Update Store
            addImage(img);
            hidePdfPage(mapIndex); // Store the 0-based mapIndex
            selectImage(img.id); // Auto-select

        } catch (e) {
            console.error("Unlock failed", e);
            alert("Could not detach page. " + (e instanceof Error ? e.message : String(e)));
        } finally {
            setIsLoading(false);
        }
    };

    const hasPdf = documentId !== null;

    return (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 
            px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-xl"
        >
            <span className="text-white/80 font-mono text-sm">
                Page {Math.min(currentPage, pageCount)} <span className="text-white/40">/</span> {pageCount}
            </span>

            <div className="w-px h-4 bg-white/20" />

            <button
                onClick={handleAddPage}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Insert Page Below"
            >
                <Plus className="w-4 h-4 text-white/60 hover:text-white" />
            </button>

            {hasPdf && (
                <>
                    <div className="w-px h-4 bg-white/20" />
                    <button
                        onClick={handleUnlock}
                        disabled={isLoading}
                        className={`p-1 rounded-full transition-colors ${isLoading
                            ? 'opacity-50 cursor-wait'
                            : 'hover:bg-white/10'
                            }`}
                        title="Unlock Page (Detach PDF to Image)"
                    >
                        <Unlock className={`w-4 h-4 ${isLoading
                            ? 'text-white/30 animate-pulse'
                            : 'text-white/60 hover:text-white'
                            }`} />
                    </button>
                </>
            )}
        </div>
    );
}
