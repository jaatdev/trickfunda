'use client';

import { useStore, CanvasImage, ShapeType, Pattern } from '@cosmic/store/useStore';
import { useExportHandler } from '@cosmic/hooks/useExportHandler';
import { PAGE_HEIGHT, PAGE_WIDTH } from '@cosmic/constants/canvas';
import { TF_PAGE_THEMES } from '@cosmic/constants/tfThemes';
import {
    Pencil,
    Eraser,
    Trash2,
    Grid3X3,
    Circle,
    Minus,
    Plus,
    Paintbrush,
    Maximize,
    Minimize,
    Undo2,
    Redo2,
    Image as ImageIcon,
    Hand,
    Download,
    ZoomIn,
    X,
    FilePlus,
    FileMinus,
    Copy,
    Square,
    Triangle,
    MoveRight,
    Shapes,
    Type,
    Lasso,
    Box,
    Music,
    AlignJustify,
    Layout,
    FileX2,
    Highlighter,
    BookOpen,
    LayoutGrid,
    Wand2,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';

type ActivePanel = 'none' | 'pen' | 'eraser' | 'bg' | 'zoom' | 'shape' | 'text' | 'highlighter' | 'tfpage';

// Smart Scale: Calculate dimensions to fit viewport
const calculateSmartScale = (
    naturalWidth: number,
    naturalHeight: number,
    viewportWidth: number,
    viewportHeight: number
): { width: number; height: number; x: number; y: number } => {
    const maxWidth = Math.min(600, viewportWidth * 0.5);
    const maxHeight = viewportHeight * 0.6;

    const aspectRatio = naturalWidth / naturalHeight;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }

    const x = (viewportWidth - width) / 2;
    const y = (viewportHeight - height) / 2;

    return { width, height, x, y };
};

// Generate unique ID
const generateId = () => `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Toolbar Component - The Gravity Dock (Bottom-Center)
 * 
 * Mac-style dock with grouped tools, upward panels, and auto-close behavior.
 */
export default function Toolbar() {
    const {
        currentTool,
        penColor,
        penWidth,
        eraserWidth,
        canvasBackground,
        canvasPattern,
        historyStack,
        redoStack,
        strokes,
        images,
        projectName,
        pageCount,
        zoom,
        isFullscreen,
        activeShape,
        setTool,
        setPenColor,
        setPenWidth,
        setEraserWidth,
        setCanvasBackground,
        setCanvasPattern,
        setShape,
        addImage,
        addPage,
        insertPageAfter,
        deletePage,
        duplicatePage,
        clearPage,
        undo,
        redo,
        clearCanvas,
        zoomIn,
        zoomOut,
        resetZoom,
        setIsFullscreen,
        currentPage,
        activeFont,
        activeFontSize,
        activeFontWeight,
        activeFontStyle,
        activeTextBackground,
        setFont,
        setFontSize,
        setFontWeight,
        setFontStyle,
        setTextBackground,
        resetProject,
        highlighterColor,
        highlighterWidth,
        setHighlighterColor,
        setHighlighterWidth,
        pdfPageMapping,
        fitToScreen,
        setIsGridView,
        isOverlayMode,
        insertTFPage,
        defaultTFThemeId,
        setDefaultTFThemeId,
    } = useStore();

    const penColorRef = useRef<HTMLInputElement>(null);
    const bgColorRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const panelTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [activePanel, setActivePanel] = useState<ActivePanel>('none');
    const [isDefaultMode, setIsDefaultMode] = useState(!!defaultTFThemeId);

    useEffect(() => {
        setIsDefaultMode(!!defaultTFThemeId);
    }, [defaultTFThemeId]);
    const { handleExport, isExporting } = useExportHandler();

    const isPen = currentTool === 'pen';
    const isEraser = currentTool === 'eraser';
    const isSelect = currentTool === 'select';
    const isShape = currentTool === 'shape';
    const isText = currentTool === 'text';
    const isLasso = currentTool === 'lasso';
    const isHighlighter = currentTool === 'highlighter';
    const canUndoAction = historyStack.length > 0;
    const canRedoAction = redoStack.length > 0;

    // Shape definitions for the shapes panel
    const shapes: { id: ShapeType; icon: React.ReactNode; label: string }[] = [
        { id: 'rectangle', icon: <Square className="w-4 h-4" />, label: 'Rectangle' },
        { id: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circle' },
        { id: 'triangle', icon: <Triangle className="w-4 h-4" />, label: 'Triangle' },
        { id: 'line', icon: <Minus className="w-4 h-4" />, label: 'Line' },
        { id: 'arrow', icon: <MoveRight className="w-4 h-4" />, label: 'Arrow' },
    ];

    const patterns: { id: Pattern; icon: React.ReactNode; label: string }[] = [
        { id: 'none', icon: <X className="w-4 h-4" />, label: 'None' },
        { id: 'grid', icon: <Grid3X3 className="w-4 h-4" />, label: 'Grid' },
        { id: 'dots', icon: <Circle className="w-4 h-4" />, label: 'Dots' },
        { id: 'lines', icon: <AlignJustify className="w-4 h-4" />, label: 'Ruled' },
        { id: 'isometric', icon: <Box className="w-4 h-4" />, label: 'Iso' },
        { id: 'music', icon: <Music className="w-4 h-4" />, label: 'Music' },
        { id: 'cornell', icon: <Layout className="w-4 h-4" />, label: 'Cornell' },
    ];

    // Track fullscreen state (syncs with Esc key exit)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [setIsFullscreen]);

    // Auto-close panel after 3 seconds of inactivity
    const resetPanelTimer = useCallback(() => {
        if (panelTimerRef.current) {
            clearTimeout(panelTimerRef.current);
        }
        panelTimerRef.current = setTimeout(() => {
            setActivePanel('none');
        }, 3000);
    }, []);

    // Start timer when panel opens
    useEffect(() => {
        if (activePanel !== 'none') {
            resetPanelTimer();
        }
        return () => {
            if (panelTimerRef.current) {
                clearTimeout(panelTimerRef.current);
            }
        };
    }, [activePanel, resetPanelTimer]);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
            // Trigger immersion lock after transition
            setTimeout(() => {
                fitToScreen();
            }, 100);
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    }, [fitToScreen]);

    // Image upload handler - centers on current page
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (!dataUrl) return;

            const img = new Image();

            img.onload = () => {
                // 1. Get Dynamic Dimensions (The actual screen size captured in Step 41)
                const { currentPage, canvasDimensions, addImage } = useStore.getState();

                // 2. Smart Scaling (Max 50% of screen width)
                const maxW = canvasDimensions.width * 0.5;
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                let width = img.naturalWidth;
                let height = img.naturalHeight;

                if (width > maxW) {
                    width = maxW;
                    height = maxW / aspectRatio;
                }

                // 3. DYNAMIC CENTER X
                // Use canvasDimensions.width, NOT the A4 constant
                const x = (canvasDimensions.width / 2) - (width / 2);

                // 4. DYNAMIC CENTER Y
                // Use canvasDimensions.height
                const gap = 20; // PDF_PAGE_GAP
                const singlePageHeight = canvasDimensions.height + gap;
                const pageTop = (currentPage - 1) * singlePageHeight;

                const y = pageTop + (canvasDimensions.height / 2) - (height / 2);

                const canvasImage: CanvasImage = {
                    id: generateId(),
                    url: dataUrl,
                    x,
                    y,
                    width,
                    height,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                };

                addImage(canvasImage);
            };

            img.src = dataUrl;
        };

        reader.readAsDataURL(file);
        e.target.value = '';
    }, []);

    // Delete Page Handler
    const handleDeletePage = useCallback(() => {
        if (confirm(`Delete Page ${currentPage}? This cannot be undone.`)) {
            deletePage(currentPage - 1);
        }
    }, [deletePage, currentPage]);

    // Insert Page Handler
    const handleInsertPage = useCallback(() => {
        insertPageAfter(currentPage - 1);
    }, [insertPageAfter, currentPage]);

    // Duplicate Page Handler
    const handleDuplicatePage = useCallback(() => {
        duplicatePage(currentPage - 1);
    }, [duplicatePage, currentPage]);

    // Clear Page Handler
    const handleClearPage = useCallback(() => {
        if (confirm(`Clear all content on Page ${currentPage}? This cannot be undone.`)) {
            clearPage(currentPage - 1);
        }
    }, [clearPage, currentPage]);

    // Tool handlers
    const handlePenClick = () => {
        if (isPen) {
            setActivePanel(activePanel === 'pen' ? 'none' : 'pen');
        } else {
            setTool('pen');
            setActivePanel('pen');
        }
    };

    const handleEraserClick = () => {
        if (isEraser) {
            setActivePanel(activePanel === 'eraser' ? 'none' : 'eraser');
        } else {
            setTool('eraser');
            setActivePanel('eraser');
        }
    };

    const handleSelectClick = () => {
        setTool('select');
        setActivePanel('none');
    };

    const handleHighlighterClick = () => {
        if (isHighlighter) {
            setActivePanel(activePanel === 'highlighter' ? 'none' : 'highlighter');
        } else {
            setTool('highlighter');
            setActivePanel('highlighter');
        }
    };

    const handleBgClick = () => {
        setActivePanel(activePanel === 'bg' ? 'none' : 'bg');
    };

    const handleZoomClick = () => {
        setActivePanel(activePanel === 'zoom' ? 'none' : 'zoom');
    };

    const handlePatternSelect = (pattern: Pattern) => {
        setCanvasPattern(pattern);
        setActivePanel('none');
    };

    const handleShapeClick = () => {
        if (isShape) {
            setActivePanel(activePanel === 'shape' ? 'none' : 'shape');
        } else {
            setShape(activeShape); // This sets tool to 'shape'
            setActivePanel('shape');
        }
    };

    const handleShapeSelect = (shape: ShapeType) => {
        setShape(shape);
        setActivePanel('none');
    };

    const handleTextClick = () => {
        if (isText) {
            setActivePanel(activePanel === 'text' ? 'none' : 'text');
        } else {
            setTool('text');
            setActivePanel('text');
        }
    };

    const handleLassoClick = () => {
        setTool('lasso');
        setActivePanel('none');
    };

    // Panel interaction keeps it open
    const handlePanelInteraction = () => {
        resetPanelTimer();
    };

    // Render floating panel (opens UPWARD from dock)
    const renderPanel = () => {
        if (activePanel === 'none') return null;

        return (
            <div
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2
                    p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl min-w-[180px] max-w-[90vw] max-h-[60vh] overflow-y-auto scrollbar-hide"
                onPointerMove={handlePanelInteraction}
                onPointerDown={handlePanelInteraction}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* Pen Settings Panel */}
                {activePanel === 'pen' && (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-white/60 uppercase tracking-wider font-medium">Pen</span>
                            <button
                                onClick={() => setActivePanel('none')}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-3 h-3 text-white/40" />
                            </button>
                        </div>

                        {/* Color Picker */}
                        <div className="flex items-center gap-3 mb-4">
                            <button
                                onClick={() => penColorRef.current?.click()}
                                className="w-10 h-10 rounded-xl border-2 border-white/30 
                                    hover:border-white/50 transition-all hover:scale-110 shadow-lg"
                                style={{ backgroundColor: penColor }}
                                title="Pen Color"
                            />
                            <input
                                ref={penColorRef}
                                type="color"
                                value={penColor}
                                onChange={(e) => setPenColor(e.target.value)}
                                className="sr-only"
                            />
                            <span className="text-xs text-white/50 font-mono uppercase">{penColor}</span>
                        </div>

                        {/* Size Slider */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-white/50">Size</span>
                                <span className="text-xs text-white/70 font-mono">{penWidth}px</span>
                            </div>
                            <input
                                type="range"
                                min={1}
                                max={50}
                                value={penWidth}
                                onChange={(e) => setPenWidth(parseInt(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer
                                    bg-white/20 accent-white"
                            />
                        </div>
                    </>
                )}

                {/* Eraser Settings Panel */}
                {activePanel === 'eraser' && (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-white/60 uppercase tracking-wider font-medium">Eraser</span>
                            <button
                                onClick={() => setActivePanel('none')}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-3 h-3 text-white/40" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-white/50">Size</span>
                                <span className="text-xs text-white/70 font-mono">{eraserWidth}px</span>
                            </div>
                            <input
                                type="range"
                                min={5}
                                max={100}
                                value={eraserWidth}
                                onChange={(e) => setEraserWidth(parseInt(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer
                                    bg-white/20 accent-white"
                            />
                        </div>
                    </>
                )}

                {/* Highlighter Settings Panel */}
                {activePanel === 'highlighter' && (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-white/60 uppercase tracking-wider font-medium">Highlighter</span>
                            <button
                                onClick={() => setActivePanel('none')}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-3 h-3 text-white/40" />
                            </button>
                        </div>

                        {/* Neon Color Palette */}
                        <div className="flex gap-2 mb-4">
                            {[
                                { color: '#ffff00', label: 'Yellow' },
                                { color: '#00ff00', label: 'Green' },
                                { color: '#ff00ff', label: 'Pink' },
                                { color: '#00ffff', label: 'Cyan' },
                            ].map((item) => (
                                <button
                                    key={item.color}
                                    onClick={() => setHighlighterColor(item.color)}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${highlighterColor === item.color
                                        ? 'border-white ring-2 ring-white/30'
                                        : 'border-white/30 hover:border-white/50'
                                        }`}
                                    style={{ backgroundColor: item.color }}
                                    title={item.label}
                                />
                            ))}
                        </div>

                        {/* Size Slider */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-white/50">Thickness</span>
                                <span className="text-xs text-white/70 font-mono">{highlighterWidth}px</span>
                            </div>
                            <input
                                type="range"
                                min={10}
                                max={50}
                                value={highlighterWidth}
                                onChange={(e) => setHighlighterWidth(parseInt(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer
                                    bg-white/20 accent-yellow-400"
                            />
                        </div>
                    </>
                )}

                {/* Background Settings Panel */}
                {activePanel === 'bg' && (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-white/60 uppercase tracking-wider font-medium">Paper</span>
                            <button
                                onClick={() => setActivePanel('none')}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-3 h-3 text-white/40" />
                            </button>
                        </div>

                        {/* Background Color */}
                        <div className="flex items-center gap-3 mb-4">
                            <button
                                onClick={() => bgColorRef.current?.click()}
                                className="w-10 h-10 rounded-xl border-2 border-white/30 
                                    hover:border-white/50 transition-all hover:scale-110 shadow-lg"
                                style={{ backgroundColor: canvasBackground }}
                                title="Paper Color"
                            />
                            <input
                                ref={bgColorRef}
                                type="color"
                                value={canvasBackground}
                                onChange={(e) => setCanvasBackground(e.target.value)}
                                className="sr-only"
                            />
                            <span className="text-xs text-white/50 font-mono uppercase">{canvasBackground}</span>
                        </div>

                        {/* Pattern Selector */}
                        <div className="space-y-2">
                            <span className="text-xs text-white/50">Pattern</span>
                            <div className="grid grid-cols-4 gap-2">
                                {patterns.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handlePatternSelect(p.id)}
                                        className={`p-3 sm:p-2 touch-manipulation rounded-lg transition-all hover:scale-110 ${canvasPattern === p.id
                                            ? 'bg-white/25 ring-2 ring-white/50'
                                            : 'bg-white/10 hover:bg-white/15'
                                            }`}
                                        title={p.label}
                                    >
                                        <span className={canvasPattern === p.id ? 'text-white' : 'text-white/60'}>
                                            {p.icon}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Shapes Panel */}
                {activePanel === 'shape' && (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-white/60 uppercase tracking-wider font-medium">Shapes</span>
                            <button
                                onClick={() => setActivePanel('none')}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-3 h-3 text-white/40" />
                            </button>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                            {shapes.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => handleShapeSelect(s.id)}
                                    className={`p-3 rounded-lg transition-all hover:scale-110 ${activeShape === s.id
                                        ? 'bg-white/25 ring-2 ring-white/50'
                                        : 'bg-white/10 hover:bg-white/15'
                                        }`}
                                    title={s.label}
                                >
                                    <span className={activeShape === s.id ? 'text-white' : 'text-white/60'}>
                                        {s.icon}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-white/40 mt-3 text-center">
                            Hold Shift for perfect shapes
                        </p>
                    </>
                )}

                {/* Text Settings Panel */}
                {activePanel === 'text' && (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-white/60 uppercase tracking-wider font-medium">Text Format</span>
                            <button
                                onClick={() => setActivePanel('none')}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-3 h-3 text-white/40" />
                            </button>
                        </div>

                        {/* Font Family */}
                        <div className="mb-4">
                            <select
                                value={activeFont}
                                onChange={(e) => setFont(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg text-white p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Inter" className="bg-gray-900 text-white">Inter (Sans)</option>
                                <option value="Playfair Display" className="bg-gray-900 text-white">Playfair (Serif)</option>
                                <option value="Caveat" className="bg-gray-900 text-white">Caveat (Hand)</option>
                                <option value="JetBrains Mono" className="bg-gray-900 text-white">JetBrains (Mono)</option>
                            </select>
                        </div>

                        {/* Font Size Slider */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-white/50">Size</span>
                                <span className="text-xs text-white/70 font-mono">{activeFontSize}px</span>
                            </div>
                            <input
                                type="range"
                                min={12}
                                max={120}
                                value={activeFontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/20 accent-blue-500"
                            />
                        </div>

                        {/* Text Styles */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFontWeight(activeFontWeight === 'bold' ? 'normal' : 'bold')}
                                className={`flex-1 p-2 rounded-lg font-bold transition-all ${activeFontWeight === 'bold' ? 'bg-white/25 ring-2 ring-white/50' : 'bg-white/10 hover:bg-white/15'}`}
                            >
                                B
                            </button>
                            <button
                                onClick={() => setFontStyle(activeFontStyle === 'italic' ? 'normal' : 'italic')}
                                className={`flex-1 p-2 rounded-lg italic font-serif transition-all ${activeFontStyle === 'italic' ? 'bg-white/25 ring-2 ring-white/50' : 'bg-white/10 hover:bg-white/15'}`}
                            >
                                I
                            </button>
                            <button
                                onClick={() => setTextBackground(activeTextBackground === 'transparent' ? '#ffffff' : 'transparent')}
                                className={`flex-1 p-2 rounded-lg transition-all ${activeTextBackground !== 'transparent' ? 'bg-white/25 ring-2 ring-white/50' : 'bg-white/10 hover:bg-white/15'}`}
                                title="Toggle Background"
                            >
                                <div className="w-4 h-4 mx-auto border border-white/50 bg-white" />
                            </button>
                        </div>
                    </>
                )}

                {/* TrickFunda Page Theme Panel */}
                {activePanel === 'tfpage' && (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-xs text-white/60 uppercase tracking-wider font-medium">TF Teaching Page</span>
                            </div>
                            <button
                                onClick={() => setActivePanel('none')}
                                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-3 h-3 text-white/40" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mb-3 px-1">
                            <input
                                type="checkbox"
                                id="setAsDefaultTheme"
                                className="w-3.5 h-3.5 rounded border-white/20 bg-white/10 text-amber-500 focus:ring-amber-500/50 cursor-pointer"
                                checked={isDefaultMode}
                                onChange={(e) => {
                                    setIsDefaultMode(e.target.checked);
                                    if (!e.target.checked) {
                                        setDefaultTFThemeId(null);
                                    }
                                }}
                            />
                            <label htmlFor="setAsDefaultTheme" className="text-[10px] text-white/60 cursor-pointer select-none leading-none">
                                Set chosen theme as default for all new pages
                            </label>
                        </div>
                        
                        <p className="text-[10px] text-white/40 mb-3 px-1">Pick a color theme — inserts a branded page after Page {currentPage}</p>

                        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide max-w-[400px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {TF_PAGE_THEMES.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => {
                                        if (isDefaultMode) {
                                            setDefaultTFThemeId(theme.id);
                                        }
                                        insertTFPage(currentPage - 1, theme.id);
                                        setActivePanel('none');
                                    }}
                                    className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl
                                        transition-all hover:scale-110 flex-shrink-0
                                        border ${defaultTFThemeId === theme.id ? 'bg-amber-500/20 border-amber-500/50' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/15'}`}
                                    title={theme.name}
                                >
                                    {/* Theme Preview Swatch */}
                                    <div
                                        className="w-14 h-16 rounded-xl border-2 transition-all shadow-sm"
                                        style={{
                                            backgroundColor: theme.bgColor,
                                            borderColor: theme.headerAccent,
                                            boxShadow: `0 0 6px ${theme.headerAccent}40`,
                                        }}
                                    >
                                        {/* Mini header bar */}
                                        <div
                                            className="w-full h-2 rounded-t-[9px]"
                                            style={{ backgroundColor: theme.headerBg }}
                                        />
                                        {/* Mini TF text */}
                                        <div className="flex items-center justify-center h-[calc(100%-8px)]">
                                            <span
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 900,
                                                    color: theme.watermarkColor,
                                                    opacity: 0.4,
                                                    fontFamily: 'serif',
                                                }}
                                            >
                                                TF
                                            </span>
                                        </div>
                                    </div>
                                    {/* Theme Name */}
                                    <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors text-center leading-tight mt-1 whitespace-nowrap">
                                        {theme.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

            </div>
        );
    };

    // Vertical separator
    const Separator = () => (
        <div className="w-px h-6 bg-white/20 mx-1" />
    );

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw] w-full flex justify-center">
            {/* Floating Panel (opens UPWARD) */}
            <div className="relative">
                {renderPanel()}
            </div>

            {/* Main Dock */}
            <div className="flex items-center gap-0.5 px-3 py-2
                bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-x-auto scrollbar-hide max-w-[95vw]"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* Group 1: Tools */}
                <button
                    onClick={handlePenClick}
                    className={`relative p-3 sm:p-2 touch-manipulation rounded-xl transition-all hover:scale-110 ${isPen
                        ? 'bg-white/25 ring-2 ring-white/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                    title="Pen Tool (P)"
                >
                    <Pencil className={`w-4 h-4 ${isPen ? 'text-white' : 'text-white/60'}`} />
                </button>



                <button
                    onClick={handleEraserClick}
                    className={`relative p-3 sm:p-2 touch-manipulation rounded-xl transition-all hover:scale-110 ${isEraser
                        ? 'bg-white/25 ring-2 ring-white/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                    title="Eraser Tool (E)"
                >
                    <Eraser className={`w-4 h-4 ${isEraser ? 'text-white' : 'text-white/60'}`} />
                </button>

                <button
                    onClick={handleHighlighterClick}
                    className={`relative p-3 sm:p-2 touch-manipulation rounded-xl transition-all hover:scale-110 ${isHighlighter
                        ? 'bg-yellow-500/40 ring-2 ring-yellow-400/50'
                        : 'bg-white/5 hover:bg-yellow-500/20'
                        }`}
                    title="Highlighter Tool (H)"
                >
                    <Highlighter className={`w-4 h-4 ${isHighlighter ? 'text-yellow-300' : 'text-white/60'}`} />
                </button>

                <button
                    onClick={handleSelectClick}
                    className={`relative p-3 sm:p-2 touch-manipulation rounded-xl transition-all hover:scale-110 ${isSelect
                        ? 'bg-white/25 ring-2 ring-white/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                    title="Select Tool (V)"
                >
                    <Hand className={`w-4 h-4 ${isSelect ? 'text-white' : 'text-white/60'}`} />
                </button>

                <button
                    onClick={handleTextClick}
                    className={`relative p-3 sm:p-2 touch-manipulation rounded-xl transition-all hover:scale-110 ${isText
                        ? 'bg-white/25 ring-2 ring-white/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                    title="Text Tool (T)"
                >
                    <Type className={`w-4 h-4 ${isText ? 'text-white' : 'text-white/60'}`} />
                </button>

                <button
                    onClick={handleShapeClick}
                    className={`relative p-3 sm:p-2 touch-manipulation rounded-xl transition-all hover:scale-110 ${isShape
                        ? 'bg-white/25 ring-2 ring-white/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                    title="Shapes Tool (S)"
                >
                    <Shapes className={`w-4 h-4 ${isShape ? 'text-white' : 'text-white/60'}`} />
                </button>

                <button
                    onClick={handleLassoClick}
                    className={`relative p-3 sm:p-2 touch-manipulation rounded-xl transition-all hover:scale-110 ${isLasso
                        ? 'bg-white/25 ring-2 ring-white/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                    title="Lasso Tool (L)"
                >
                    <Lasso className={`w-4 h-4 ${isLasso ? 'text-white' : 'text-white/60'}`} />
                </button>

                <Separator />

                {/* Group 2: Actions */}
                <button
                    onClick={undo}
                    disabled={!canUndoAction}
                    className={`p-3 sm:p-2 touch-manipulation rounded-xl transition-all ${canUndoAction
                        ? 'bg-white/5 hover:bg-white/15 hover:scale-110'
                        : 'bg-white/5 opacity-30 cursor-not-allowed'
                        }`}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 className="w-4 h-4 text-white/60" />
                </button>

                <button
                    onClick={redo}
                    disabled={!canRedoAction}
                    className={`p-3 sm:p-2 touch-manipulation rounded-xl transition-all ${canRedoAction
                        ? 'bg-white/5 hover:bg-white/15 hover:scale-110'
                        : 'bg-white/5 opacity-30 cursor-not-allowed'
                        }`}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo2 className="w-4 h-4 text-white/60" />
                </button>

                <button
                    onClick={handleDeletePage}
                    className="p-3 sm:p-2 touch-manipulation rounded-xl bg-white/5 hover:bg-red-500/30 
                        transition-all hover:scale-110"
                    title={`Delete Page ${currentPage}`}
                >
                    <FileMinus className="w-4 h-4 text-white/60 hover:text-red-400" />
                </button>

                <Separator />

                {/* Group 3: Page & Image */}
                <button
                    onClick={handleInsertPage}
                    className="p-3 sm:p-2 touch-manipulation rounded-xl bg-white/5 hover:bg-white/15 
                        transition-all hover:scale-110"
                    title={`Insert Page After Page ${currentPage}`}
                >
                    <FilePlus className="w-4 h-4 text-white/60" />
                </button>

                {/* TF Branded Page */}
                <button
                    onClick={() => setActivePanel(activePanel === 'tfpage' ? 'none' : 'tfpage')}
                    className={`relative p-3 sm:p-2 touch-manipulation rounded-xl transition-all hover:scale-110 ${activePanel === 'tfpage'
                        ? 'bg-amber-500/30 ring-2 ring-amber-400/50'
                        : 'bg-white/5 hover:bg-amber-500/20'
                        }`}
                    title="Insert TrickFunda Teaching Page"
                >
                    <Sparkles className={`w-4 h-4 ${activePanel === 'tfpage' ? 'text-amber-300' : 'text-white/60 hover:text-amber-400'}`} />
                </button>

                <button
                    onClick={handleDuplicatePage}
                    className="p-3 sm:p-2 touch-manipulation rounded-xl bg-white/5 hover:bg-white/15 
                        transition-all hover:scale-110"
                    title={`Duplicate Page ${currentPage}`}
                >
                    <Copy className="w-4 h-4 text-white/60" />
                </button>

                <button
                    onClick={handleClearPage}
                    className="p-3 sm:p-2 touch-manipulation rounded-xl bg-white/5 hover:bg-orange-500/30 
                        transition-all hover:scale-110"
                    title={`Clear Content on Page ${currentPage}`}
                >
                    <Trash2 className="w-4 h-4 text-white/60 hover:text-orange-400" />
                </button>

                <button
                    onClick={() => imageInputRef.current?.click()}
                    className="p-3 sm:p-2 touch-manipulation rounded-xl bg-white/5 hover:bg-white/15 
                        transition-all hover:scale-110"
                    title="Add Image"
                >
                    <ImageIcon className="w-4 h-4 text-white/60" />
                </button>
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />

                <Separator />

                {/* Group 4: Meta */}
                <button
                    onClick={handleBgClick}
                    className={`relative p-3 sm:p-2 touch-manipulation rounded-xl transition-all hover:scale-110 ${activePanel === 'bg'
                        ? 'bg-white/25 ring-2 ring-white/50'
                        : 'bg-white/5 hover:bg-white/10'
                        }`}
                    title="Paper Settings"
                >
                    <Paintbrush className={`w-4 h-4 ${activePanel === 'bg' ? 'text-white' : 'text-white/60'}`} />
                </button>

                {/* Grid View Logic Included Here */}
                <div className="flex items-center gap-1 pl-4 border-l border-white/10">
                    <button
                        onClick={() => setIsGridView(true)}
                        className="p-3 sm:p-2 touch-manipulation text-white/50 hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all"
                        title="Grid View (Navigate)"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>

                </div>

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className={`p-3 sm:p-2 touch-manipulation rounded-xl transition-all ${isExporting
                        ? 'bg-white/5 opacity-50 cursor-wait'
                        : 'bg-white/5 hover:bg-green-500/30 hover:scale-110'
                        }`}
                    title="Export PDF"
                >
                    <Download className={`w-4 h-4 ${isExporting ? 'text-white/40 animate-pulse' : 'text-white/60 hover:text-green-400'}`} />
                </button>

                {/* Separator */}
                <div className="w-px h-8 bg-white/10 mx-1" />

                {/* New Project */}
                <button
                    onClick={() => {
                        if (confirm('Start a new project? Your current work is saved automatically.')) {
                            resetProject();
                        }
                    }}
                    className="p-3 sm:p-2 touch-manipulation rounded-xl bg-white/5 hover:bg-red-500/20 hover:scale-110 transition-all"
                    title="New Project"
                >
                    <FileX2 className="w-4 h-4 text-white/60 hover:text-red-400" />
                </button>

                <Link
                    href="/pdf-viewer"
                    className="p-3 rounded-xl bg-white/5 hover:bg-purple-500/20 hover:scale-110 transition-all"
                    title="Open PDF"
                >
                    <BookOpen className="w-6 h-6 text-white/60 hover:text-purple-400" />
                </Link>
                {isOverlayMode && (
                    <>
                        <Separator />
                        <button
                            onClick={() => window.parent.postMessage({ type: 'CLOSE_CANVAS' }, '*')}
                            className="relative p-3 rounded-xl transition-all hover:scale-110 bg-red-500/20 hover:bg-red-500/40 text-red-500 hover:text-red-400"
                            title="Close Canvas"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
