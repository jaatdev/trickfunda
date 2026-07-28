'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@cosmic/store/useStore';
import { X, Maximize, MoreVertical, Copy, Eraser, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDF_PAGE_GAP } from '@cosmic/constants/canvas';
import getStroke from 'perfect-freehand';
import { getSvgPathFromStroke } from '@cosmic/utils/ink';
import { Document, pdfjs } from 'react-pdf';
import { loadPdf } from '@cosmic/utils/storage';
import LazyPdfPage from './LazyPdfPage';

// Dynamically set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function GridView() {
    const {
        isGridView,
        setIsGridView,
        pageCount,
        currentPage,
        setCurrentPage,
        pdfPageMapping,
        canvasDimensions,
        strokes,
        canvasBackground,
        movePage,
        documentId,
        duplicatePage,
        clearPage,
        deletePage,
    } = useStore();

    const activeCardRef = useRef<HTMLDivElement>(null);
    const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);
    const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

    // Drag and Drop state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
        if (isGridView && activeCardRef.current) {
            // Delay to ensure DOM is ready
            setTimeout(() => {
                activeCardRef.current?.scrollIntoView({
                    behavior: 'auto',
                    block: 'center',
                });
            }, 100);
        }
    }, [isGridView]);

    // Load PDF Blob when grid opens
    useEffect(() => {
        if (!isGridView || !documentId) {
            if (!documentId && pdfFileUrl) {
                URL.revokeObjectURL(pdfFileUrl);
                setPdfFileUrl(null);
            }
            return;
        }

        let isMounted = true;
        
        const fetchPdf = async () => {
            try {
                const buffer = await loadPdf(documentId);
                if (buffer && isMounted) {
                    const blob = new Blob([buffer], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    setPdfFileUrl(url);
                }
            } catch (error) {
                console.error("Failed to load PDF for Grid View:", error);
            }
        };

        if (!pdfFileUrl) {
            fetchPdf();
        }

        return () => {
            isMounted = false;
        };
    }, [isGridView, documentId]);

    // Cleanup URL on unmount
    useEffect(() => {
        return () => {
            if (pdfFileUrl) {
                URL.revokeObjectURL(pdfFileUrl);
            }
        };
    }, [pdfFileUrl]);

    if (!isGridView) return null;

    const handlePageClick = (index: number) => {
        // Update current page
        setCurrentPage(index + 1);

        // Close grid
        setIsGridView(false);

        // Scroll to page
        const gap = PDF_PAGE_GAP;
        const pageHeight = canvasDimensions.height;
        const scrollToY = index * (pageHeight + gap);

        // Instant jump
        window.scrollTo({
            top: scrollToY,
            behavior: 'auto',
        });
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            movePage(draggedIndex, index);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const renderGridCards = () => {
        return Array.from({ length: pageCount }).map((_, index) => {
            const pageNum = index + 1;
            const isActive = pageNum === currentPage;

            // Calculate page bounds
            const pageHeight = canvasDimensions.height;
            const pageTop = index * (pageHeight + PDF_PAGE_GAP);
            const pageBottom = pageTop + pageHeight;

            // Filter strokes for this page
            const pageStrokes = strokes.filter((s) => {
                const firstPoint = s.points[0];
                return firstPoint && firstPoint.y >= pageTop && firstPoint.y < pageBottom;
            });

            // Determine page type (PDF Page or Blank)
            const mappingExists = pdfPageMapping && pdfPageMapping.length > 0;
            const pdfPageNum = mappingExists ? pdfPageMapping[index] : null;
            const isBlank = mappingExists && pdfPageNum === null;
            const isPdf = mappingExists && pdfPageNum !== null;

            const isDragged = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
                <div
                    key={index}
                    ref={isActive ? activeCardRef : null}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`group relative aspect-[1/1.414] rounded-lg transition-all duration-200 
                        ${isActive
                            ? 'ring-4 ring-blue-500 scale-105 shadow-2xl shadow-blue-500/20'
                            : 'hover:scale-105 hover:ring-2 hover:ring-white/20'
                        }
                        ${isDragged ? 'opacity-30 scale-95' : 'opacity-100'}
                        ${isDragOver && draggedIndex !== null && index > draggedIndex ? 'border-r-4 border-blue-500 mr-[-4px]' : ''}
                        ${isDragOver && draggedIndex !== null && index < draggedIndex ? 'border-l-4 border-blue-500 ml-[-4px]' : ''}
                        bg-[#2a2a2a] overflow-hidden cursor-grab active:cursor-grabbing
                    `}
                >
                    <button
                        onClick={() => handlePageClick(index)}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                        {/* Thumbnail Container */}
                        <div
                            className="absolute inset-4 rounded shadow-inner overflow-hidden"
                            style={{ backgroundColor: canvasBackground }}
                        >
                            {/* PDF Background (if PDF page) */}
                            {isPdf && (
                                <div className="absolute inset-0 z-0 bg-white shadow-sm flex items-center justify-center">
                                    {pdfFileUrl ? (
                                        <LazyPdfPage pageNumber={pdfPageNum!} width={200} />
                                    ) : (
                                        <div className="w-full h-full animate-pulse bg-black/5" />
                                    )}
                                </div>
                            )}

                            {/* Blank Page Indicator */}
                            {isBlank && (
                                <div className="absolute inset-0 z-0 bg-white shadow-sm flex items-center justify-center">
                                    <div className="text-gray-300 text-xs font-medium border-2 border-dashed border-gray-200 rounded p-2">
                                        Blank
                                    </div>
                                </div>
                            )}

                            {/* Ink Strokes (Mini-Map) - Using viewBox to crop the view */}
                            {pageStrokes.length > 0 && (
                                <svg
                                    viewBox={`0 ${pageTop} ${canvasDimensions.width} ${canvasDimensions.height}`}
                                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                                    preserveAspectRatio="xMidYMid meet"
                                >
                                    {pageStrokes.map((stroke) => {
                                        // Generate stroke outline using perfect-freehand
                                        const outlinePoints = getStroke(
                                            stroke.points.map((p) => [p.x, p.y, p.pressure || 0.5]),
                                            {
                                                size: stroke.size,
                                                thinning: 0.5,
                                                smoothing: 0.5,
                                                streamline: 0.5,
                                            }
                                        );

                                        const pathData = getSvgPathFromStroke(outlinePoints);

                                        return (
                                            <path
                                                key={stroke.id}
                                                d={pathData}
                                                fill={stroke.color}
                                                fillOpacity={stroke.isHighlighter ? 0.4 : 1}
                                                stroke="none"
                                            />
                                        );
                                    })}
                                </svg>
                            )}
                        </div>

                        {/* Semi-transparent overlay for non-active pages */}
                        {!isActive && (
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-20 pointer-events-none" />
                        )}

                        {/* Active Indicator (if active) */}
                                    {isActive && (
                                        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 z-30" />
                                    )}

                                    {/* Badges */}
                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-2 z-30 pointer-events-none">
                                        {isPdf && (
                                            <span className="px-2 py-1 bg-blue-500/80 text-white text-[10px] font-bold rounded-full uppercase tracking-wider backdrop-blur-sm shadow-sm">
                                                PDF Page {pdfPageNum}
                                            </span>
                                        )}
                                        {isBlank && (
                                            <span className="px-2 py-1 bg-white/10 text-white/60 text-[10px] font-bold rounded-full uppercase tracking-wider backdrop-blur-sm border border-white/10">
                                                Blank
                                            </span>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm py-1 z-30">
                                        <span className={`text-xs font-mono
                                            ${isActive ? 'text-blue-400 font-bold' : 'text-white/60'}
                                        `}>
                                            Page {pageNum}
                                        </span>
                                    </div>
                                </button>
                                
                                {/* Context Menu Button */}
                                <div className="absolute top-2 left-2 z-40">
                                    <button
                                        className={`p-1.5 rounded-md backdrop-blur-md transition-all duration-200
                                            ${activeMenuIndex === index 
                                                ? 'bg-blue-500 text-white opacity-100' 
                                                : 'bg-black/40 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-black/60 hover:text-white'
                                            }
                                        `}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuIndex(activeMenuIndex === index ? null : index);
                                        }}
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {/* Context Menu Dropdown */}
                                    <AnimatePresence>
                                        {activeMenuIndex === index && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="absolute top-10 left-0 w-44 bg-[#2a2a2a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button onClick={() => { duplicatePage(index); setActiveMenuIndex(null); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white text-left transition-colors">
                                                    <Copy className="w-4 h-4" /> Duplicate
                                                </button>
                                                <button onClick={() => { clearPage(index); setActiveMenuIndex(null); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white text-left transition-colors">
                                                    <Eraser className="w-4 h-4" /> Clear Content
                                                </button>
                                                <div className="h-px bg-white/10" />
                                                <button onClick={() => { deletePage(index); setActiveMenuIndex(null); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 text-left transition-colors">
                                                    <Trash2 className="w-4 h-4" /> Delete Page
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        );
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#1e1e1e]/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
                <h2 className="text-2xl font-serif text-white/90 flex items-center gap-3">
                    <Maximize className="w-6 h-6 text-blue-400" />
                    Navigate Universe
                </h2>
                <button
                    onClick={() => setIsGridView(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                >
                    <X className="w-8 h-8" />
                </button>
            </div>

            {/* Grid Container */}
            <div className="flex-1 overflow-y-auto p-8">
                {pdfFileUrl ? (
                    <Document file={pdfFileUrl} className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                            {renderGridCards()}
                        </div>
                    </Document>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 max-w-7xl mx-auto">
                        {renderGridCards()}
                    </div>
                )}
            </div>
        </div>
    );
}
