import { create } from 'zustand';
import { Point, Stroke, Tool, Pattern, CanvasImage, ActionItem, ShapeType, TextNode, TFPageTheme } from '@cosmic/types';
import { PAGE_WIDTH, PDF_PAGE_GAP } from '@cosmic/constants/canvas';
import { loadState, saveState, clearState, PersistedState } from '@cosmic/utils/storage';
import { rotatePoint } from '@cosmic/utils/geometry';

// Re-export types for convenience
export type { Point, Stroke, Tool, Pattern, CanvasImage, ActionItem, ShapeType, TextNode, TFPageTheme };

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Store state
interface CanvasState {
    strokes: Stroke[];
    images: CanvasImage[];
    historyStack: ActionItem[];
    redoStack: ActionItem[];
    currentTool: Tool;
    selectedImageId: string | null;
    projectName: string;
    pageCount: number;
    currentPage: number;
    pageHeight: number;
    zoom: number;
    isFullscreen: boolean;
    isGridView: boolean;

    // Separate widths for pen and eraser
    penColor: string;
    penWidth: number;
    eraserWidth: number;

    // Highlighter tool
    highlighterColor: string;
    highlighterWidth: number;

    // Shape tool
    activeShape: ShapeType;

    // Text tool
    textNodes: TextNode[];
    activeFont: string;
    activeFontSize: number;
    activeFontWeight: 'normal' | 'bold';
    activeFontStyle: 'normal' | 'italic';
    activeTextBackground: string;
    selectedId: string | null; // Unified selection for images and text

    // Lasso selection
    selectedStrokeIds: string[];
    selectedTextIds: string[];
    selectionRotation: number; // radians
    lassoMode: 'loop' | 'touch';

    // Background
    canvasBackground: string;
    canvasPattern: Pattern;

    // PDF Viewer
    documentId: string | null;
    pdfPageMapping: (number | null)[];  // Maps canvas page index to PDF page number (null = blank page)
    canvasDimensions: { width: number; height: number };  // Dynamic canvas size
    hiddenPdfPages: number[];  // Page indexes where PDF background is hidden (unlocked)

    // Clipboard
    clipboard: CanvasImage | null;

    // Overlay Mode
    isOverlayMode: boolean;

    // TrickFunda Page Themes
    tfPageThemes: Record<number, string>;  // Maps page index → theme ID
    defaultTFThemeId: string | null;       // Automatically applies this theme to new pages
    tfHeaderBrand: string;
    tfHeaderTopic: string;
    tfHeaderYoutube: string;

    // Smart Mode

    isSmartShapeEnabled: boolean;
    setIsSmartShapeEnabled: (value: boolean) => void;

    // Actions
    addStroke: (stroke: Omit<Stroke, 'id' | 'isEraser'>, forceEraser?: boolean, isShape?: boolean, isHighlighter?: boolean) => string;
    addImage: (image: CanvasImage) => void;
    selectImage: (id: string | null) => void;
    updateImage: (id: string, updates: Partial<CanvasImage>) => void;
    deleteSelectedImage: () => void;
    copyImage: () => void;
    pasteImage: () => void;
    addTextNode: (node: TextNode, switchTool?: boolean) => void;
    updateTextNode: (id: string, updates: Partial<TextNode>) => void;
    deleteTextNode: (id: string) => void;
    deleteSelectedObject: () => void;
    undo: () => void;
    redo: () => void;
    toggleGridView: () => void;
    setIsGridView: (isGrid: boolean) => void;
    
    // Grid View Enhancements
    selectedGridPages: number[];
    bookmarkedPages: number[];
    gridFilter: 'all' | 'pdf' | 'blank' | 'bookmarked';
    gridZoomLevel: 'small' | 'medium' | 'large';
    toggleGridPageSelection: (index: number, multiSelect?: boolean) => void;
    clearGridSelection: () => void;
    togglePageBookmark: (index: number) => void;
    setGridFilter: (filter: 'all' | 'pdf' | 'blank' | 'bookmarked') => void;
    setGridZoomLevel: (level: 'small' | 'medium' | 'large') => void;
    deleteSelectedGridPages: () => void;

    setTool: (tool: Tool) => void;
    setProjectName: (name: string) => void;
    addPage: () => void;
    setPageCount: (count: number) => void;
    setCurrentPage: (page: number) => void;
    insertPageAfter: (pageIndex: number) => void;
    deletePage: (pageIndex: number) => void;
    clearPage: (pageIndex: number) => void;
    duplicatePage: (pageIndex: number) => void;
    setPageHeight: (height: number) => void;
    setZoom: (zoom: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    fitToScreen: () => void;
    setIsFullscreen: (value: boolean) => void;
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
    selectStrokes: (ids: string[]) => void;
    selectText: (ids: string[]) => void;
    clearSelection: () => void;
    transformStrokes: (dx: number, dy: number, scaleX?: number, scaleY?: number, origin?: { x: number; y: number }) => void;
    scaleSelectedStrokes: (factor: number) => void;
    rotateSelection: (angleDelta: number) => void;
    flipSelectionHorizontal: () => void;
    flipSelectionVertical: () => void;
    changeSelectionColor: (color: string) => void;
    changeSelectionOpacity: (opacity: number) => void;
    changeSelectionStrokeWidth: (width: number) => void;
    alignSelection: (direction: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void;
    groupSelection: () => void;
    ungroupSelection: () => void;
    duplicateSelectedStrokes: () => void;
    deleteSelectedStrokes: () => void;
    clearStrokeSelection: () => void;
    setCanvasBackground: (color: string) => void;
    setCanvasPattern: (pattern: Pattern) => void;
    clearCanvas: () => void;
    deleteStrokes: (ids: string[]) => void;

    // Persistence
    loadProject: () => Promise<void>;
    resetProject: () => Promise<void>;
    getPersistedState: () => PersistedState;

    // Page Management
    setDocument: (id: string | null, totalPages?: number, width?: number, height?: number) => void;
    movePage: (fromIndex: number, toIndex: number) => void;
    setCanvasDimensions: (width: number, height: number) => void;
    hidePdfPage: (pageIndex: number) => void;
    unhidePdfPage: (pageIndex: number) => void;

    setIsOverlayMode: (value: boolean) => void;

    // TF Page Actions
    insertTFPage: (pageIndex: number, themeId: string) => void;
    setTFPageTheme: (pageIndex: number, themeId: string) => void;
    removeTFPageTheme: (pageIndex: number) => void;
    setTFHeaderBrand: (brand: string) => void;
    setTFHeaderTopic: (topic: string) => void;
    setTFHeaderYoutube: (youtube: string) => void;
    setDefaultTFThemeId: (themeId: string | null) => void;

    // Computed helpers
    canUndo: () => boolean;
    canRedo: () => boolean;
    getTotalHeight: () => number;
}

export const useStore = create<CanvasState>((set, get) => ({
    // Initial state
    strokes: [],
    images: [],
    historyStack: [],
    redoStack: [],
    currentTool: 'pen',
    selectedImageId: null,
    projectName: 'Untitled Universe',
    pageCount: 1,
    currentPage: 1,
    pageHeight: 1123,
    zoom: 1,
    isFullscreen: false,
    isGridView: false,
    selectedGridPages: [],
    bookmarkedPages: [],
    gridFilter: 'all',
    gridZoomLevel: 'medium',

    // Separate widths - Dark Slate Aesthetic
    penColor: '#d7d5d5',     // Light Grey (silver ink)
    penWidth: 3,             // Finer control
    eraserWidth: 20,

    // Highlighter tool - Neon Yellow default
    highlighterColor: '#ffff00',
    highlighterWidth: 20,

    // Shape tool - default to rectangle
    activeShape: 'rectangle',

    // Background - Dark Slate
    canvasBackground: '#3e3d3d',  // Dark Grey
    canvasPattern: 'none',

    // Text tool - defaults
    textNodes: [],
    activeFont: 'Inter',
    activeFontSize: 24,
    activeFontWeight: 'normal',
    activeFontStyle: 'normal',
    activeTextBackground: 'transparent',
    selectedId: null,

    // Lasso selection - empty by default
    selectedStrokeIds: [],
    selectedTextIds: [],
    selectionRotation: 0,
    lassoMode: 'touch',

    // PDF Viewer
    documentId: null,
    pdfPageMapping: [],  // Will be populated when PDF loads
    canvasDimensions: { width: 0, height: 0 },  // Will be set to screen size on mount
    hiddenPdfPages: [],  // No hidden pages initially

    // Clipboard
    clipboard: null,

    // Overlay Mode
    isOverlayMode: false,
    setIsOverlayMode: (value: boolean) => set({ isOverlayMode: value }),

    // TrickFunda Defaults
    tfPageThemes: {},
    defaultTFThemeId: null,
    tfHeaderBrand: '🎯 TrickFunda',
    tfHeaderTopic: '',
    tfHeaderYoutube: 'youtube.com/@TrickFunda',

    isSmartShapeEnabled: false,
    setIsSmartShapeEnabled: (value: boolean) => set({ isSmartShapeEnabled: value }),



    // Add stroke with unified history
    addStroke: (strokeData, forceEraser, isShape, isHighlighter) => {
        const state = get();
        // Use forceEraser if provided (for barrel button), otherwise check current tool
        const isEraser = forceEraser !== undefined ? forceEraser : state.currentTool === 'eraser';
        // Use isHighlighter if provided, otherwise check current tool
        const highlighter = isHighlighter !== undefined ? isHighlighter : state.currentTool === 'highlighter';

        // Determine size and color based on tool type
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
        
        return stroke.id;
    },

    // Add image with unified history + auto-select
    addImage: (image) => {
        const state = get();
        set({
            images: [...state.images, image],
            historyStack: [...state.historyStack, { type: 'image', data: image }],
            redoStack: [],
            currentTool: 'select',
            selectedImageId: image.id,
        });
    },

    // Select/deselect image
    selectImage: (id) => {
        set({ selectedImageId: id });
    },

    // Update image properties
    updateImage: (id, updates) => {
        set((state) => ({
            images: state.images.map((img) =>
                img.id === id ? { ...img, ...updates } : img
            ),
        }));
    },

    // Delete selected image (with undo support)
    deleteSelectedImage: () => {
        const state = get();
        if (!state.selectedImageId) return;

        const imageToDelete = state.images.find(img => img.id === state.selectedImageId);
        if (!imageToDelete) return;

        set({
            images: state.images.filter(img => img.id !== state.selectedImageId),
            historyStack: [...state.historyStack, { type: 'image', data: { ...imageToDelete, _deleted: true } as CanvasImage }],
            redoStack: [],
            selectedImageId: null,
            currentTool: 'select',  // Keep user in select mode
        });
    },

    // Copy selected image to clipboard
    copyImage: () => {
        const state = get();
        if (!state.selectedImageId) return;

        const imageToCopy = state.images.find(img => img.id === state.selectedImageId);
        if (!imageToCopy) return;

        // Deep clone the image (excluding id which will be regenerated on paste)
        set({ clipboard: { ...imageToCopy } });
    },

    // Hide PDF Page
    hidePdfPage: (pageIndex) => {
        const state = get();
        if (!state.documentId) return;

        const newMapping = [...(state.pdfPageMapping || [])];
        if (newMapping.length === 0) return;

        set({ hiddenPdfPages: [...state.hiddenPdfPages, pageIndex] });
    },

    // Unhide PDF Page
    unhidePdfPage: (pageIndex) => {
        const state = get();
        set({ hiddenPdfPages: state.hiddenPdfPages.filter(p => p !== pageIndex) });
    },

    // Paste image from clipboard to center of current page
    pasteImage: () => {
        const state = get();
        if (!state.clipboard) return;

        // Clone the image
        const newImg: CanvasImage = { ...state.clipboard };

        // Generate new unique ID
        newImg.id = crypto.randomUUID();

        // Calculate center of current page
        const pageWidth = state.canvasDimensions.width;
        const pageHeight = state.canvasDimensions.height;
        const pageTop = (state.currentPage - 1) * (pageHeight + PDF_PAGE_GAP);

        // Center the image on the current page
        newImg.x = (pageWidth / 2) - (newImg.width / 2);
        newImg.y = pageTop + (pageHeight / 2) - (newImg.height / 2);

        // Add to store and select
        set({
            images: [...state.images, newImg],
            historyStack: [...state.historyStack, { type: 'image', data: newImg }],
            redoStack: [],
            selectedImageId: newImg.id,
            currentTool: 'select',
        });
    },

    // Add text node with unified history + auto-select
    addTextNode: (node, switchTool = true) => {
        const state = get();
        
        const updates: Partial<CanvasState> = {
            textNodes: [...state.textNodes, node],
            historyStack: [...state.historyStack, { type: 'text', data: node }],
            redoStack: [],
        };
        
        if (switchTool) {
            updates.currentTool = 'select';
            updates.selectedId = node.id;
        }
        
        set(updates);
    },

    // Update text node properties
    updateTextNode: (id, updates) => {
        set((state) => ({
            textNodes: state.textNodes.map((node) =>
                node.id === id ? { ...node, ...updates } : node
            ),
        }));
    },

    // Delete text node (with undo support)
    deleteTextNode: (id) => {
        const state = get();
        const nodeToDelete = state.textNodes.find(node => node.id === id);
        if (!nodeToDelete) return;

        set({
            textNodes: state.textNodes.filter(node => node.id !== id),
            historyStack: [...state.historyStack, { type: 'text', data: { ...nodeToDelete, _deleted: true } as any }],
            redoStack: [],
            selectedId: state.selectedId === id ? null : state.selectedId,
        });
    },

    deleteSelectedObject: () => {
        const state = get();
        if (!state.selectedId) return;

        // Check if it's an image
        const image = state.images.find(img => img.id === state.selectedId);
        if (image) {
            set({
                images: state.images.filter(img => img.id !== state.selectedId),
                historyStack: [...state.historyStack, { type: 'image', data: { ...image, _deleted: true } as CanvasImage }],
                redoStack: [],
                selectedId: null,
                currentTool: 'select',
            });
            return;
        }

        // Check if it's a text node
        const textNode = state.textNodes.find(node => node.id === state.selectedId);
        if (textNode) {
            set({
                textNodes: state.textNodes.filter(node => node.id !== state.selectedId),
                historyStack: [...state.historyStack, { type: 'text', data: { ...textNode, _deleted: true } as any }],
                redoStack: [],
                selectedId: null,
                currentTool: 'select',
            });
        }
    },

    // Delete specific strokes (for Eraser)
    deleteStrokes: (ids: string[]) => {
        const state = get();
        if (ids.length === 0) return;

        const deletedStrokes = state.strokes.filter(s => ids.includes(s.id));
        const newStrokes = state.strokes.filter(s => !ids.includes(s.id));

        set({
            strokes: newStrokes,
            historyStack: [...state.historyStack, { type: 'delete_strokes', data: deletedStrokes }],
            redoStack: [],
            selectedStrokeIds: state.selectedStrokeIds.filter(id => !ids.includes(id))
        });
    },

    // Unified undo
    undo: () => {
        const state = get();
        if (state.historyStack.length === 0) return;

        const lastAction = state.historyStack[state.historyStack.length - 1];
        const newHistoryStack = state.historyStack.slice(0, -1);

        if (lastAction.type === 'stroke') {
            set({
                strokes: state.strokes.filter(s => s.id !== lastAction.data.id),
                historyStack: newHistoryStack,
                redoStack: [...state.redoStack, lastAction],
            });
        } else if (lastAction.type === 'delete_strokes') {
            const strokesToRestore = lastAction.data as Stroke[];
            set({
                strokes: [...state.strokes, ...strokesToRestore],
                historyStack: newHistoryStack,
                redoStack: [...state.redoStack, lastAction],
            });
        } else if (lastAction.type === 'image') {
            const imageData = lastAction.data as CanvasImage & { _deleted?: boolean };

            if (imageData._deleted) {
                // Undoing a deletion - restore the image
                const { _deleted, ...cleanImage } = imageData;
                set({
                    images: [...state.images, cleanImage as CanvasImage],
                    historyStack: newHistoryStack,
                    redoStack: [...state.redoStack, lastAction],
                    selectedImageId: cleanImage.id,  // Select the restored image
                });
            } else {
                // Undoing an add - remove the image
                set({
                    images: state.images.filter(i => i.id !== lastAction.data.id),
                    historyStack: newHistoryStack,
                    redoStack: [...state.redoStack, lastAction],
                    selectedImageId: state.selectedImageId === lastAction.data.id ? null : state.selectedImageId,
                });
            }
        } else if (lastAction.type === 'text') {
            const textData = lastAction.data as TextNode & { _deleted?: boolean };

            if (textData._deleted) {
                // Undoing a deletion - restore the text node
                const { _deleted, ...cleanNode } = textData;
                set({
                    textNodes: [...state.textNodes, cleanNode as TextNode],
                    historyStack: newHistoryStack,
                    redoStack: [...state.redoStack, lastAction],
                    selectedId: cleanNode.id,  // Select the restored node
                });
            } else {
                // Undoing an add - remove the text node
                set({
                    textNodes: state.textNodes.filter(n => n.id !== lastAction.data.id),
                    historyStack: newHistoryStack,
                    redoStack: [...state.redoStack, lastAction],
                    selectedId: state.selectedId === lastAction.data.id ? null : state.selectedId,
                });
            }
        } else if (lastAction.type === 'page_op') {
            const { operation, pageIndex, deletedStrokes, deletedImages } = lastAction as any; // Cast needed if TS doesn't infer

            if (operation === 'insert') {
                // Undo insert = Delete the page at index (without pushing to history)
                // We need to shift everything UP from below the pageIndex
                const topThreshold = pageIndex * state.pageHeight;
                const bottomThreshold = (pageIndex + 1) * state.pageHeight;

                // Since it was an insert, there shouldn't be content *on* the page unless user drew on it
                // But for "undo", we assume we revert to exact state. 
                // Any content user added to the new page will be lost (or we should shift it? No, undo should strictly reverse).
                // Actually, if we undo the insert, we merge the content below back up.

                // Simplified Undo Insert: Delete the page and shift up, discard any content on it.

                const newStrokes = state.strokes
                    .filter(s => {
                        const y = s.points[0]?.y;
                        if (y === undefined) return true;
                        return !(y >= topThreshold && y < bottomThreshold);
                    })
                    .map(s => {
                        const y = s.points[0]?.y;
                        if (y !== undefined && y >= bottomThreshold) {
                            return { ...s, points: s.points.map(p => ({ ...p, y: p.y - state.pageHeight })) };
                        }
                        return s;
                    });

                const newImages = state.images
                    .filter(img => !(img.y >= topThreshold && img.y < bottomThreshold))
                    .map(img => {
                        if (img.y >= bottomThreshold) {
                            return { ...img, y: img.y - state.pageHeight };
                        }
                        return img;
                    });

                set({
                    pageCount: state.pageCount - 1,
                    strokes: newStrokes,
                    images: newImages,
                    historyStack: newHistoryStack,
                    redoStack: [...state.redoStack, lastAction]
                });

            } else if (operation === 'delete') {
                // Undo delete = Insert page at index and restore content
                const insertThreshold = pageIndex * state.pageHeight; // The top of the deleted page

                // 1. Shift existing content DOWN to make room
                // existing content at >= insertThreshold needs to move +PAGE_HEIGHT
                const shiftedStrokes = state.strokes.map(s => {
                    const y = s.points[0]?.y;
                    if (y !== undefined && y >= insertThreshold) {
                        return { ...s, points: s.points.map(p => ({ ...p, y: p.y + state.pageHeight })) };
                    }
                    return s;
                });

                const shiftedImages = state.images.map(img => {
                    if (img.y >= insertThreshold) {
                        return { ...img, y: img.y + state.pageHeight };
                    }
                    return img;
                });

                // 2. Restore deleted content
                // deleted content coordinates are already relative to the page's original position 
                // (which is now restored). So we just add them back.

                set({
                    pageCount: state.pageCount + 1,
                    strokes: [...shiftedStrokes, ...(deletedStrokes || [])],
                    images: [...shiftedImages, ...(deletedImages || [])],
                    historyStack: newHistoryStack,
                    redoStack: [...state.redoStack, lastAction]
                });
            }
        }
    },

    // Unified redo
    redo: () => {
        const state = get();
        if (state.redoStack.length === 0) return;

        const actionToRedo = state.redoStack[state.redoStack.length - 1];
        const newRedoStack = state.redoStack.slice(0, -1);

        if (actionToRedo.type === 'stroke') {
            set({
                strokes: [...state.strokes, actionToRedo.data],
                historyStack: [...state.historyStack, actionToRedo],
                redoStack: newRedoStack,
            });
        } else if (actionToRedo.type === 'delete_strokes') {
            const strokesToDelete = actionToRedo.data as Stroke[];
            const idsToDelete = strokesToDelete.map(s => s.id);
            set({
                strokes: state.strokes.filter(s => !idsToDelete.includes(s.id)),
                historyStack: [...state.historyStack, actionToRedo],
                redoStack: newRedoStack,
            });
        } else if (actionToRedo.type === 'image') {
            const imageData = actionToRedo.data as CanvasImage & { _deleted?: boolean };

            if (imageData._deleted) {
                // Redoing a deletion - remove the image again
                set({
                    images: state.images.filter(i => i.id !== imageData.id),
                    historyStack: [...state.historyStack, actionToRedo],
                    redoStack: newRedoStack,
                    selectedImageId: state.selectedImageId === imageData.id ? null : state.selectedImageId,
                });
            } else {
                // Redoing an add - add the image back
                set({
                    images: [...state.images, actionToRedo.data],
                    historyStack: [...state.historyStack, actionToRedo],
                    redoStack: newRedoStack,
                });
            }
        } else if (actionToRedo.type === 'text') {
            const textData = actionToRedo.data as TextNode & { _deleted?: boolean };

            if (textData._deleted) {
                // Redoing a deletion - remove the text node again
                set({
                    textNodes: state.textNodes.filter(n => n.id !== textData.id),
                    historyStack: [...state.historyStack, actionToRedo],
                    redoStack: newRedoStack,
                    selectedId: state.selectedId === textData.id ? null : state.selectedId,
                });
            } else {
                // Redoing an add - add the text node back
                set({
                    textNodes: [...state.textNodes, actionToRedo.data],
                    historyStack: [...state.historyStack, actionToRedo],
                    redoStack: newRedoStack,
                });
            }
        } else if (actionToRedo.type === 'page_op') {
            // Redo is same as doing the action again
            const { operation, pageIndex } = actionToRedo as any;

            if (operation === 'insert') {
                // Redo insert: Call logic similar to insertPageAfter but specific to this action
                // Reuse insertPageAfter logic but without pushing to history (since we handle stacks manually here)
                // OR just call insertPageAfter but we need to manage stacks.
                // Better to duplicate logic for purity.

                const insertThreshold = pageIndex * state.pageHeight; // Note: pageIndex in op is the *new* index
                // Wait, insertPageAfter(i) creates page at i+1. 
                // If op.pageIndex is the resulting index, then we shift from there.
                // Let's assume op.pageIndex is the index of the inserted page.

                const shiftThreshold = actionToRedo.pageIndex * state.pageHeight; // This is the TOP of the inserted page

                const newStrokes = state.strokes.map(s => {
                    if (s.points[0].y >= shiftThreshold) {
                        return { ...s, points: s.points.map(p => ({ ...p, y: p.y + state.pageHeight })) };
                    }
                    return s;
                });

                const newImages = state.images.map(img => {
                    if (img.y >= shiftThreshold) {
                        return { ...img, y: img.y + state.pageHeight };
                    }
                    return img;
                });

                set({
                    pageCount: state.pageCount + 1,
                    strokes: newStrokes,
                    images: newImages,
                    historyStack: [...state.historyStack, actionToRedo],
                    redoStack: newRedoStack
                });

            } else if (operation === 'delete') {
                // Redo delete: Delete page at index
                const topThreshold = pageIndex * state.pageHeight;
                const bottomThreshold = (pageIndex + 1) * state.pageHeight;

                const newStrokes = state.strokes
                    .filter(s => !(s.points[0].y >= topThreshold && s.points[0].y < bottomThreshold))
                    .map(s => {
                        if (s.points[0].y >= bottomThreshold) {
                            return { ...s, points: s.points.map(p => ({ ...p, y: p.y - state.pageHeight })) };
                        }
                        return s;
                    });

                const newImages = state.images
                    .filter(img => !(img.y >= topThreshold && img.y < bottomThreshold))
                    .map(img => {
                        if (img.y >= bottomThreshold) {
                            return { ...img, y: img.y - state.pageHeight };
                        }
                        return img;
                    });

                set({
                    pageCount: state.pageCount - 1,
                    strokes: newStrokes,
                    images: newImages,
                    historyStack: [...state.historyStack, actionToRedo],
                    redoStack: newRedoStack
                });
            }
        }
    },

    toggleGridView: () => set((state) => ({ isGridView: !state.isGridView })),
    setIsGridView: (isGrid) => set({ isGridView: isGrid }),

    // Grid View Enhancements
    toggleGridPageSelection: (index, multiSelect) => {
        const state = get();
        if (multiSelect) {
            set({
                selectedGridPages: state.selectedGridPages.includes(index)
                    ? state.selectedGridPages.filter((i) => i !== index)
                    : [...state.selectedGridPages, index]
            });
        } else {
            set({
                selectedGridPages: state.selectedGridPages.includes(index) && state.selectedGridPages.length === 1
                    ? [] // Toggle off if it's the only one selected
                    : [index]
            });
        }
    },
    clearGridSelection: () => set({ selectedGridPages: [] }),
    togglePageBookmark: (index) => {
        const state = get();
        set({
            bookmarkedPages: state.bookmarkedPages.includes(index)
                ? state.bookmarkedPages.filter((i) => i !== index)
                : [...state.bookmarkedPages, index]
        });
    },
    setGridFilter: (filter) => set({ gridFilter: filter }),
    setGridZoomLevel: (level) => set({ gridZoomLevel: level }),
    
    deleteSelectedGridPages: () => {
        const state = get();
        // Sort descending so deleting doesn't shift indexes of remaining pages to be deleted
        const sortedPages = [...state.selectedGridPages].sort((a, b) => b - a);
        sortedPages.forEach(pageIndex => {
            get().deletePage(pageIndex);
        });
        set({ selectedGridPages: [] });
    },

    // Set current page (tracked by scroll)
    setCurrentPage: (page) => set({ currentPage: page }),

    // Insert a blank page after the specified page index
    insertPageAfter: (pageIndex) => {
        const state = get();
        // Calculate threshold including gaps between pages
        const singlePageTotal = state.pageHeight + PDF_PAGE_GAP;
        const insertThreshold = (pageIndex + 1) * singlePageTotal;
        const shiftAmount = singlePageTotal; // Shift by page height + gap

        // Shift strokes
        const newStrokes = state.strokes.map(stroke => {
            // Check if stroke starts below or exactly at the threshold
            const y = stroke.points[0]?.y;
            if (y !== undefined && y >= insertThreshold) {
                return {
                    ...stroke,
                    points: stroke.points.map(p => ({ ...p, y: p.y + shiftAmount }))
                };
            }
            return stroke;
        });

        // Shift images
        const newImages = state.images.map(img => {
            if (img.y >= insertThreshold) {
                return { ...img, y: img.y + shiftAmount };
            }
            return img;
        });

        // Shift text nodes
        const newTextNodes = state.textNodes.map(node => {
            if (node.y >= insertThreshold) {
                return { ...node, y: node.y + shiftAmount };
            }
            return node;
        });

        // Handle PDF page mapping
        let newMapping = (state.pdfPageMapping || []).length > 0 
            ? [...state.pdfPageMapping] 
            : (state.documentId ? Array.from({ length: state.pageCount }, (_, i) => i + 1) : []);
        if (newMapping.length > 0) {
            newMapping.splice(pageIndex + 1, 0, null);
        }

        // Shift TF page themes: entries at pageIndex+1 and beyond need their index incremented
        const oldThemes = state.tfPageThemes;
        const newThemes: Record<number, string> = {};
        for (const [key, val] of Object.entries(oldThemes)) {
            const idx = Number(key);
            if (idx > pageIndex) {
                newThemes[idx + 1] = val;
            } else {
                newThemes[idx] = val;
            }
        }
        
        if (state.defaultTFThemeId) {
            newThemes[pageIndex + 1] = state.defaultTFThemeId;
        }

        set({
            pageCount: state.pageCount + 1,
            strokes: newStrokes,
            images: newImages,
            textNodes: newTextNodes,
            pdfPageMapping: newMapping,
            tfPageThemes: newThemes,
            historyStack: [
                ...state.historyStack,
                {
                    type: 'page_op',
                    operation: 'insert',
                    pageIndex: pageIndex + 1
                }
            ],
            redoStack: []
        });
    },

    // Delete a specific page and shift content up
    deletePage: (pageIndex) => {
        const state = get();
        if (state.pageCount <= 1) return; // Prevent deleting the last page

        // Calculate thresholds including gaps between pages
        const singlePageTotal = state.pageHeight + PDF_PAGE_GAP;
        const topThreshold = pageIndex * singlePageTotal;
        const bottomThreshold = topThreshold + state.pageHeight; // Only page content, not gap
        const shiftAmount = singlePageTotal; // Shift by page height + gap

        // Find content to delete (centrally located or starting within page)
        const strokesToDelete = state.strokes.filter(s => {
            const y = s.points[0]?.y;
            return y !== undefined && y >= topThreshold && y < bottomThreshold;
        });

        const imagesToDelete = state.images.filter(img =>
            img.y >= topThreshold && img.y < bottomThreshold
        );

        const textNodesToDelete = state.textNodes.filter(node =>
            node.y >= topThreshold && node.y < bottomThreshold
        );

        // Filter and shift remaining content
        const newStrokes = state.strokes
            .filter(s => {
                const y = s.points[0]?.y;
                if (y === undefined) return true; // keep strokes with no points just in case, or ignore them
                return !(y >= topThreshold && y < bottomThreshold);
            })
            .map(s => {
                const y = s.points[0]?.y;
                if (y !== undefined && y >= bottomThreshold) {
                    return {
                        ...s,
                        points: s.points.map(p => ({ ...p, y: p.y - shiftAmount }))
                    };
                }
                return s;
            });

        const newImages = state.images
            .filter(img => !(img.y >= topThreshold && img.y < bottomThreshold))
            .map(img => {
                if (img.y >= bottomThreshold) {
                    return { ...img, y: img.y - shiftAmount };
                }
                return img;
            });

        const newTextNodes = state.textNodes
            .filter(node => !(node.y >= topThreshold && node.y < bottomThreshold))
            .map(node => {
                if (node.y >= bottomThreshold) {
                    return { ...node, y: node.y - shiftAmount };
                }
                return node;
            });

        // Update PDF page mapping - remove slot at pageIndex
        let newMapping = (state.pdfPageMapping || []).length > 0 
            ? [...state.pdfPageMapping] 
            : (state.documentId ? Array.from({ length: state.pageCount }, (_, i) => i + 1) : []);
        if (newMapping.length > 0) {
            newMapping.splice(pageIndex, 1);
        }

        // Clean up TF page themes: remove the deleted page, shift remaining
        const oldThemes = state.tfPageThemes || {};
        const newThemes: Record<number, string> = {};
        for (const [key, val] of Object.entries(oldThemes)) {
            const idx = Number(key);
            if (idx === pageIndex) continue; // Remove deleted page
            if (idx > pageIndex) {
                newThemes[idx - 1] = val;
            } else {
                newThemes[idx] = val;
            }
        }

        set({
            pageCount: state.pageCount - 1,
            strokes: newStrokes,
            images: newImages,
            textNodes: newTextNodes,
            pdfPageMapping: newMapping,
            tfPageThemes: newThemes,
            historyStack: [
                ...state.historyStack,
                {
                    type: 'page_op',
                    operation: 'delete',
                    pageIndex,
                    deletedStrokes: strokesToDelete,
                    deletedImages: imagesToDelete
                }
            ],
            redoStack: []
        });
    },

    // Clear content on a specific page without deleting the page itself
    clearPage: (pageIndex) => {
        const state = get();
        const topThreshold = pageIndex * state.pageHeight;
        const bottomThreshold = (pageIndex + 1) * state.pageHeight;

        const newStrokes = state.strokes.filter(s => {
            const y = s.points[0]?.y;
            if (y === undefined) return true;
            return !(y >= topThreshold && y < bottomThreshold);
        });

        const newImages = state.images.filter(img =>
            !(img.y >= topThreshold && img.y < bottomThreshold)
        );

        const newTextNodes = state.textNodes.filter(node =>
            !(node.y >= topThreshold && node.y < bottomThreshold)
        );

        // Note: We're not adding this to history yet for simplicity, 
        // effectively making it "clear canvas" but for just one page. 
        // To support undo, we'd need a 'clear_page' op or generic batch delete.
        set({ strokes: newStrokes, images: newImages, textNodes: newTextNodes });
    },

    // Duplicate a specific page and insert it right after
    duplicatePage: (pageIndex) => {
        const state = get();
        
        // Step 1: Insert a blank page after the target page (this shifts content below it)
        state.insertPageAfter(pageIndex);
        
        // Wait for state to update, then get new state
        const newState = get();

        // Calculate thresholds for the original page
        const singlePageTotal = newState.pageHeight + PDF_PAGE_GAP;
        const topThreshold = pageIndex * singlePageTotal;
        const bottomThreshold = topThreshold + newState.pageHeight;
        
        const shiftAmount = singlePageTotal;

        // Step 2: Copy content from original page and shift it down by shiftAmount
        const strokesToCopy = newState.strokes
            .filter(s => {
                const y = s.points[0]?.y;
                return y !== undefined && y >= topThreshold && y < bottomThreshold;
            })
            .map(s => ({
                ...s,
                id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                points: s.points.map(p => ({ ...p, y: p.y + shiftAmount }))
            }));

        const imagesToCopy = newState.images
            .filter(img => img.y >= topThreshold && img.y < bottomThreshold)
            .map(img => ({
                ...img,
                id: Math.random().toString(36).substr(2, 9),
                y: img.y + shiftAmount
            }));

        const textNodesToCopy = newState.textNodes
            .filter(node => node.y >= topThreshold && node.y < bottomThreshold)
            .map(node => ({
                ...node,
                id: Math.random().toString(36).substr(2, 9),
                y: node.y + shiftAmount
            }));

        // Step 3: Copy the PDF page mapping if it exists
        let newMapping = [...(newState.pdfPageMapping || [])];
        if (newMapping.length > 0) {
            newMapping[pageIndex + 1] = newMapping[pageIndex];
        }

        // Apply duplicated content
        set({
            strokes: [...newState.strokes, ...strokesToCopy],
            images: [...newState.images, ...imagesToCopy],
            textNodes: [...newState.textNodes, ...textNodesToCopy],
            pdfPageMapping: newMapping,
        });
    },

    // Set current tool
    setTool: (tool) => {
        set({
            currentTool: tool,
            selectedImageId: tool !== 'select' ? null : get().selectedImageId,
        });
    },

    // Set project name
    setProjectName: (name) => set({ projectName: name }),

    // Add a new page at the end
    addPage: () => {
        set((state) => {
            // Handle PDF Page Mapping
            const baseMapping = (state.pdfPageMapping || []).length > 0 
                ? [...state.pdfPageMapping] 
                : (state.documentId ? Array.from({ length: state.pageCount }, (_, i) => i + 1) : []);
                
            const newMapping = baseMapping.length > 0 
                ? [...baseMapping, null] 
                : [];
                
            const newThemes = { ...state.tfPageThemes };
            if (state.defaultTFThemeId) {
                newThemes[state.pageCount] = state.defaultTFThemeId;
            }
                
            return {
                pageCount: state.pageCount + 1,
                pdfPageMapping: newMapping,
                tfPageThemes: newThemes
            };
        });
    },

    // Set page count directly (used for PDF import)
    // Also initializes the PDF page mapping to [1, 2, 3, ..., count]
    setPageCount: (count) => {
        const validCount = Math.max(1, count);
        set({
            pageCount: validCount,
            pdfPageMapping: Array.from({ length: validCount }, (_, i) => i + 1),
        });
    },

    // Set page height (called once on mount)
    setPageHeight: (height) => set({ pageHeight: height }),

    // Zoom controls (10% to 500%)
    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5.0, zoom)) }),
    zoomIn: () => set((state) => ({ zoom: Math.min(5.0, Math.round((state.zoom + 0.1) * 10) / 10) })),
    zoomOut: () => set((state) => ({ zoom: Math.max(0.1, Math.round((state.zoom - 0.1) * 10) / 10) })),
    resetZoom: () => set({ zoom: 1 }),
    fitToScreen: () => {
        // Calculate zoom to fill screen width using dynamic canvas dimensions
        const { canvasDimensions } = get();
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
        // Exact fit for Immersion Lock (no padding)
        const newZoom = screenWidth / canvasDimensions.width;
        set({ zoom: Math.max(0.1, Math.min(5.0, newZoom)) });
    },

    // Fullscreen / Zen Mode
    setIsFullscreen: (value) => set({ isFullscreen: value }),

    // Pen settings
    setPenColor: (color) => set({ penColor: color }),
    setPenWidth: (width) => set({ penWidth: Math.max(1, Math.min(50, width)) }),

    // Eraser settings
    setEraserWidth: (width) => set({ eraserWidth: Math.max(5, Math.min(100, width)) }),

    // Highlighter settings
    setHighlighterColor: (color) => set({ highlighterColor: color }),
    setHighlighterWidth: (width) => set({ highlighterWidth: Math.max(10, Math.min(50, width)) }),

    // Shape tool - sets active shape and switches to shape tool
    setShape: (shape) => set({ activeShape: shape, currentTool: 'shape' }),

    // Text tool settings
    setFont: (font) => set({ activeFont: font }),
    setFontSize: (size) => set({ activeFontSize: Math.max(12, Math.min(72, size)) }),
    setFontWeight: (weight) => set({ activeFontWeight: weight }),
    setFontStyle: (style) => set({ activeFontStyle: style }),
    setTextBackground: (color) => set({ activeTextBackground: color }),

    // Lasso selection actions
    selectStrokes: (ids) => set({ selectedStrokeIds: ids }),
    selectText: (ids) => set({ selectedTextIds: ids }),
    clearSelection: () => set({ selectedStrokeIds: [], selectedTextIds: [], selectionRotation: 0 }),

    transformStrokes: (dx, dy, scaleX = 1, scaleY = 1, origin) => {
        const state = get();
        const hasStrokes = state.selectedStrokeIds.length > 0;
        const hasText = state.selectedTextIds.length > 0;

        if (!hasStrokes && !hasText) return;

        // If scaling, we need an origin point (center of bbox)
        let center = origin;
        if ((scaleX !== 1 || scaleY !== 1) && !center) {
            // Calculate center from all selected items
            const selectedStrokes = state.strokes.filter(s => state.selectedStrokeIds.includes(s.id));
            const selectedTexts = state.textNodes.filter(t => state.selectedTextIds.includes(t.id));

            const strokePoints = selectedStrokes.flatMap(s => s.points);
            const strokeXs = strokePoints.map(p => p.x);
            const strokeYs = strokePoints.map(p => p.y);

            // Include text bounds
            const textXs = selectedTexts.flatMap(t => [t.x, t.x + t.content.length * t.fontSize * 0.6]);
            const textYs = selectedTexts.flatMap(t => [t.y, t.y + t.fontSize * 1.2]);

            const allXs = [...strokeXs, ...textXs];
            const allYs = [...strokeYs, ...textYs];

            if (allXs.length > 0 && allYs.length > 0) {
                center = {
                    x: (Math.min(...allXs) + Math.max(...allXs)) / 2,
                    y: (Math.min(...allYs) + Math.max(...allYs)) / 2,
                };
            }
        }

        const updates: Partial<CanvasState> = {};

        // Transform strokes
        if (hasStrokes) {
            updates.strokes = state.strokes.map(stroke =>
                state.selectedStrokeIds.includes(stroke.id)
                    ? {
                        ...stroke,
                        points: stroke.points.map(p => {
                            // First scale if needed
                            let newPoint = p;
                            if (scaleX !== 1 || scaleY !== 1) {
                                newPoint = {
                                    x: center!.x + (p.x - center!.x) * scaleX,
                                    y: center!.y + (p.y - center!.y) * scaleY,
                                    pressure: p.pressure,
                                };
                            }
                            // Then translate
                            return {
                                ...newPoint,
                                x: newPoint.x + dx,
                                y: newPoint.y + dy,
                            };
                        })
                    }
                    : stroke
            );
        }

        // Transform text nodes
        if (hasText) {
            updates.textNodes = state.textNodes.map(node =>
                state.selectedTextIds.includes(node.id)
                    ? {
                        ...node,
                        // Scale position relative to center
                        x: center ? center.x + (node.x - center.x) * scaleX + dx : node.x + dx,
                        y: center ? center.y + (node.y - center.y) * scaleY + dy : node.y + dy,
                        // Scale font size proportionally
                        fontSize: Math.max(8, Math.min(200, node.fontSize * scaleX)),
                    }
                    : node
            );
        }

        set(updates);
    },

    scaleSelectedStrokes: (factor) => {
        const state = get();
        const hasStrokes = state.selectedStrokeIds.length > 0;
        const hasText = state.selectedTextIds.length > 0;

        if (!hasStrokes && !hasText) return;

        // Calculate combined bounding box center
        const selectedStrokes = state.strokes.filter(s => state.selectedStrokeIds.includes(s.id));
        const selectedTexts = state.textNodes.filter(t => state.selectedTextIds.includes(t.id));

        const strokePoints = selectedStrokes.flatMap(s => s.points);
        const strokeXs = strokePoints.map(p => p.x);
        const strokeYs = strokePoints.map(p => p.y);
        const textXs = selectedTexts.flatMap(t => [t.x, t.x + t.content.length * t.fontSize * 0.6]);
        const textYs = selectedTexts.flatMap(t => [t.y, t.y + t.fontSize * 1.2]);

        const allXs = [...strokeXs, ...textXs];
        const allYs = [...strokeYs, ...textYs];

        if (allXs.length === 0 || allYs.length === 0) return;

        const center = {
            x: (Math.min(...allXs) + Math.max(...allXs)) / 2,
            y: (Math.min(...allYs) + Math.max(...allYs)) / 2,
        };

        const updates: Partial<CanvasState> = {};

        // Scale strokes
        if (hasStrokes) {
            updates.strokes = state.strokes.map(stroke =>
                state.selectedStrokeIds.includes(stroke.id)
                    ? {
                        ...stroke,
                        points: stroke.points.map(p => ({
                            x: center.x + (p.x - center.x) * factor,
                            y: center.y + (p.y - center.y) * factor,
                            pressure: p.pressure,
                        }))
                    }
                    : stroke
            );
        }

        // Scale text nodes
        if (hasText) {
            updates.textNodes = state.textNodes.map(node =>
                state.selectedTextIds.includes(node.id)
                    ? {
                        ...node,
                        x: center.x + (node.x - center.x) * factor,
                        y: center.y + (node.y - center.y) * factor,
                        fontSize: Math.max(8, Math.min(200, node.fontSize * factor)),
                    }
                    : node
            );
        }

        set(updates);
    },

    rotateSelection: (angleDelta) => {
        const state = get();
        const hasStrokes = state.selectedStrokeIds.length > 0;
        const hasText = state.selectedTextIds.length > 0;
        if (!hasStrokes && !hasText) return;

        // Calculate bbox center for rotation origin
        const selectedStrokes = state.strokes.filter(s => state.selectedStrokeIds.includes(s.id));
        const selectedTexts = state.textNodes.filter(t => state.selectedTextIds.includes(t.id));

        const strokePoints = selectedStrokes.flatMap(s => s.points);
        const textXs = selectedTexts.flatMap(t => [t.x, t.x + t.content.length * t.fontSize * 0.6]);
        const textYs = selectedTexts.flatMap(t => [t.y, t.y + t.fontSize * 1.2]);
        const allXs = [...strokePoints.map(p => p.x), ...textXs];
        const allYs = [...strokePoints.map(p => p.y), ...textYs];

        if (allXs.length === 0) return;

        const center = {
            x: (Math.min(...allXs) + Math.max(...allXs)) / 2,
            y: (Math.min(...allYs) + Math.max(...allYs)) / 2,
        };

        const updates: Partial<CanvasState> = {
            selectionRotation: state.selectionRotation + angleDelta,
        };

        if (hasStrokes) {
            updates.strokes = state.strokes.map(stroke =>
                state.selectedStrokeIds.includes(stroke.id)
                    ? {
                        ...stroke,
                        points: stroke.points.map(p => rotatePoint(p, center, angleDelta)),
                    }
                    : stroke
            );
        }

        if (hasText) {
            updates.textNodes = state.textNodes.map(node =>
                state.selectedTextIds.includes(node.id)
                    ? {
                        ...node,
                        x: center.x + (node.x - center.x) * Math.cos(angleDelta) - (node.y - center.y) * Math.sin(angleDelta),
                        y: center.y + (node.x - center.x) * Math.sin(angleDelta) + (node.y - center.y) * Math.cos(angleDelta),
                    }
                    : node
            );
        }

        set(updates);
    },

    flipSelectionHorizontal: () => {
        const state = get();
        const hasStrokes = state.selectedStrokeIds.length > 0;
        const hasText = state.selectedTextIds.length > 0;
        if (!hasStrokes && !hasText) return;

        const selectedStrokes = state.strokes.filter(s => state.selectedStrokeIds.includes(s.id));
        const selectedTexts = state.textNodes.filter(t => state.selectedTextIds.includes(t.id));
        const strokePoints = selectedStrokes.flatMap(s => s.points);
        const textXs = selectedTexts.flatMap(t => [t.x, t.x + t.content.length * t.fontSize * 0.6]);
        const allXs = [...strokePoints.map(p => p.x), ...textXs];
        if (allXs.length === 0) return;
        const centerX = (Math.min(...allXs) + Math.max(...allXs)) / 2;

        const updates: Partial<CanvasState> = {};
        if (hasStrokes) {
            updates.strokes = state.strokes.map(stroke =>
                state.selectedStrokeIds.includes(stroke.id)
                    ? { ...stroke, points: stroke.points.map(p => ({ ...p, x: 2 * centerX - p.x })) }
                    : stroke
            );
        }
        if (hasText) {
            updates.textNodes = state.textNodes.map(node =>
                state.selectedTextIds.includes(node.id)
                    ? { ...node, x: 2 * centerX - node.x - node.content.length * node.fontSize * 0.6 }
                    : node
            );
        }
        set(updates);
    },

    flipSelectionVertical: () => {
        const state = get();
        const hasStrokes = state.selectedStrokeIds.length > 0;
        const hasText = state.selectedTextIds.length > 0;
        if (!hasStrokes && !hasText) return;

        const selectedStrokes = state.strokes.filter(s => state.selectedStrokeIds.includes(s.id));
        const selectedTexts = state.textNodes.filter(t => state.selectedTextIds.includes(t.id));
        const strokePoints = selectedStrokes.flatMap(s => s.points);
        const textYs = selectedTexts.flatMap(t => [t.y, t.y + t.fontSize * 1.2]);
        const allYs = [...strokePoints.map(p => p.y), ...textYs];
        if (allYs.length === 0) return;
        const centerY = (Math.min(...allYs) + Math.max(...allYs)) / 2;

        const updates: Partial<CanvasState> = {};
        if (hasStrokes) {
            updates.strokes = state.strokes.map(stroke =>
                state.selectedStrokeIds.includes(stroke.id)
                    ? { ...stroke, points: stroke.points.map(p => ({ ...p, y: 2 * centerY - p.y })) }
                    : stroke
            );
        }
        if (hasText) {
            updates.textNodes = state.textNodes.map(node =>
                state.selectedTextIds.includes(node.id)
                    ? { ...node, y: 2 * centerY - node.y - node.fontSize * 1.2 }
                    : node
            );
        }
        set(updates);
    },

    changeSelectionColor: (color) => {
        const state = get();
        const updates: Partial<CanvasState> = {};
        if (state.selectedStrokeIds.length > 0) {
            updates.strokes = state.strokes.map(stroke =>
                state.selectedStrokeIds.includes(stroke.id) ? { ...stroke, color } : stroke
            );
        }
        if (state.selectedTextIds.length > 0) {
            updates.textNodes = state.textNodes.map(node =>
                state.selectedTextIds.includes(node.id) ? { ...node, color } : node
            );
        }
        set(updates);
    },

    changeSelectionOpacity: (opacity) => {
        const state = get();
        if (state.selectedStrokeIds.length > 0) {
            set({
                strokes: state.strokes.map(stroke =>
                    state.selectedStrokeIds.includes(stroke.id) ? { ...stroke, opacity } : stroke
                ),
            });
        }
    },

    changeSelectionStrokeWidth: (width) => {
        const state = get();
        if (state.selectedStrokeIds.length > 0) {
            set({
                strokes: state.strokes.map(stroke =>
                    state.selectedStrokeIds.includes(stroke.id) ? { ...stroke, size: width } : stroke
                ),
            });
        }
    },

    alignSelection: (direction) => {
        const state = get();
        const hasStrokes = state.selectedStrokeIds.length > 0;
        const hasText = state.selectedTextIds.length > 0;
        if (!hasStrokes && !hasText) return;

        const selectedStrokes = state.strokes.filter(s => state.selectedStrokeIds.includes(s.id));
        const selectedTexts = state.textNodes.filter(t => state.selectedTextIds.includes(t.id));

        // Calculate overall bounding box
        const strokePoints = selectedStrokes.flatMap(s => s.points);
        const textXs = selectedTexts.flatMap(t => [t.x, t.x + t.content.length * t.fontSize * 0.6]);
        const textYs = selectedTexts.flatMap(t => [t.y, t.y + t.fontSize * 1.2]);
        const allXs = [...strokePoints.map(p => p.x), ...textXs];
        const allYs = [...strokePoints.map(p => p.y), ...textYs];
        if (allXs.length === 0) return;

        const overallMinX = Math.min(...allXs);
        const overallMaxX = Math.max(...allXs);
        const overallMinY = Math.min(...allYs);
        const overallMaxY = Math.max(...allYs);
        const overallCenterX = (overallMinX + overallMaxX) / 2;
        const overallCenterY = (overallMinY + overallMaxY) / 2;

        const updates: Partial<CanvasState> = {};

        if (hasStrokes) {
            updates.strokes = state.strokes.map(stroke => {
                if (!state.selectedStrokeIds.includes(stroke.id)) return stroke;
                const xs = stroke.points.map(p => p.x);
                const ys = stroke.points.map(p => p.y);
                const sMinX = Math.min(...xs);
                const sMaxX = Math.max(...xs);
                const sMinY = Math.min(...ys);
                const sMaxY = Math.max(...ys);
                const sCenterX = (sMinX + sMaxX) / 2;
                const sCenterY = (sMinY + sMaxY) / 2;

                let dx = 0, dy = 0;
                switch (direction) {
                    case 'left': dx = overallMinX - sMinX; break;
                    case 'center-h': dx = overallCenterX - sCenterX; break;
                    case 'right': dx = overallMaxX - sMaxX; break;
                    case 'top': dy = overallMinY - sMinY; break;
                    case 'center-v': dy = overallCenterY - sCenterY; break;
                    case 'bottom': dy = overallMaxY - sMaxY; break;
                }
                return { ...stroke, points: stroke.points.map(p => ({ ...p, x: p.x + dx, y: p.y + dy })) };
            });
        }

        if (hasText) {
            updates.textNodes = state.textNodes.map(node => {
                if (!state.selectedTextIds.includes(node.id)) return node;
                const nWidth = node.content.length * node.fontSize * 0.6;
                const nHeight = node.fontSize * 1.2;
                const nCenterX = node.x + nWidth / 2;
                const nCenterY = node.y + nHeight / 2;

                let dx = 0, dy = 0;
                switch (direction) {
                    case 'left': dx = overallMinX - node.x; break;
                    case 'center-h': dx = overallCenterX - nCenterX; break;
                    case 'right': dx = overallMaxX - (node.x + nWidth); break;
                    case 'top': dy = overallMinY - node.y; break;
                    case 'center-v': dy = overallCenterY - nCenterY; break;
                    case 'bottom': dy = overallMaxY - (node.y + nHeight); break;
                }
                return { ...node, x: node.x + dx, y: node.y + dy };
            });
        }

        set(updates);
    },

    groupSelection: () => {
        const state = get();
        const hasStrokes = state.selectedStrokeIds.length > 0;
        const hasText = state.selectedTextIds.length > 0;
        if (!hasStrokes && !hasText) return;

        const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const updates: Partial<CanvasState> = {};

        if (hasStrokes) {
            updates.strokes = state.strokes.map(stroke =>
                state.selectedStrokeIds.includes(stroke.id) ? { ...stroke, groupId } : stroke
            );
        }
        if (hasText) {
            updates.textNodes = state.textNodes.map(node =>
                state.selectedTextIds.includes(node.id) ? { ...node, groupId } : node
            );
        }
        set(updates);
    },

    ungroupSelection: () => {
        const state = get();
        const updates: Partial<CanvasState> = {};

        if (state.selectedStrokeIds.length > 0) {
            updates.strokes = state.strokes.map(stroke =>
                state.selectedStrokeIds.includes(stroke.id) ? { ...stroke, groupId: undefined } : stroke
            );
        }
        if (state.selectedTextIds.length > 0) {
            updates.textNodes = state.textNodes.map(node =>
                state.selectedTextIds.includes(node.id) ? { ...node, groupId: undefined } : node
            );
        }
        set(updates);
    },

    duplicateSelectedStrokes: () => {
        const state = get();
        if (state.selectedStrokeIds.length === 0 && state.selectedTextIds.length === 0) return;

        const selectedStrokes = state.strokes.filter(s => state.selectedStrokeIds.includes(s.id));
        const duplicates = selectedStrokes.map(stroke => ({
            ...stroke,
            id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            points: stroke.points.map(p => ({
                ...p,
                x: p.x + 20,
                y: p.y + 20,
            }))
        }));

        const selectedTexts = state.textNodes.filter(t => state.selectedTextIds.includes(t.id));
        const textDuplicates = selectedTexts.map(node => ({
            ...node,
            id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x: node.x + 20,
            y: node.y + 20,
        }));

        set({
            strokes: [...state.strokes, ...duplicates],
            textNodes: [...state.textNodes, ...textDuplicates],
            selectedStrokeIds: duplicates.map(d => d.id),
            selectedTextIds: textDuplicates.map(d => d.id),
        });
    },

    deleteSelectedStrokes: () => {
        const state = get();
        const hasStrokes = state.selectedStrokeIds.length > 0;
        const hasText = state.selectedTextIds.length > 0;

        if (!hasStrokes && !hasText) return;

        set({
            strokes: state.strokes.filter(s => !state.selectedStrokeIds.includes(s.id)),
            textNodes: state.textNodes.filter(t => !state.selectedTextIds.includes(t.id)),
            selectedStrokeIds: [],
            selectedTextIds: [],
        });
    },

    clearStrokeSelection: () => set({ selectedStrokeIds: [] }),

    // Background settings
    setCanvasBackground: (color) => set({ canvasBackground: color }),
    setCanvasPattern: (pattern) => set({ canvasPattern: pattern }),

    // Clear everything
    clearCanvas: () => set({
        strokes: [],
        images: [],
        historyStack: [],
        redoStack: [],
        selectedImageId: null,
        pageCount: 1, // Reset to single page
    }),

    // Insert a TrickFunda branded page after the given page index
    insertTFPage: (pageIndex, themeId) => {
        const state = get();
        // Calculate threshold including gaps between pages
        const singlePageTotal = state.pageHeight + PDF_PAGE_GAP;
        const insertThreshold = (pageIndex + 1) * singlePageTotal;
        const shiftAmount = singlePageTotal;

        // Shift strokes
        const newStrokes = state.strokes.map(stroke => {
            if (stroke.points[0].y >= insertThreshold) {
                return {
                    ...stroke,
                    points: stroke.points.map(p => ({ ...p, y: p.y + shiftAmount }))
                };
            }
            return stroke;
        });

        // Shift images
        const newImages = state.images.map(img => {
            if (img.y >= insertThreshold) {
                return { ...img, y: img.y + shiftAmount };
            }
            return img;
        });

        // Shift text nodes
        const newTextNodes = state.textNodes.map(node => {
            if (node.y >= insertThreshold) {
                return { ...node, y: node.y + shiftAmount };
            }
            return node;
        });

        // Update PDF page mapping
        let newMapping = (state.pdfPageMapping || []).length > 0 
            ? [...state.pdfPageMapping] 
            : (state.documentId ? Array.from({ length: state.pageCount }, (_, i) => i + 1) : []);
        if (newMapping.length > 0) {
            newMapping.splice(pageIndex + 1, 0, null);
        }

        // Shift existing TF themes and add new one
        const oldThemes = state.tfPageThemes;
        const newThemes: Record<number, string> = {};
        for (const [key, val] of Object.entries(oldThemes)) {
            const idx = Number(key);
            if (idx > pageIndex) {
                newThemes[idx + 1] = val;
            } else {
                newThemes[idx] = val;
            }
        }
        newThemes[pageIndex + 1] = themeId; // Set theme for the new page

        set({
            pageCount: state.pageCount + 1,
            strokes: newStrokes,
            images: newImages,
            textNodes: newTextNodes,
            pdfPageMapping: newMapping,
            tfPageThemes: newThemes,
            historyStack: [
                ...state.historyStack,
                {
                    type: 'page_op',
                    operation: 'insert',
                    pageIndex: pageIndex + 1
                }
            ],
            redoStack: []
        });
    },
    
    setDefaultTFThemeId: (themeId) => set({ defaultTFThemeId: themeId }),

    // Set or change the TF theme for an existing page
    setTFPageTheme: (pageIndex, themeId) => {
        set((state) => ({
            tfPageThemes: { ...state.tfPageThemes, [pageIndex]: themeId }
        }));
    },

    // Remove TF theme from a page (revert to normal)
    removeTFPageTheme: (pageIndex) => {
        set((state) => {
            const newThemes = { ...state.tfPageThemes };
            delete newThemes[pageIndex];
            return { tfPageThemes: newThemes };
        });
    },

    setTFHeaderBrand: (tfHeaderBrand) => set({ tfHeaderBrand }),
    setTFHeaderTopic: (tfHeaderTopic) => set({ tfHeaderTopic }),
    setTFHeaderYoutube: (tfHeaderYoutube) => set({ tfHeaderYoutube }),

    // Persistence actions
    loadProject: async () => {
        const savedState = await loadState();
        if (savedState) {
            set({
                strokes: savedState.strokes || [],
                images: savedState.images || [],
                textNodes: savedState.textNodes || [],
                pageCount: savedState.pageCount || 1,
                projectName: savedState.projectName || 'Untitled Universe',
                canvasBackground: savedState.canvasBackground || '#3e3d3d',
                canvasPattern: (savedState.canvasPattern as Pattern) || 'none',
                penColor: savedState.penColor || '#d7d5d5',
                penWidth: savedState.penWidth || 3,
                activeFont: savedState.activeFont || 'Inter',
                activeFontSize: savedState.activeFontSize || 24,
                documentId: savedState.documentId || null,
                pdfPageMapping: savedState.pdfPageMapping || (savedState.documentId ? Array.from({ length: savedState.pageCount || 1 }, (_, i) => i + 1) : []),
                canvasDimensions: savedState.canvasDimensions || { width: 800, height: 1131 }, // Fallback A4
                tfPageThemes: savedState.tfPageThemes || {},
                defaultTFThemeId: savedState.defaultTFThemeId || null,
                tfHeaderBrand: savedState.tfHeaderBrand ?? '🎯 TrickFunda',
                tfHeaderTopic: savedState.tfHeaderTopic ?? '',
                tfHeaderYoutube: savedState.tfHeaderYoutube ?? 'youtube.com/@TrickFunda',
                // Clear history on load (fresh start)
                historyStack: [],
                redoStack: [],
            });
        }
    },

    resetProject: async () => {
        await clearState();
        set({
            strokes: [],
            images: [],
            textNodes: [],
            historyStack: [],
            redoStack: [],
            selectedImageId: null,
            selectedId: null,
            selectedStrokeIds: [],
            pageCount: 1,
            currentPage: 1,
            projectName: 'Untitled Universe',
            canvasBackground: '#3e3d3d',
            canvasPattern: 'none',
            penColor: '#d7d5d5',
            penWidth: 3,
            activeFont: 'Inter',
            activeFontSize: 24,
            documentId: null,
            pdfPageMapping: [],
            canvasDimensions: { width: 800, height: 1131 }, // Standard A4
            tfPageThemes: {},
            defaultTFThemeId: null,
            tfHeaderBrand: '🎯 TrickFunda',
            tfHeaderTopic: '',
            tfHeaderYoutube: 'youtube.com/@TrickFunda',
        });
    },

    getPersistedState: () => {
        const state = get();
        return {
            strokes: state.strokes,
            images: state.images,
            textNodes: state.textNodes,
            pageCount: state.pageCount,
            projectName: state.projectName,
            canvasBackground: state.canvasBackground,
            canvasPattern: state.canvasPattern,
            penColor: state.penColor,
            penWidth: state.penWidth,
            activeFont: state.activeFont,
            activeFontSize: state.activeFontSize,
            documentId: state.documentId,
            pdfPageMapping: state.pdfPageMapping,
            canvasDimensions: state.canvasDimensions,
            tfPageThemes: state.tfPageThemes,
            defaultTFThemeId: state.defaultTFThemeId,
            tfHeaderBrand: state.tfHeaderBrand,
            tfHeaderTopic: state.tfHeaderTopic,
            tfHeaderYoutube: state.tfHeaderYoutube,
        };
    },

    // PDF Viewer
    setDocument: (id, totalPages, width, height) => set((state) => {
        const updates: Partial<CanvasState> = {
            documentId: id,
            hiddenPdfPages: [], // Reset hidden pages
        };
        
        if (totalPages) {
            updates.pageCount = totalPages;
            updates.pdfPageMapping = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            updates.pdfPageMapping = [];
        }
        
        if (width && height) updates.canvasDimensions = { width, height };
        return updates;
    }),

    // Move page (reorders mapping AND moves all ink/images/text)
    movePage: (fromIndex, toIndex) => {
        const state = get();
        if (fromIndex === toIndex) return;
        if (fromIndex < 0 || fromIndex >= state.pageCount) return;
        if (toIndex < 0 || toIndex >= state.pageCount) return;

        const pageHeight = state.canvasDimensions.height;
        const pageTotal = pageHeight + PDF_PAGE_GAP;

        // 1. Reorder PDF Mapping
        const newMapping = [...state.pdfPageMapping];
        const [movedPage] = newMapping.splice(fromIndex, 1);
        newMapping.splice(toIndex, 0, movedPage);

        // 2. Compute y offset function for point-based elements (strokes)
        const shiftStrokes = (strokes: Stroke[]) => {
            return strokes.map(stroke => {
                const firstPoint = stroke.points[0];
                if (!firstPoint) return stroke;
                
                // Determine which page this stroke originated on
                const elPage = Math.floor(firstPoint.y / pageTotal);
                let yDelta = 0;

                if (elPage === fromIndex) {
                    // Moving the page itself
                    yDelta = (toIndex - fromIndex) * pageTotal;
                } else if (fromIndex < toIndex && elPage > fromIndex && elPage <= toIndex) {
                    // Page moved down, intervening pages shift up
                    yDelta = -pageTotal;
                } else if (fromIndex > toIndex && elPage >= toIndex && elPage < fromIndex) {
                    // Page moved up, intervening pages shift down
                    yDelta = pageTotal;
                }

                if (yDelta !== 0) {
                    return {
                        ...stroke,
                        points: stroke.points.map(p => ({ ...p, y: p.y + yDelta }))
                    };
                }
                return stroke;
            });
        };

        // 3. Compute y offset function for box-based elements (images, text)
        const shiftElements = <T extends { y: number }>(elements: T[]): T[] => {
            return elements.map(el => {
                const elPage = Math.floor(el.y / pageTotal);
                let yDelta = 0;

                if (elPage === fromIndex) {
                    yDelta = (toIndex - fromIndex) * pageTotal;
                } else if (fromIndex < toIndex && elPage > fromIndex && elPage <= toIndex) {
                    yDelta = -pageTotal;
                } else if (fromIndex > toIndex && elPage >= toIndex && elPage < fromIndex) {
                    yDelta = pageTotal;
                }

                if (yDelta !== 0) {
                    return { ...el, y: el.y + yDelta };
                }
                return el;
            });
        };

        // Reorder TF page themes
        const oldThemes = state.tfPageThemes;
        const newThemes: Record<number, string> = {};
        for (const [key, val] of Object.entries(oldThemes)) {
            const idx = Number(key);
            let newIdx = idx;
            if (idx === fromIndex) {
                newIdx = toIndex;
            } else if (fromIndex < toIndex && idx > fromIndex && idx <= toIndex) {
                newIdx = idx - 1;
            } else if (fromIndex > toIndex && idx >= toIndex && idx < fromIndex) {
                newIdx = idx + 1;
            }
            newThemes[newIdx] = val;
        }

        set({
            pdfPageMapping: newMapping,
            strokes: shiftStrokes(state.strokes),
            images: shiftElements(state.images),
            textNodes: shiftElements(state.textNodes),
            tfPageThemes: newThemes,
        });
    },

    // Set canvas dimensions (used when PDF loads)
    setCanvasDimensions: (width, height) => set({
        canvasDimensions: { width, height }
    }),

    // Hide PDF page (used when unlocking/detaching page to image)
    hidePdfPage: (pageIndex) => {
        const state = get();
        if (!state.hiddenPdfPages.includes(pageIndex)) {
            set({ hiddenPdfPages: [...state.hiddenPdfPages, pageIndex] });
        }
    },

    // Unhide PDF page (for undo)
    unhidePdfPage: (pageIndex) => {
        const state = get();
        set({ hiddenPdfPages: state.hiddenPdfPages.filter(p => p !== pageIndex) });
    },

    // Computed helpers
    canUndo: () => get().historyStack.length > 0,
    canRedo: () => get().redoStack.length > 0,
    getTotalHeight: () => get().pageCount * get().pageHeight,
}));

export default useStore;

