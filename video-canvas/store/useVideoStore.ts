import { create } from 'zustand';
import { Stroke, TextNode, ShapeType, Point } from '@cosmic/types';
import { VideoTool, PinnedImage, VideoMeta, VideoActionItem } from '@video-canvas/types';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface VideoStoreState {
    // Video State
    videoSrc: string | null;
    videoMeta: VideoMeta | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    playbackRate: number;
    isLooping: boolean;
    isMuted: boolean;

    // Drawing/Canvas State
    strokes: Stroke[];
    textNodes: TextNode[];
    pinnedImages: PinnedImage[];
    historyStack: VideoActionItem[];
    redoStack: VideoActionItem[];

    // Tool State
    activeTool: VideoTool;
    penColor: string;
    penWidth: number;
    eraserWidth: number;
    highlighterColor: string;
    highlighterWidth: number;
    activeShape: ShapeType;
    activeFont: string;
    activeFontSize: number;
    activeFontWeight: 'normal' | 'bold';
    activeFontStyle: 'normal' | 'italic';
    activeTextBackground: string;

    // Viewport State
    zoom: number;
    panX: number;
    panY: number;

    // UI State
    isToolbarVisible: boolean;
    isControlsVisible: boolean;
    showDropzone: boolean;
    selectedId: string | null;
    selectedStrokeIds: string[];
    selectedTextIds: string[];
    selectionRotation: number;
    lassoMode: 'loop' | 'touch';

    // Video Actions
    loadVideo: (src: string, meta: VideoMeta) => void;
    setPlaying: (playing: boolean) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setVolume: (volume: number) => void;
    setPlaybackRate: (rate: number) => void;
    toggleLoop: () => void;
    toggleMute: () => void;
    unloadVideo: () => void;

    // Drawing Actions
    addStroke: (strokeData: Omit<Stroke, 'id' | 'isEraser'>, forceEraser?: boolean, isShape?: boolean, isHighlighter?: boolean) => void;
    deleteStrokes: (ids: string[]) => void;
    undo: () => void;
    redo: () => void;

    // Pinned Image Actions
    addPinnedImage: (image: PinnedImage) => void;
    updatePinnedImage: (id: string, updates: Partial<PinnedImage>) => void;
    deletePinnedImage: (id: string) => void;
    togglePinnedImageLock: (id: string) => void;

    // Text Actions
    addTextNode: (node: TextNode) => void;
    updateTextNode: (id: string, updates: Partial<TextNode>) => void;
    deleteTextNode: (id: string) => void;

    // Selection Actions
    selectObject: (id: string | null) => void;
    selectStrokes: (ids: string[]) => void;
    selectText: (ids: string[]) => void;
    clearSelection: () => void;
    deleteSelectedObject: () => void;
    transformStrokes: (dx: number, dy: number, scaleX?: number, scaleY?: number, origin?: { x: number; y: number }) => void;

    // Tool Actions
    setTool: (tool: VideoTool) => void;
    setPenColor: (color: string) => void;
    setPenWidth: (width: number) => void;
    setEraserWidth: (width: number) => void;
    setHighlighterColor: (color: string) => void;
    setHighlighterWidth: (width: number) => void;
    setShape: (shape: ShapeType) => void;
    setFont: (font: string) => void;
    setFontSize: (size: number) => void;
    setFontWeight: (weight: 'normal' | 'bold') => void;
    setFontStyle: (style: 'normal' | 'italic') => void;
    setTextBackground: (color: string) => void;

    // Viewport Actions
    setZoom: (zoom: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    setPan: (x: number, y: number) => void;

    // UI Actions
    toggleToolbar: () => void;
    toggleControls: () => void;
    clearAll: () => void;

    // Computed
    canUndo: () => boolean;
    canRedo: () => boolean;
}

export const useVideoStore = create<VideoStoreState>((set, get) => ({
    // Video State
    videoSrc: null,
    videoMeta: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    isLooping: false,
    isMuted: false,

    // Drawing/Canvas State
    strokes: [],
    textNodes: [],
    pinnedImages: [],
    historyStack: [],
    redoStack: [],

    // Tool State
    activeTool: 'pen' as VideoTool,
    penColor: '#ffffff',
    penWidth: 3,
    eraserWidth: 20,
    highlighterColor: '#ffff00',
    highlighterWidth: 20,
    activeShape: 'rectangle',
    activeFont: 'Inter',
    activeFontSize: 24,
    activeFontWeight: 'normal',
    activeFontStyle: 'normal',
    activeTextBackground: 'transparent',

    // Viewport State
    zoom: 1,
    panX: 0,
    panY: 0,

    // UI State
    isToolbarVisible: true,
    isControlsVisible: true,
    showDropzone: true,
    selectedId: null,
    selectedStrokeIds: [],
    selectedTextIds: [],
    selectionRotation: 0,
    lassoMode: 'touch',

    // Video Actions
    loadVideo: (src, meta) => set({
        videoSrc: src,
        videoMeta: meta,
        showDropzone: false,
        isPlaying: false,
        currentTime: 0
    }),
    setPlaying: (playing) => set({ isPlaying: playing }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),
    setVolume: (volume) => set({ volume }),
    setPlaybackRate: (rate) => set({ playbackRate: rate }),
    toggleLoop: () => set((state) => ({ isLooping: !state.isLooping })),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    unloadVideo: () => set({
        videoSrc: null,
        videoMeta: null,
        showDropzone: true,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        strokes: [],
        textNodes: [],
        pinnedImages: [],
        historyStack: [],
        redoStack: [],
        selectedId: null,
        selectedStrokeIds: [],
        selectedTextIds: []
    }),

    // Drawing Actions
    addStroke: (strokeData, forceEraser, isShape, isHighlighter) => {
        const state = get();
        const isEraser = forceEraser !== undefined ? forceEraser : state.activeTool === 'eraser';
        const highlighter = isHighlighter !== undefined ? isHighlighter : state.activeTool === 'highlighter';

        let size = strokeData.size;
        let color = strokeData.color;

        if (isEraser) {
            size = state.eraserWidth;
            color = '#000000';
        } else if (highlighter) {
            size = state.highlighterWidth;
            color = state.highlighterColor;
        }

        const stroke: Stroke = {
            id: generateId(),
            ...strokeData,
            size,
            color,
            isEraser,
            isShape: isShape || false,
            isHighlighter: highlighter,
        };

        set({
            strokes: [...state.strokes, stroke],
            historyStack: [...state.historyStack, { type: 'stroke', data: stroke }],
            redoStack: [],
        });
    },

    deleteStrokes: (ids) => {
        if (!ids.length) return;
        const state = get();
        const deletedStrokes = state.strokes.filter(s => ids.includes(s.id));
        set({
            strokes: state.strokes.filter(s => !ids.includes(s.id)),
            historyStack: [
                ...state.historyStack,
                ...deletedStrokes.map(s => ({ type: 'stroke' as const, data: { ...s, _deleted: true } as any }))
            ],
            redoStack: [],
            selectedStrokeIds: state.selectedStrokeIds.filter(id => !ids.includes(id)),
        });
    },

    undo: () => {
        const state = get();
        if (state.historyStack.length === 0) return;

        const newHistory = [...state.historyStack];
        const lastAction = newHistory.pop()!;

        set((currentState) => {
            let nextState: Partial<VideoStoreState> = {
                historyStack: newHistory,
                redoStack: [...currentState.redoStack, lastAction],
            };

            if (lastAction.type === 'stroke') {
                const strokeData = lastAction.data as any; // Type workaround based on cosmic pattern
                if (strokeData._deleted) {
                    const restoredStroke = { ...strokeData };
                    delete restoredStroke._deleted;
                    nextState.strokes = [...currentState.strokes, restoredStroke];
                } else {
                    nextState.strokes = currentState.strokes.filter((s) => s.id !== strokeData.id);
                    nextState.selectedStrokeIds = currentState.selectedStrokeIds.filter((id) => id !== strokeData.id);
                }
            } else if (lastAction.type === 'text') {
                const textData = lastAction.data as any;
                if (textData._deleted) {
                    const restoredText = { ...textData };
                    delete restoredText._deleted;
                    nextState.textNodes = [...currentState.textNodes, restoredText];
                } else {
                    nextState.textNodes = currentState.textNodes.filter((t) => t.id !== textData.id);
                    if (currentState.selectedId === textData.id) nextState.selectedId = null;
                    nextState.selectedTextIds = currentState.selectedTextIds.filter((id) => id !== textData.id);
                }
            } else if (lastAction.type === 'image') {
                const imgData = lastAction.data as any;
                if (imgData._deleted) {
                    const restoredImg = { ...imgData };
                    delete restoredImg._deleted;
                    nextState.pinnedImages = [...currentState.pinnedImages, restoredImg];
                } else {
                    nextState.pinnedImages = currentState.pinnedImages.filter((img) => img.id !== imgData.id);
                    if (currentState.selectedId === imgData.id) nextState.selectedId = null;
                }
            }
            return nextState;
        });
    },

    redo: () => {
        const state = get();
        if (state.redoStack.length === 0) return;

        const newRedo = [...state.redoStack];
        const lastAction = newRedo.pop()!;

        set((currentState) => {
            let nextState: Partial<VideoStoreState> = {
                historyStack: [...currentState.historyStack, lastAction],
                redoStack: newRedo,
            };

            if (lastAction.type === 'stroke') {
                const strokeData = lastAction.data as any;
                if (strokeData._deleted) {
                    nextState.strokes = currentState.strokes.filter((s) => s.id !== strokeData.id);
                    nextState.selectedStrokeIds = currentState.selectedStrokeIds.filter((id) => id !== strokeData.id);
                } else {
                    nextState.strokes = [...currentState.strokes, strokeData];
                }
            } else if (lastAction.type === 'text') {
                const textData = lastAction.data as any;
                if (textData._deleted) {
                    nextState.textNodes = currentState.textNodes.filter((t) => t.id !== textData.id);
                    if (currentState.selectedId === textData.id) nextState.selectedId = null;
                    nextState.selectedTextIds = currentState.selectedTextIds.filter((id) => id !== textData.id);
                } else {
                    nextState.textNodes = [...currentState.textNodes, textData];
                }
            } else if (lastAction.type === 'image') {
                const imgData = lastAction.data as any;
                if (imgData._deleted) {
                    nextState.pinnedImages = currentState.pinnedImages.filter((img) => img.id !== imgData.id);
                    if (currentState.selectedId === imgData.id) nextState.selectedId = null;
                } else {
                    nextState.pinnedImages = [...currentState.pinnedImages, imgData];
                }
            }
            return nextState;
        });
    },

    // Pinned Image Actions
    addPinnedImage: (image) => set((state) => ({
        pinnedImages: [...state.pinnedImages, image],
        historyStack: [...state.historyStack, { type: 'image', data: image as any }],
        redoStack: [],
        activeTool: 'select' as VideoTool,
        selectedId: image.id
    })),

    updatePinnedImage: (id, updates) => set((state) => ({
        pinnedImages: state.pinnedImages.map((img) =>
            img.id === id ? { ...img, ...updates } : img
        )
    })),

    deletePinnedImage: (id) => {
        const state = get();
        const imgToDelete = state.pinnedImages.find(img => img.id === id);
        if (!imgToDelete) return;

        set({
            pinnedImages: state.pinnedImages.filter(img => img.id !== id),
            historyStack: [...state.historyStack, { type: 'image', data: { ...imgToDelete, _deleted: true } as any }],
            redoStack: [],
            selectedId: state.selectedId === id ? null : state.selectedId
        });
    },

    togglePinnedImageLock: (id) => set((state) => ({
        pinnedImages: state.pinnedImages.map((img) =>
            img.id === id ? { ...img, locked: !img.locked } : img
        )
    })),

    // Text Actions
    addTextNode: (node) => set((state) => ({
        textNodes: [...state.textNodes, node],
        historyStack: [...state.historyStack, { type: 'text', data: node as any }],
        redoStack: [],
        selectedId: node.id,
        activeTool: 'select' as VideoTool
    })),

    updateTextNode: (id, updates) => set((state) => ({
        textNodes: state.textNodes.map(node =>
            node.id === id ? { ...node, ...updates } : node
        )
    })),

    deleteTextNode: (id) => {
        const state = get();
        const nodeToDelete = state.textNodes.find(node => node.id === id);
        if (!nodeToDelete) return;

        set({
            textNodes: state.textNodes.filter(node => node.id !== id),
            historyStack: [...state.historyStack, { type: 'text', data: { ...nodeToDelete, _deleted: true } as any }],
            redoStack: [],
            selectedId: state.selectedId === id ? null : state.selectedId,
            selectedTextIds: state.selectedTextIds.filter(selectedId => selectedId !== id)
        });
    },

    // Selection Actions
    selectObject: (id) => set({ selectedId: id }),
    selectStrokes: (ids) => set({ selectedStrokeIds: ids }),
    selectText: (ids) => set({ selectedTextIds: ids }),
    
    clearSelection: () => set({
        selectedId: null,
        selectedStrokeIds: [],
        selectedTextIds: [],
        selectionRotation: 0
    }),

    deleteSelectedObject: () => {
        const state = get();
        
        if (state.selectedId) {
            const isText = state.textNodes.some(n => n.id === state.selectedId);
            if (isText) {
                state.deleteTextNode(state.selectedId);
            } else {
                state.deletePinnedImage(state.selectedId);
            }
        }
        
        if (state.selectedStrokeIds.length > 0) {
            state.deleteStrokes(state.selectedStrokeIds);
        }
        
        if (state.selectedTextIds.length > 0) {
            state.selectedTextIds.forEach(id => state.deleteTextNode(id));
        }
        
        set({ selectedId: null, selectedStrokeIds: [], selectedTextIds: [] });
    },

    transformStrokes: (dx, dy, scaleX = 1, scaleY = 1, origin) => {
        const state = get();
        if (state.selectedStrokeIds.length === 0) return;

        const updatedStrokes = state.strokes.map((stroke) => {
            if (!state.selectedStrokeIds.includes(stroke.id)) return stroke;

            const transformedPoints = stroke.points.map((p) => {
                let x = p.x;
                let y = p.y;

                if (scaleX !== 1 || scaleY !== 1) {
                    const cx = origin ? origin.x : x;
                    const cy = origin ? origin.y : y;
                    x = cx + (x - cx) * scaleX;
                    y = cy + (y - cy) * scaleY;
                }

                return {
                    ...p,
                    x: x + dx,
                    y: y + dy,
                };
            });

            return { ...stroke, points: transformedPoints };
        });

        set({ strokes: updatedStrokes });
    },

    // Tool Actions
    setTool: (tool) => set({ activeTool: tool }),
    setPenColor: (color) => set({ penColor: color }),
    setPenWidth: (width) => set({ penWidth: width }),
    setEraserWidth: (width) => set({ eraserWidth: width }),
    setHighlighterColor: (color) => set({ highlighterColor: color }),
    setHighlighterWidth: (width) => set({ highlighterWidth: width }),
    setShape: (shape) => set({ activeShape: shape }),
    setFont: (font) => set({ activeFont: font }),
    setFontSize: (size) => set({ activeFontSize: size }),
    setFontWeight: (weight) => set({ activeFontWeight: weight }),
    setFontStyle: (style) => set({ activeFontStyle: style }),
    setTextBackground: (color) => set({ activeTextBackground: color }),

    // Viewport Actions
    setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(4.0, zoom)) }),
    zoomIn: () => set((state) => ({ zoom: Math.min(4.0, state.zoom + 0.1) })),
    zoomOut: () => set((state) => ({ zoom: Math.max(0.25, state.zoom - 0.1) })),
    resetZoom: () => set({ zoom: 1, panX: 0, panY: 0 }),
    setPan: (x, y) => set({ panX: x, panY: y }),

    // UI Actions
    toggleToolbar: () => set((state) => ({ isToolbarVisible: !state.isToolbarVisible })),
    toggleControls: () => set((state) => ({ isControlsVisible: !state.isControlsVisible })),
    clearAll: () => set({ strokes: [], textNodes: [], pinnedImages: [], historyStack: [], redoStack: [], selectedId: null, selectedStrokeIds: [], selectedTextIds: [] }),

    // Computed
    canUndo: () => get().historyStack.length > 0,
    canRedo: () => get().redoStack.length > 0,
}));
