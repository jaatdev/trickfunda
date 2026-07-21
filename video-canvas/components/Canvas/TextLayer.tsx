'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useVideoStore } from '@video-canvas/store/useVideoStore';
import { TextNode } from '@cosmic/types';

interface TextLayerProps {
  zoom: number;
  panX: number;
  panY: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function TextLayer({ zoom, panX, panY, containerRef }: TextLayerProps) {
  const textNodes = useVideoStore(s => s.textNodes);
  const selectedId = useVideoStore(s => s.selectedId);
  const selectObject = useVideoStore(s => s.selectObject);
  const updateTextNode = useVideoStore(s => s.updateTextNode);
  const addTextNode = useVideoStore(s => s.addTextNode);
  const activeTool = useVideoStore(s => s.activeTool);
  const activeFont = useVideoStore(s => s.activeFont);
  const activeFontSize = useVideoStore(s => s.activeFontSize);
  const activeFontWeight = useVideoStore(s => s.activeFontWeight);
  const activeFontStyle = useVideoStore(s => s.activeFontStyle);
  const activeTextBackground = useVideoStore(s => s.activeTextBackground);
  const penColor = useVideoStore(s => s.penColor);

  const handleBackgroundPointerDown = (e: React.PointerEvent) => {
    if (activeTool === 'text' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - panX) / zoom;
      const y = (e.clientY - rect.top - panY) / zoom;

      const newNode: TextNode = {
        id: crypto.randomUUID(),
        x,
        y,
        content: '',
        fontSize: activeFontSize || 24,
        fontFamily: activeFont || 'Inter',
        color: penColor || '#000000',
        fontWeight: activeFontWeight || 'normal',
        fontStyle: activeFontStyle || 'normal',
        backgroundColor: activeTextBackground || 'transparent',
        padding: 8,
      };
      
      addTextNode(newNode);
      selectObject(newNode.id);
      
      // Stop propagation so we don't immediately deselect
      e.stopPropagation();
    }
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[12]"
      style={{ overflow: 'hidden' }}
      onPointerDown={handleBackgroundPointerDown}
    >
      <div
        className="absolute w-full h-full"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {textNodes?.map((node) => (
          <TextItem
            key={node.id}
            node={node}
            isSelected={selectedId === node.id}
            onSelect={() => selectObject(node.id)}
            onUpdate={(updates) => updateTextNode(node.id, updates)}
            zoom={zoom}
          />
        ))}
      </div>
    </div>
  );
}

interface TextItemProps {
  node: TextNode;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextNode>) => void;
  zoom: number;
}

function TextItem({ node, isSelected, onSelect, onUpdate, zoom }: TextItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-enter edit mode for empty newly created nodes
  useEffect(() => {
    if (isSelected && node.content === '' && !isEditing) {
      setIsEditing(true);
    }
  }, [isSelected, node.content, isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    
    if (!isEditing) {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startX: node.x,
        startY: node.y,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && dragStartRef.current) {
      const dx = (e.clientX - dragStartRef.current.x) / zoom;
      const dy = (e.clientY - dragStartRef.current.y) / zoom;
      
      onUpdate({
        x: dragStartRef.current.startX + dx,
        y: dragStartRef.current.startY + dy,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // If text is empty after editing, it might be handled by a cleanup function
    // in the store, but we just leave it for now or could trigger remove.
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
    // Optional: shift+enter for new line, enter to submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  const textStyle: React.CSSProperties = {
    fontFamily: `var(--font-${node.fontFamily.toLowerCase().replace(/\s+/g, '-')}, ${node.fontFamily})`,
    fontSize: `${node.fontSize}px`,
    color: node.color,
    fontWeight: node.fontWeight,
    fontStyle: node.fontStyle,
    backgroundColor: node.backgroundColor !== 'transparent' ? node.backgroundColor : undefined,
    padding: '4px 8px',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.2,
    minWidth: '20px',
    minHeight: '1em',
  };

  return (
    <div
      className={`absolute pointer-events-auto origin-top-left ${isSelected ? 'z-20' : 'z-10'}`}
      style={{
        left: node.x,
        top: node.y,
        cursor: isEditing ? 'text' : (isDragging ? 'grabbing' : 'grab'),
        // Adding a slight border when selected and not editing
        boxShadow: isSelected && !isEditing ? '0 0 0 2px #3b82f6' : 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={node.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none resize-none overflow-hidden"
          style={{
            ...textStyle,
            border: '1px dashed #9ca3af',
            width: `${Math.max(100, (textareaRef.current?.scrollWidth || 0))}px`,
            height: `${Math.max(node.fontSize * 1.5, (textareaRef.current?.scrollHeight || 0))}px`,
          }}
          autoFocus
        />
      ) : (
        <div style={textStyle} className="select-none pointer-events-none">
          {node.content || <span className="opacity-50">Type something...</span>}
        </div>
      )}

      {/* Optional: Drag handles could be added here if resizing text bounds was needed */}
    </div>
  );
}
