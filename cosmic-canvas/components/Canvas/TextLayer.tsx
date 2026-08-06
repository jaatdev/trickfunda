'use client';

import { useStore, TextNode } from '@cosmic/store/useStore';
import { useState, useCallback, useRef, useEffect } from 'react';
import { getPointerPosition } from '@cosmic/utils/canvasUtils';

interface TextLayerProps {
    totalHeight?: number;
}

// Generate unique ID
const generateId = () => `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Font family mapping to CSS variables
const getFontVariable = (fontFamily: string): string => {
    const fontMap: Record<string, string> = {
        'Inter': 'var(--font-sans)',
        'Playfair Display': 'var(--font-serif)',
        'Caveat': 'var(--font-hand)',
        'JetBrains Mono': 'var(--font-mono)',
    };
    return fontMap[fontFamily] || fontFamily;
};

/**
 * TextLayer Component - Editable Text Annotations with Typography Suite
 * 
 * Handles text node creation, editing, selection, and formatting.
 */
export default function TextLayer({ totalHeight }: TextLayerProps) {
    const {
        textNodes,
        currentTool,
        selectedId,
        activeFont,
        activeFontSize,
        activeFontWeight,
        activeFontStyle,
        activeTextBackground,
        penColor,
        addTextNode,
        updateTextNode,
        deleteTextNode,
        zoom,
        canvasDimensions,
    } = useStore();

    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [dragState, setDragState] = useState<{
        active: boolean;
        nodeId: string | null;
        startX: number;
        startY: number;
        startNodeX: number;
        startNodeY: number;
    }>({
        active: false,
        nodeId: null,
        startX: 0,
        startY: 0,
        startNodeX: 0,
        startNodeY: 0,
    });

    const [localText, setLocalText] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);

    const isTextMode = currentTool === 'text';
    const isSelectMode = currentTool === 'select';

    // Handle click on canvas to create new text node
    const handleCanvasClick = useCallback((e: React.PointerEvent) => {
        if (!isTextMode) return;

        // Use accurate canvas coordinates
        const { x, y } = getPointerPosition(e, containerRef.current, zoom);

        const newNode: TextNode = {
            id: generateId(),
            x,
            y,
            content: '',
            fontSize: activeFontSize,
            color: penColor,
            fontFamily: activeFont,
            fontWeight: activeFontWeight,
            fontStyle: activeFontStyle,
            backgroundColor: activeTextBackground,
            padding: activeTextBackground !== 'transparent' ? 8 : 0,
        };

        addTextNode(newNode);
        setLocalText('');
        setEditingNodeId(newNode.id);
    }, [isTextMode, zoom, activeFontSize, penColor, activeFont, activeFontWeight, activeFontStyle, activeTextBackground, addTextNode]);

    // Handle start dragging
    const handleDragStart = useCallback((e: React.PointerEvent, node: TextNode) => {
        if (!isSelectMode || selectedId !== node.id) return;

        e.stopPropagation();

        setDragState({
            active: true,
            nodeId: node.id,
            startX: e.clientX,
            startY: e.clientY,
            startNodeX: node.x,
            startNodeY: node.y,
        });
    }, [isSelectMode, selectedId]);

    // Handle dragging
    const handleDrag = useCallback((e: React.PointerEvent) => {
        if (!dragState.active || !dragState.nodeId) return;

        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;

        updateTextNode(dragState.nodeId, {
            x: dragState.startNodeX + deltaX / zoom,
            y: dragState.startNodeY + deltaY / zoom,
        });
    }, [dragState, updateTextNode, zoom]);

    // Handle drag end
    const handleDragEnd = useCallback(() => {
        if (dragState.active) {
            setDragState({
                active: false,
                nodeId: null,
                startX: 0,
                startY: 0,
                startNodeX: 0,
                startNodeY: 0,
            });
        }
    }, [dragState.active]);

    // Handle double click to edit
    const handleDoubleClick = useCallback((e: React.PointerEvent, node: TextNode) => {
        e.stopPropagation();
        setLocalText(node.content || (node as any).text || '');
        setEditingNodeId(node.id);
    }, []);

    // Handle text change
    const handleTextChange = useCallback((nodeId: string, newContent: string) => {
        updateTextNode(nodeId, { content: newContent });
    }, [updateTextNode]);

    // Handle blur (save or delete if empty)
    const handleBlur = useCallback((nodeId: string, content: string) => {
        updateTextNode(nodeId, { content });
        setEditingNodeId(null);

        if (content.trim() === '') {
            // Delete empty text nodes
            deleteTextNode(nodeId);
        }
    }, [deleteTextNode]);

    // Keyboard listener for Delete/Backspace to delete selected text
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !editingNodeId) {
                const node = textNodes.find(n => n.id === selectedId);
                if (node) {
                    e.preventDefault();
                    deleteTextNode(selectedId);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, editingNodeId, textNodes, deleteTextNode]);

    if (textNodes.length === 0 && !isTextMode) return null;

    return (
        <div
            ref={containerRef}
            onClick={handleCanvasClick as any}
            onPointerMove={handleDrag}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            onPointerOut={handleDragEnd}
            onPointerLeave={handleDragEnd}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: totalHeight || '100%',
                zIndex: 7,
                pointerEvents: isTextMode ? 'auto' : 'none',
                cursor: isTextMode ? 'text' : 'default',
            }}
        >
            {textNodes.map((node) => {
                const isEditing = editingNodeId === node.id;
                const isSelected = selectedId === node.id && isSelectMode;
                const hasBackground = node.backgroundColor !== 'transparent';

                return (
                    <div
                        key={node.id}
                        id={`text-node-${node.id}`}
                        onPointerDown={(e) => !isEditing && handleDragStart(e, node)}
                        onDoubleClick={(e) => handleDoubleClick(e as any, node)}
                        style={{
                            position: 'absolute',
                            left: node.x,
                            top: node.y,
                            fontSize: node.fontSize,
                            color: node.color,
                            fontFamily: getFontVariable(node.fontFamily),
                            fontWeight: node.fontWeight,
                            fontStyle: node.fontStyle,
                            backgroundColor: node.backgroundColor,
                            padding: hasBackground ? `${node.padding}px` : '4px',
                            borderRadius: hasBackground ? '8px' : '4px',
                            boxShadow: hasBackground ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                            cursor: isSelectMode ? (isSelected ? 'move' : 'pointer') : 'default',
                            userSelect: isEditing ? 'text' : 'none',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            minWidth: '20px',
                            width: 'fit-content',
                            maxWidth: `${canvasDimensions.width - node.x - 20}px`, // Prevent overflowing the canvas bounds
                            minHeight: node.fontSize + 4,
                            border: isSelected && !isEditing ? '2px dashed #3b82f6' : '2px dashed transparent',
                            pointerEvents: 'auto',
                            display: isEditing ? 'inline-grid' : 'inline-block',
                        }}
                    >
                        {isEditing ? (
                            <>
                                <span style={{
                                    visibility: 'hidden',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    gridArea: '1 / 1 / 2 / 2',
                                }}>
                                    {localText + ' '}
                                </span>
                                <textarea
                                    autoFocus
                                    value={localText}
                                    onChange={(e) => {
                                        setLocalText(e.target.value);
                                    }}
                                    onBlur={() => handleBlur(node.id, localText)}
                                    onKeyDown={(e) => {
                                        // Let Enter create newlines. Shift+Enter or Escape to blur.
                                        if (e.key === 'Escape') {
                                            e.currentTarget.blur();
                                        }
                                        // Prevent Delete/Backspace from triggering node deletion
                                        if (e.key === 'Delete' || e.key === 'Backspace') {
                                            e.stopPropagation();
                                        }
                                    }}
                                    style={{
                                        all: 'unset',
                                        gridArea: '1 / 1 / 2 / 2',
                                        width: '100%',
                                        height: '100%',
                                        resize: 'none',
                                        overflow: 'hidden',
                                        fontSize: 'inherit',
                                        fontFamily: 'inherit',
                                        fontWeight: 'inherit',
                                        fontStyle: 'inherit',
                                        color: 'inherit',
                                        lineHeight: '1.2',
                                    }}
                                    rows={1}
                                />
                            </>
                        ) : (
                            <span>{node.content || (node as any).text || '\u00A0'}</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
