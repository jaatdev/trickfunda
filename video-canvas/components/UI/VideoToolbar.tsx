'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pen,
  Eraser,
  Type,
  MousePointer2,
  Lasso,
  Highlighter,
  Shapes,
  Image as ImageIcon,
  Hand,
  Undo2,
  Redo2,
  Trash2,
  Camera,
  Square,
  Circle,
  Triangle,
  Minus,
  MoveRight,
  ChevronUp,
  Bold,
  Italic,
  X,
  FastForward,
  Maximize
} from 'lucide-react';
import { useVideoStore } from '@video-canvas/store/useVideoStore';

const COLORS = [
  '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
  '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'
];

const HIGHLIGHTER_COLORS = [
  '#FFFF00', '#00FF00', '#FF00FF', '#00FFFF', '#FFA500'
];

const FONTS = [
  { name: 'Inter', family: 'Inter, sans-serif' },
  { name: 'Playfair Display', family: '"Playfair Display", serif' },
  { name: 'Caveat', family: 'Caveat, cursive' },
  { name: 'JetBrains Mono', family: '"JetBrains Mono", monospace' },
];

const SHAPES = [
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'triangle', icon: Triangle, label: 'Triangle' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'arrow', icon: MoveRight, label: 'Arrow' },
];

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface ToolButtonProps {
  icon: React.ElementType;
  tool: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

import { useShallow } from 'zustand/react/shallow';

export function VideoToolbar() {
  const {
    isToolbarVisible,
    activeTool: tool,
    setTool,
    penColor,
    setPenColor,
    penWidth: penSize,
    setPenWidth: setPenSize,
    highlighterColor,
    setHighlighterColor,
    highlighterWidth: highlighterSize,
    setHighlighterWidth: setHighlighterSize,
    eraserWidth: eraserSize,
    setEraserWidth: setEraserSize,
    activeShape: shapeType,
    setShape: setShapeType,
    activeFont: fontFamily,
    setFont: setFontFamily,
    activeFontSize: fontSize,
    setFontSize,
    activeFontWeight,
    setFontWeight,
    activeFontStyle,
    setFontStyle,
    activeTextBackground: textBgColor,
    setTextBackground: setTextBgColor,
    clearAll: clearAllAnnotations,
    zoom,
    setZoom,
    addPinnedImage,
    canUndo,
    canRedo,
    undo,
    redo,
    playbackRate,
    setPlaybackRate
  } = useVideoStore(
    useShallow((state: any) => ({
      isToolbarVisible: state.isToolbarVisible,
      activeTool: state.activeTool,
      setTool: state.setTool,
      penColor: state.penColor,
      setPenColor: state.setPenColor,
      penWidth: state.penWidth,
      setPenWidth: state.setPenWidth,
      highlighterColor: state.highlighterColor,
      setHighlighterColor: state.setHighlighterColor,
      highlighterWidth: state.highlighterWidth,
      setHighlighterWidth: state.setHighlighterWidth,
      eraserWidth: state.eraserWidth,
      setEraserWidth: state.setEraserWidth,
      activeShape: state.activeShape,
      setShape: state.setShape,
      activeFont: state.activeFont,
      setFont: state.setFont,
      activeFontSize: state.activeFontSize,
      setFontSize: state.setFontSize,
      activeFontWeight: state.activeFontWeight,
      setFontWeight: state.setFontWeight,
      activeFontStyle: state.activeFontStyle,
      setFontStyle: state.setFontStyle,
      activeTextBackground: state.activeTextBackground,
      setTextBackground: state.setTextBackground,
      clearAll: state.clearAll,
      zoom: state.zoom,
      setZoom: state.setZoom,
      addPinnedImage: state.addPinnedImage,
      canUndo: state.canUndo(),
      canRedo: state.canRedo(),
      undo: state.undo,
      redo: state.redo,
      playbackRate: state.playbackRate,
      setPlaybackRate: state.setPlaybackRate
    }))
  );

  const textColor = penColor;
  const setTextColor = setPenColor;
  const isBold = activeFontWeight === 'bold';
  const setIsBold = (bold: boolean) => setFontWeight(bold ? 'bold' : 'normal');
  const isItalic = activeFontStyle === 'italic';
  const setIsItalic = (italic: boolean) => setFontStyle(italic ? 'italic' : 'normal');

  const [activePopover, setActivePopover] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (activePopover) {
      timeout = setTimeout(() => {
        setActivePopover(null);
      }, 4000);
    }
    return () => clearTimeout(timeout);
  }, [activePopover, tool, penColor, penSize, highlighterColor, highlighterSize, eraserSize, shapeType, fontFamily, fontSize, isBold, isItalic, textColor, textBgColor]);

  const handleToolClick = (newTool: any) => {
    setTool(newTool);
    setActivePopover(newTool);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      addPinnedImage({
        id: crypto.randomUUID(),
        src: url,
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        opacity: 1,
        locked: false
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScreenshot = async () => {
    // Implement screenshot logic later
    console.log('Taking screenshot...');
  };

  const ToolButton = ({ icon: Icon, tool: btnTool, label, isActive, onClick, children }: ToolButtonProps) => (
    <div className="relative">
      <button
        onClick={() => {
          if (onClick) onClick();
          else handleToolClick(btnTool);
        }}
        className={cn(
          "p-2.5 rounded-full transition-all flex items-center justify-center",
          isActive ? "bg-white/20 ring-2 ring-white/40" : "hover:bg-white/10"
        )}
        title={label}
      >
        <Icon className="w-5 h-5 text-white" />
      </button>
      <AnimatePresence>
        {activePopover === btnTool && children && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-4 bg-black/80 backdrop-blur-3xl rounded-2xl border border-white/20 shadow-2xl min-w-[240px] z-[100000]"
            onClick={(e) => e.stopPropagation()} // Prevent autoclose when interacting
          >
            {children}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/80 border-b border-r border-white/20 rotate-45 transform origin-center" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <AnimatePresence>
      {isToolbarVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[99998]"
          ref={toolbarRef}
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-black/60 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
            {/* Select Tool */}
            <ToolButton
              icon={MousePointer2}
              tool="select"
              label="Select"
              isActive={tool === 'select'}
            />

            {/* Pen Tool */}
            <ToolButton
              icon={Pen}
              tool="pen"
              label="Pen"
              isActive={tool === 'pen'}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm font-medium">Pen Size</span>
                  <span className="text-white/60 text-xs">{penSize}px</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={penSize}
                    onChange={(e) => setPenSize(parseInt(e.target.value))}
                    className="flex-1 accent-white"
                  />
                  <div
                    className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-black/40"
                  >
                    <div
                      className="rounded-full bg-white transition-all"
                      style={{ width: Math.min(penSize, 30), height: Math.min(penSize, 30), backgroundColor: penColor }}
                    />
                  </div>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <div className="grid grid-cols-5 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setPenColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                        penColor === color ? "border-white" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                    <input
                      type="color"
                      value={penColor}
                      onChange={(e) => setPenColor(e.target.value)}
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </ToolButton>

            {/* Highlighter Tool */}
            <ToolButton
              icon={Highlighter}
              tool="highlighter"
              label="Highlighter"
              isActive={tool === 'highlighter'}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm font-medium">Width</span>
                  <span className="text-white/60 text-xs">{highlighterSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={highlighterSize}
                  onChange={(e) => setHighlighterSize(parseInt(e.target.value))}
                  className="w-full accent-white"
                />
                <div className="grid grid-cols-5 gap-2">
                  {HIGHLIGHTER_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setHighlighterColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 opacity-80",
                        highlighterColor === color ? "border-white" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </ToolButton>

            {/* Eraser Tool */}
            <ToolButton
              icon={Eraser}
              tool="eraser"
              label="Eraser"
              isActive={tool === 'eraser'}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm font-medium">Eraser Size</span>
                  <span className="text-white/60 text-xs">{eraserSize}px</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={eraserSize}
                    onChange={(e) => setEraserSize(parseInt(e.target.value))}
                    className="flex-1 accent-white"
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-black/20"
                    style={{ width: Math.min(eraserSize, 32), height: Math.min(eraserSize, 32) }}
                  />
                </div>
              </div>
            </ToolButton>

            {/* Shapes Tool */}
            <ToolButton
              icon={Shapes}
              tool="shape"
              label="Shape"
              isActive={tool === 'shape'}
            >
              <div className="grid grid-cols-3 gap-2">
                {SHAPES.map((shape) => {
                  const ShapeIcon = shape.icon;
                  return (
                    <button
                      key={shape.id}
                      onClick={() => setShapeType(shape.id as any)}
                      className={cn(
                        "p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors",
                        shapeType === shape.id ? "bg-white/20" : "hover:bg-white/10"
                      )}
                    >
                      <ShapeIcon className="w-6 h-6 text-white" />
                      <span className="text-[10px] text-white/70">{shape.label}</span>
                    </button>
                  );
                })}
              </div>
            </ToolButton>

            {/* Text Tool */}
            <ToolButton
              icon={Type}
              tool="text"
              label="Text"
              isActive={tool === 'text'}
            >
              <div className="space-y-4 min-w-[280px]">
                <div className="space-y-2">
                  <span className="text-white/80 text-sm font-medium">Font Family</span>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map((font) => (
                      <button
                        key={font.name}
                        onClick={() => setFontFamily(font.family)}
                        className={cn(
                          "px-2 py-1.5 rounded-lg text-sm text-left truncate transition-colors",
                          fontFamily === font.family ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"
                        )}
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBold(!isBold)}
                    className={cn("p-2 rounded-lg transition-colors", isBold ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10")}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsItalic(!isItalic)}
                    className={cn("p-2 rounded-lg transition-colors", isItalic ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10")}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <div className="h-6 w-px bg-white/20 mx-2" />
                  <div className="flex-1">
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-white"
                    />
                  </div>
                  <span className="text-white/60 text-xs w-8 text-right">{fontSize}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-white/80 text-sm font-medium">Colors</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-xs">Text:</span>
                      <div className="relative w-6 h-6 rounded-md overflow-hidden border border-white/20">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-xs">Bg:</span>
                      <div className="relative w-6 h-6 rounded-md overflow-hidden border border-white/20">
                        <input
                          type="color"
                          value={textBgColor}
                          onChange={(e) => setTextBgColor(e.target.value)}
                          className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ToolButton>

            {/* Lasso Tool */}
            <ToolButton
              icon={Lasso}
              tool="lasso"
              label="Lasso"
              isActive={tool === 'lasso'}
            />

            {/* Image Tool */}
            <div className="relative">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-full transition-all flex items-center justify-center hover:bg-white/10"
                title="Pin Image"
              >
                <ImageIcon className="w-5 h-5 text-white" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
            </div>

            {/* Playback Rate Control */}
            <div className="relative">
              <button
                onClick={() => {
                   const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
                   const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
                   setPlaybackRate(nextRate);
                }}
                className="p-2 rounded-full transition-all flex flex-col items-center justify-center hover:bg-white/10"
                title="Playback Speed"
              >
                <FastForward className="w-4 h-4 text-white mb-0.5" />
                <span className="text-[10px] leading-[10px] text-white/90 font-bold">{playbackRate}x</span>
              </button>
            </div>

            {/* Fullscreen Control */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => console.error(err));
                  } else {
                    document.exitFullscreen().catch(err => console.error(err));
                  }
                }}
                className="p-2.5 rounded-full transition-all flex items-center justify-center hover:bg-white/10"
                title="Toggle Fullscreen"
              >
                <Maximize className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Pan Tool */}
            <ToolButton
              icon={Hand}
              tool="pan"
              label="Pan"
              isActive={tool === 'pan'}
            />

            {/* Divider */}
            <div className="w-px h-8 bg-white/20 mx-2" />

            {/* Right Side Controls */}
            <button
              onClick={undo}
              disabled={!canUndo()}
              className={cn(
                "p-2 rounded-full transition-colors",
                canUndo() ? "hover:bg-white/10 text-white" : "opacity-30 text-white cursor-not-allowed"
              )}
              title="Undo"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className={cn(
                "p-2 rounded-full transition-colors",
                canRedo() ? "hover:bg-white/10 text-white" : "opacity-30 text-white cursor-not-allowed"
              )}
              title="Redo"
            >
              <Redo2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleScreenshot}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              title="Screenshot"
            >
              <Camera className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (window.confirm('Clear all annotations?')) {
                  clearAllAnnotations();
                }
              }}
              className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
              title="Clear All"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="w-px h-8 bg-white/20 mx-1" />

            <button
              onClick={() => setZoom(100)}
              className="px-2 py-1 rounded-lg hover:bg-white/10 text-white/80 text-xs font-medium transition-colors"
              title="Reset Zoom"
            >
              {Math.round(zoom)}%
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
