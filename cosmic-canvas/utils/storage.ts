import { set, get, del } from 'idb-keyval';
import { Stroke, CanvasImage, TextNode } from '@cosmic/types';

const STORAGE_KEY = 'cosmic-canvas-project';

/**
 * Serializable project state for persistence
 * Note: We don't save historyStack/redoStack (too complex, fresh history on load)
 */
export interface PersistedState {
    strokes: Stroke[];
    images: CanvasImage[];
    textNodes: TextNode[];
    pageCount: number;
    projectName: string;
    canvasBackground: string;
    canvasPattern: string;
    penColor: string;
    penWidth: number;
    activeFont: string;
    activeFontSize: number;
}

/**
 * Save state to IndexedDB
 * Called by auto-save with debounce
 */
export const saveState = async (state: PersistedState): Promise<void> => {
    try {
        await set(STORAGE_KEY, state);
        console.log('[BlackBox] State saved to IndexedDB');
    } catch (error) {
        console.error('[BlackBox] Failed to save state:', error);
    }
};

/**
 * Load state from IndexedDB
 * Returns null if no saved state exists
 */
export const loadState = async (): Promise<PersistedState | null> => {
    try {
        const state = await get<PersistedState>(STORAGE_KEY);
        if (state) {
            console.log('[BlackBox] State loaded from IndexedDB');
            return state;
        }
        return null;
    } catch (error) {
        console.error('[BlackBox] Failed to load state:', error);
        return null;
    }
};

/**
 * Clear saved state from IndexedDB
 * Used when starting a new project
 */
export const clearState = async (): Promise<void> => {
    try {
        await del(STORAGE_KEY);
        console.log('[BlackBox] State cleared from IndexedDB');
    } catch (error) {
        console.error('[BlackBox] Failed to clear state:', error);
    }
};

/**
 * Save raw PDF bytes to IndexedDB
 */
export const savePdf = async (id: string, buffer: ArrayBuffer): Promise<void> => {
    try {
        await set(`pdf_${id}`, buffer);
        console.log('[BlackBox] PDF saved to IndexedDB');
    } catch (error) {
        console.error('[BlackBox] Failed to save PDF:', error);
    }
};

/**
 * Load raw PDF bytes from IndexedDB
 */
export const loadPdf = async (id: string): Promise<ArrayBuffer | null> => {
    try {
        const buffer = await get<ArrayBuffer>(`pdf_${id}`);
        if (buffer) {
            console.log('[BlackBox] PDF loaded from IndexedDB');
            return buffer;
        }
        return null;
    } catch (error) {
        console.error('[BlackBox] Failed to load PDF:', error);
        return null;
    }
};

/**
 * Delete PDF bytes from IndexedDB
 */
export const deletePdf = async (id: string): Promise<void> => {
    try {
        await del(`pdf_${id}`);
        console.log('[BlackBox] PDF deleted from IndexedDB');
    } catch (error) {
        console.error('[BlackBox] Failed to delete PDF:', error);
    }
};
