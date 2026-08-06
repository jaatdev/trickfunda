'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@cosmic/store/useStore';
import { 
    X, Maximize, MoreVertical, Copy, Eraser, Trash2,
    CheckCircle2, LayoutGrid, FileImage, Star, Eye,
    Square, Grid2x2, Grid3x3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDF_PAGE_GAP } from '@cosmic/constants/canvas';
import getStroke from 'perfect-freehand';
import { getSvgPathFromStroke } from '@cosmic/utils/ink';
import { Document, pdfjs } from 'react-pdf';
import { loadPdf } from '@cosmic/utils/storage';
import LazyPdfPage from './LazyPdfPage';
import { getTFThemeById } from '@cosmic/constants/tfThemes';

// Dynamically set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function GridView() {
    const {
        isGridView, setIsGridView, pageCount, currentPage, setCurrentPage,
        pdfPageMapping, canvasDimensions, strokes, canvasBackground, movePage,
        selectedGridPages, bookmarkedPages, gridFilter, gridZoomLevel,
        toggleGridPageSelection, clearGridSelection, togglePageBookmark,
        setGridFilter, setGridZoomLevel, deleteSelectedGridPages,
        documentId, duplicatePage, clearPage, deletePage,
        tfPageThemes
    } = useStore();

    const activeCardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);
    const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    // Drag and Drop state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
        if (isGridView && activeCardRef.current) {
            // Delay to ensure DOM is ready
            setTimeout(() => {
                activeCardRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 100);
            setFocusedIndex(currentPage - 1);
        } else {
            clearGridSelection();
            setFocusedIndex(null);
            setActiveMenuIndex(null);
        }
    }, [isGridView, currentPage]);

    // Keyboard navigation
    useEffect(() => {
        if (!isGridView) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsGridView(false);
                return;
            }

            if (focusedIndex === null) return;

            let cols = 6;
            if (gridZoomLevel === 'small') cols = 8;
            if (gridZoomLevel === 'large') cols = 4;

            const maxIndex = pageCount - 1;

            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    setFocusedIndex(prev => Math.min(maxIndex, (prev ?? 0) + 1));
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    setFocusedIndex(prev => Math.max(0, (prev ?? 0) - 1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex(prev => Math.min(maxIndex, (prev ?? 0) + cols));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex(prev => Math.max(0, (prev ?? 0) - cols));
                    break;
                case 'Enter':
                    e.preventDefault();
                    handlePageClick(focusedIndex);
                    break;
                case ' ':
                    e.preventDefault();
                    toggleGridPageSelection(focusedIndex, true);
                    break;
                case 'Delete':
                case 'Backspace':
                    if (selectedGridPages.length > 0) {
                        e.preventDefault();
                        deleteSelectedGridPages();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isGridView, focusedIndex, pageCount, gridZoomLevel, selectedGridPages]);

    // Load PDF Blob when grid opens, cleanup when it closes
    useEffect(() => {
        let isMounted = true;
        let activeUrl: string | null = null;

        if (!isGridView || !documentId) {
            setPdfFileUrl(null);
            return;
        }
        
        const fetchPdf = async () => {
            try {
                const buffer = await loadPdf(documentId);
                if (buffer && isMounted) {
                    const blob = new Blob([buffer], { type: 'application/pdf' });
                    activeUrl = URL.createObjectURL(blob);
                    setPdfFileUrl(activeUrl);
                }
            } catch (error) {
                console.error("Failed to load PDF for Grid View:", error);
            }
        };

        fetchPdf();

        return () => {
            isMounted = false;
            if (activeUrl) {
                URL.revokeObjectURL(activeUrl);
            }
        };
    }, [isGridView, documentId]);



    if (!isGridView) return null;

    const handlePageClick = (index: number, e?: React.MouseEvent) => {
        if (e && (e.ctrlKey || e.metaKey || e.shiftKey)) {
            toggleGridPageSelection(index, true);
            setFocusedIndex(index);
            return;
        }

        // Update current page
        setCurrentPage(index + 1);

        // Close grid
        setIsGridView(false);

        // Scroll to page
        const gap = PDF_PAGE_GAP;
        const pageHeight = canvasDimensions.height;
        const scrollToY = index * (pageHeight + gap);

        // Instant jump
        document.getElementById('cosmic-canvas-desk')?.scrollTo({
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
        // Prepare pages
        const pages = Array.from({ length: pageCount }).map((_, index) => {
            const mappingExists = pdfPageMapping && pdfPageMapping.length > 0;
            const pdfPageNum = mappingExists ? pdfPageMapping[index] : null;
            const isPdf = mappingExists && pdfPageNum !== null;
            const isBlank = mappingExists && pdfPageNum === null;
            return { index, isPdf, isBlank, pdfPageNum };
        });

        // Filter pages
        const filteredPages = pages.filter((page) => {
            if (gridFilter === 'all') return true;
            if (gridFilter === 'pdf') return page.isPdf;
            if (gridFilter === 'blank') return page.isBlank || (!page.isPdf && !page.isBlank);
            if (gridFilter === 'bookmarked') return bookmarkedPages.includes(page.index);
            return true;
        });

        return (
            <AnimatePresence>
                {filteredPages.map((page) => {
                    const { index, isPdf, isBlank, pdfPageNum } = page;
                    const pageNum = index + 1;
                    const isActive = pageNum === currentPage;
                    const isSelected = selectedGridPages.includes(index);
                    const isBookmarked = bookmarkedPages.includes(index);
                    const isFocused = focusedIndex === index;

                    // Calculate page bounds
                    const pageHeight = canvasDimensions.height;
                    const pageTop = index * (pageHeight + PDF_PAGE_GAP);
                    const pageBottom = pageTop + pageHeight;

                    // Filter strokes for this page
                    const pageStrokes = strokes.filter((s) => {
                        const firstPoint = s.points[0];
                        return firstPoint && firstPoint.y >= pageTop && firstPoint.y < pageBottom;
                    });

                    const isDragged = draggedIndex === index;
                    const isDragOver = dragOverIndex === index;

                    const tfThemeId = tfPageThemes?.[index];
                    const tfTheme = tfThemeId ? getTFThemeById(tfThemeId) : null;
                    const cardBgColor = tfTheme ? tfTheme.bgColor : canvasBackground;

                    return (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            key={index}
                            ref={isActive ? activeCardRef : null}
                            draggable
                            onDragStart={(e: any) => handleDragStart(e, index)}
                            onDragOver={(e: any) => handleDragOver(e, index)}
                            onDragLeave={() => setDragOverIndex(null)}
                            onDragEnd={handleDragEnd}
                            onDrop={(e: any) => handleDrop(e, index)}
                            onClick={(e: any) => handlePageClick(index, e)}
                            style={{ aspectRatio: `${canvasDimensions.width} / ${canvasDimensions.height}` }}
                            className={`group relative rounded-lg transition-all duration-200 
                                ${isActive ? 'ring-4 ring-blue-500 scale-105 shadow-2xl shadow-blue-500/20' : 'hover:scale-105 hover:ring-2 hover:ring-white/20'}
                                ${isSelected ? 'ring-4 ring-indigo-400 bg-indigo-500/10 scale-105' : 'bg-[#2a2a2a]'}
                                ${isFocused ? 'ring-2 ring-white' : ''}
                                ${isDragged ? 'opacity-30 scale-95' : 'opacity-100'}
                                ${isDragOver && draggedIndex !== null && index > draggedIndex ? 'border-r-4 border-blue-500 mr-[-4px]' : ''}
                                ${isDragOver && draggedIndex !== null && index < draggedIndex ? 'border-l-4 border-blue-500 ml-[-4px]' : ''}
                                overflow-hidden cursor-pointer active:cursor-grabbing
                            `}
                        >
                            {/* Selection Checkmark */}
                            {isSelected && (
                                <div className="absolute top-3 left-3 z-30 bg-indigo-500 text-white rounded-full p-1 shadow-lg">
                                    <CheckCircle2 size={16} />
                                </div>
                            )}

                            {/* Bookmark Star Indicator */}
                            {isBookmarked && (
                                <div className="absolute top-3 right-3 z-30 text-yellow-400 drop-shadow-md">
                                    <Star size={18} fill="currentColor" />
                                </div>
                            )}

                            {/* Thumbnail Container */}
                        <div
                            className="absolute inset-0 rounded-lg shadow-inner overflow-hidden"
                            style={{ backgroundColor: cardBgColor }}
                        >
                            {/* TF Theme Header/Footer Preview */}
                            {tfTheme && (
                                <>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4%', backgroundColor: tfTheme.headerBg, borderBottom: `2px solid ${tfTheme.headerAccent}` }} />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2%', backgroundColor: tfTheme.footerBg, borderTop: `1px solid ${tfTheme.footerText}40` }} />
                                </>
                            )}
                            {/* PDF Background (if PDF page) */}
                            {isPdf && (
                                <div className="absolute inset-0 z-0 shadow-sm flex items-center justify-center">
                                    {pdfFileUrl ? (
                                        <LazyPdfPage pageNumber={pdfPageNum!} />
                                    ) : (
                                        <div className="w-full h-full animate-pulse bg-black/5" />
                                    )}
                                </div>
                            )}

                            {/* Blank Page Indicator */}
                            {isBlank && (
                                <div className="absolute inset-0 z-0 shadow-sm flex items-center justify-center">
                                    {pageStrokes.length === 0 && (
                                        <div className="text-white text-xs font-medium border-2 border-dashed border-white rounded p-2 opacity-50 mix-blend-difference">
                                            Blank
                                        </div>
                                    )}
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
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        );
    };

    // Top Toolbar for Grid View
    const renderToolbar = () => (
        <div className="sticky top-0 z-50 bg-[#2a2a2a] border-b border-white/10 px-6 py-4 flex items-center justify-between relative">
            <div className="flex items-center gap-6 z-10">
                <div className="flex items-center gap-3">
                    <LayoutGrid className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Grid Overview</span>
                    <span className="text-white/40 text-sm">|</span>
                    <span className="text-white/60 text-sm">{pageCount} pages</span>
                </div>
                
                {/* Filters */}
                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg">
                    {(['all', 'pdf', 'blank', 'bookmarked'] as const).map(filter => (
                        <button
                            key={filter}
                            onClick={() => setGridFilter(filter)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                gridFilter === filter 
                                    ? 'bg-blue-500/20 text-blue-400' 
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Center Area: Zoom and Close (Flows naturally to prevent overlap with filters) */}
            <div className="flex items-center gap-4 z-20 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/10 shadow-xl shrink-0">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1">
                    {(['large', 'medium', 'small'] as const).map(level => {
                        const Icon = level === 'large' ? Square : level === 'medium' ? Grid2x2 : Grid3x3;
                        return (
                        <button
                            key={level}
                            onClick={() => setGridZoomLevel(level)}
                            className={`p-2 rounded-xl transition-all ${
                                gridZoomLevel === level 
                                ? 'bg-blue-500/30 text-blue-300 shadow-inner' 
                                : 'text-white/40 hover:text-white/90 hover:bg-white/10'
                            }`}
                            title={`Zoom ${level}`}
                        >
                            <Icon className="w-4 h-4" />
                        </button>
                    )})}
                </div>

                <div className="w-px h-6 bg-white/20 mx-1" />

                <button
                    onClick={() => setIsGridView(false)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-colors flex items-center gap-2"
                >
                    <X className="w-5 h-5" />
                    <span className="text-sm font-bold pr-1">Exit Grid</span>
                </button>
            </div>

            {/* Right Area: Context menu for selections */}
            <div className="flex items-center justify-end min-w-[200px] z-10">
                <AnimatePresence>
                    {selectedGridPages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-2 bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/30"
                        >
                            <span className="text-indigo-300 text-sm font-medium mr-2">
                                {selectedGridPages.length} selected
                            </span>
                            <button 
                                onClick={deleteSelectedGridPages}
                                className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-md transition-colors tooltip-trigger"
                                title="Delete Selected"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={clearGridSelection}
                                className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded-md transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    // Grid layout class based on zoom
    const getGridCols = () => {
        switch (gridZoomLevel) {
            case 'small': return 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4';
            case 'large': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12';
            case 'medium':
            default: return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8';
        }
    };

    return (
        <AnimatePresence>
            {isGridView && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] bg-[#1e1e1e] flex flex-col overflow-hidden"
                    onClick={() => {
                        setActiveMenuIndex(null);
                        clearGridSelection();
                    }}
                >
                    {renderToolbar()}

                    {/* Scrollable Container */}
                    <div 
                        ref={containerRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden p-8 scroll-smooth"
                    >
                        {pdfFileUrl ? (
                            <Document 
                                file={pdfFileUrl}
                                loading={<div className="flex items-center justify-center p-8 text-white/50">Loading Grid View...</div>}
                                error={<div className="flex items-center justify-center p-8 text-red-400">Failed to load Grid View PDF</div>}
                            >
                                <motion.div layout className={`grid ${getGridCols()} max-w-[1600px] mx-auto pb-32`}>
                                    {renderGridCards()}
                                </motion.div>
                            </Document>
                        ) : (
                            <motion.div layout className={`grid ${getGridCols()} max-w-[1600px] mx-auto pb-32`}>
                                {renderGridCards()}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
