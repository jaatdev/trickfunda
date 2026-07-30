'use client';

import { useStore } from '@cosmic/store/useStore';
import { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, Check } from 'lucide-react';

/**
 * Header Component - Compact Project Title (Click-to-Edit)
 * 
 * A tiny, non-intrusive pill that shows the project name.
 * Expands into an editable input ONLY when clicked.
 * When idle, pointer-events are disabled so pen strokes pass through.
 * Auto-hides in fullscreen (Zen Mode) and reveals on hover.
 */
export default function Header() {
    const { projectName, setProjectName, isFullscreen } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [localName, setLocalName] = useState(projectName);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync local state when projectName changes externally (e.g. PDF load)
    useEffect(() => {
        if (!isEditing) {
            setLocalName(projectName);
        }
    }, [projectName, isEditing]);

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEdit = useCallback(() => {
        setLocalName(projectName);
        setIsEditing(true);
    }, [projectName]);

    const handleConfirm = useCallback(() => {
        const trimmed = localName.trim();
        if (trimmed) {
            setProjectName(trimmed);
        }
        setIsEditing(false);
    }, [localName, setProjectName]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleConfirm();
        } else if (e.key === 'Escape') {
            setLocalName(projectName);
            setIsEditing(false);
        }
    }, [handleConfirm, projectName]);

    // Truncate display name for the pill (more aggressive on mobile)
    const displayName = projectName.length > 14
        ? projectName.slice(0, 12) + '…'
        : projectName;

    return (
        <div className={`fixed top-3 left-3 z-50 transition-opacity duration-500 ${isFullscreen
                ? 'opacity-0 hover:opacity-100 delay-700'
                : 'opacity-100'
            }`}
        >
            {isEditing ? (
                /* ── Expanded Edit Mode ── */
                <div className="flex items-center gap-1.5 px-2.5 py-1.5
                    bg-black/70 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl"
                >
                    <FileText className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        onBlur={handleConfirm}
                        onKeyDown={handleKeyDown}
                        placeholder="Untitled"
                        className="bg-transparent text-sm font-medium text-white
                            placeholder:text-white/30 focus:outline-none
                            border-none w-44 md:w-56"
                    />
                    <button
                        onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur before click
                            handleConfirm();
                        }}
                        className="p-0.5 rounded-md hover:bg-white/10 transition-colors"
                        title="Confirm"
                    >
                        <Check className="w-3.5 h-3.5 text-green-400" />
                    </button>
                </div>
            ) : (
                /* ── Compact Pill (pointer-events pass through to canvas) ── */
                <button
                    onClick={handleStartEdit}
                    className="group flex items-center gap-1.5 px-2.5 sm:px-2 py-1.5 sm:py-1
                        bg-black/30 backdrop-blur-md border border-white/10 rounded-lg
                        hover:bg-black/50 hover:border-white/20
                        transition-all duration-200 cursor-pointer max-w-[140px] sm:max-w-[160px]"
                    title={`${projectName} — click to rename`}
                >
                    <FileText className="w-3 h-3 text-white/30 group-hover:text-white/50 flex-shrink-0 transition-colors" />
                    <span className="text-xs font-medium text-white/40 group-hover:text-white/60
                        truncate transition-colors leading-none">
                        {displayName || 'Untitled'}
                    </span>
                </button>
            )}
        </div>
    );
}
