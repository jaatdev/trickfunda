'use client';

import { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useStore } from '@cosmic/store/useStore';
import { PDF_PAGE_GAP } from '@cosmic/constants/canvas';
import { loadPdf } from '@cosmic/utils/storage';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Dynamically set the worker source to match the installed version
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Virtualization window: render pages within this range of current page
const RENDER_WINDOW = 2;

export default function PDFLayer() {
    const {
        documentId,
        pageCount,
        currentPage,
        pdfPageMapping,
        canvasDimensions,
        hiddenPdfPages,
    } = useStore();

    const [isClient, setIsClient] = useState(false);
    const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
    
    // Get dynamic dimensions from store
    const pageWidth = canvasDimensions.width;
    const pageHeight = canvasDimensions.height;

    useEffect(() => {
        setIsClient(true);
        if (documentId) {
            if (documentId.startsWith('http://') || documentId.startsWith('https://') || documentId.startsWith('/')) {
                // Fetch directly if it's a URL
                fetch(documentId)
                    .then(r => r.arrayBuffer())
                    .then(buffer => {
                        setPdfData(new Uint8Array(buffer));
                    })
                    .catch(err => {
                        console.error('Failed to load PDF from URL:', err);
                    });
            } else {
                loadPdf(documentId).then(buffer => {
                    if (buffer) {
                        setPdfData(new Uint8Array(buffer));
                    }
                });
            }
        }
    }, [documentId]);

    // Calculate visible page range based on current page
    const { minPage, maxPage } = useMemo(() => {
        return {
            minPage: Math.max(0, currentPage - 1 - RENDER_WINDOW),
            maxPage: Math.min(pageCount, currentPage + RENDER_WINDOW),
        };
    }, [currentPage, pageCount]);

    const fileProp = useMemo(() => {
        return pdfData ? { data: pdfData } : null;
    }, [pdfData]);

    // Don't render on server or if no document
    if (!isClient || !documentId) return null;

    // Use mapping if available, otherwise fall back to default order
    const effectiveMapping = pdfPageMapping.length > 0
        ? pdfPageMapping
        : Array.from({ length: pageCount }, (_, i) => i + 1);

    if (!pdfData) {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 bg-black/60 p-6 rounded-2xl backdrop-blur-md">
                    <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-white/80 font-medium">Loading PDF from browser storage...</span>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: pageWidth,
                height: (pageHeight * pageCount) + (PDF_PAGE_GAP * Math.max(0, pageCount - 1)),
                zIndex: 1,
                pointerEvents: 'none',
                overflow: 'hidden',  
            }}
        >
            <Document
                file={fileProp as any}
                className="pointer-events-none"
                loading={
                    <div className="absolute inset-0 z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 bg-black/60 p-6 rounded-2xl backdrop-blur-md">
                            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                            <span className="text-white/80 font-medium">Parsing Document...</span>
                        </div>
                    </div>
                }
                error={
                    <div className="absolute inset-0 z-50 flex items-center justify-center">
                        <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/20 text-red-400">
                            Failed to load PDF document
                        </div>
                    </div>
                }
            >
                {/* Virtualized PDF page rendering */}
                {effectiveMapping.map((pdfPageNumber, index) => {
                    const isInViewport = index >= minPage && index < maxPage;
                    const isHidden = pdfPageNumber !== null && hiddenPdfPages.includes(pdfPageNumber);

                    // Skip non-PDF pages or hidden/out-of-viewport pages inside <Document>
                    if (pdfPageNumber === null || isHidden || !isInViewport) {
                        return null;
                    }

                    const pageTop = index * (pageHeight + PDF_PAGE_GAP);

                    return (
                        <div
                            key={`pdf_page_${pdfPageNumber}`}
                            style={{
                                position: 'absolute',
                                top: pageTop,
                                left: 0,
                                width: pageWidth, 
                                height: pageHeight,
                                overflow: 'hidden',
                                backgroundColor: 'white',
                            }}
                        >
                            <Page
                                key={`page_${index}_${pdfPageNumber}`}
                                pageNumber={pdfPageNumber}
                                width={pageWidth}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="mb-[20px] shadow-lg pointer-events-none"
                                loading={
                                    <div
                                        style={{
                                            width: pageWidth,
                                            height: pageHeight,
                                            backgroundColor: 'white',
                                        }}
                                        className="mb-[20px] shadow-lg animate-pulse pointer-events-none"
                                    />
                                }
                                devicePixelRatio={Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1)}
                            />
                        </div>
                    );
                })}
            </Document>

            {/* Render Placeholders and Blank Pages outside of <Document> */}
            {effectiveMapping.map((pdfPageNumber, index) => {
                const isInViewport = index >= minPage && index < maxPage;
                const isHidden = pdfPageNumber !== null && hiddenPdfPages.includes(pdfPageNumber);
                const pageTop = index * (pageHeight + PDF_PAGE_GAP);

                // Hidden pages or out-of-viewport placeholders
                if (pdfPageNumber !== null && (isHidden || !isInViewport)) {
                    return (
                        <div
                            key={`placeholder_${index}`}
                            style={{
                                position: 'absolute',
                                top: pageTop,
                                left: 0,
                                width: pageWidth,
                                height: pageHeight,
                                backgroundColor: isHidden ? 'transparent' : 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                            }}
                        >
                            {!isHidden && (
                                <div className="text-white/20 font-medium text-lg">
                                    Page {index + 1}
                                </div>
                            )}
                        </div>
                    );
                }

                // Blank Page (Hybrid PDF) 
                if (pdfPageNumber === null) {
                    return (
                        <div
                            key={`blank_${index}`}
                            style={{
                                position: 'absolute',
                                top: pageTop,
                                left: 0,
                                width: pageWidth,
                                height: pageHeight,
                            }}
                        />
                    );
                }

                return null;
            })}
        </div>
    );
}
