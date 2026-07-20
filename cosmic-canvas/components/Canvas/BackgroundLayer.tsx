'use client';

import { useStore } from '@cosmic/store/useStore';
import { Pattern } from '@cosmic/types';
import { PDF_PAGE_GAP } from '@cosmic/constants/canvas';

import { useMemo } from 'react';

const RENDER_WINDOW = 2;

/**
 * Calculate pattern color based on background brightness
 */
function getPatternColor(backgroundColor: string): string {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Standard luminance formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Dark background → light lines, Light background → dark lines
    return brightness < 128
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(0,0,0,0.1)';
}

/**
 * BackgroundLayer Component - Z-Index 0
 * 
 * Full-screen SVG background with vector patterns.
 * Supports grid, dots, ruled lines, isometric, music staves, and Cornell notes.
 */
export default function BackgroundLayer() {
    const { canvasBackground, canvasPattern, canvasDimensions, pageCount, currentPage, isOverlayMode } = useStore();
    const patternColor = getPatternColor(canvasBackground);

    if (isOverlayMode) return null;


    // Use dynamic page height from store
    const pageHeight = canvasDimensions.height;
    const pageWidth = canvasDimensions.width;

    // Calculate visible page range based on current page
    const { minPage, maxPage } = useMemo(() => {
        return {
            minPage: Math.max(0, currentPage - 1 - RENDER_WINDOW),
            maxPage: Math.min(pageCount, currentPage + RENDER_WINDOW),
        };
    }, [currentPage, pageCount]);

    const visiblePages = useMemo(() => {
        const pages = [];
        for (let i = minPage; i < maxPage; i++) {
            pages.push(i);
        }
        return pages;
    }, [minPage, maxPage]);

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
            <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
                {/* Grid Pattern - 40px squares */}
                <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke={patternColor}
                        strokeWidth="1"
                    />
                </pattern>

                {/* Dot Pattern - 20px spacing */}
                <pattern
                    id="dots"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                >
                    <circle
                        cx="10"
                        cy="10"
                        r="1.5"
                        fill={patternColor}
                    />
                </pattern>

                {/* Ruled Lines Pattern - 40px spacing */}
                <pattern
                    id="lines"
                    width="100%"
                    height="40"
                    patternUnits="userSpaceOnUse"
                >
                    <line
                        x1="0"
                        y1="40"
                        x2="100%"
                        y2="40"
                        stroke={patternColor}
                        strokeWidth="1"
                    />
                </pattern>

                {/* Isometric Grid Pattern - 60° triangles */}
                <pattern
                    id="isometric"
                    width="86.6"
                    height="50"
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d="M 0 0 L 86.6 50 M 86.6 0 L 0 50 M 43.3 0 L 43.3 50"
                        fill="none"
                        stroke={patternColor}
                        strokeWidth="1"
                    />
                </pattern>

                {/* Music Staves Pattern - 5 lines per group, 200px spacing */}
                <pattern
                    id="music"
                    width="100%"
                    height="200"
                    patternUnits="userSpaceOnUse"
                >
                    {[0, 1, 2, 3, 4].map((i) => (
                        <line
                            key={i}
                            x1="0"
                            y1={20 + i * 20}
                            x2="100%"
                            y2={20 + i * 20}
                            stroke={patternColor}
                            strokeWidth="1"
                        />
                    ))}
                </pattern>

                {/* Cornell Notes Pattern - Cue column and summary section per page */}
                <pattern
                    id="cornell"
                    width="100%"
                    height={pageHeight}
                    patternUnits="userSpaceOnUse"
                >
                    {/* Vertical cue column line at 200px */}
                    <line
                        x1="200"
                        y1="0"
                        x2="200"
                        y2={pageHeight}
                        stroke={patternColor}
                        strokeWidth="2"
                    />
                    {/* Horizontal summary line 200px from bottom */}
                    <line
                        x1="0"
                        y1={pageHeight - 200}
                        x2="100%"
                        y2={pageHeight - 200}
                        stroke={patternColor}
                        strokeWidth="2"
                    />
                </pattern>
            </defs>
            </svg>

            {/* Render Page Backgrounds and Borders */}
            {visiblePages.map((i) => {
                const y = i * (pageHeight + PDF_PAGE_GAP);
                return (
                    <svg
                        key={`bg_${i}`}
                        style={{
                            position: 'absolute',
                            top: y,
                            left: 0,
                            width: pageWidth,
                            height: pageHeight,
                            zIndex: 0,
                            pointerEvents: 'none',
                        }}
                    >
                        {/* Background Color */}
                        <rect width="100%" height={pageHeight} fill={canvasBackground} />

                        {/* Pattern Overlay */}
                        {canvasPattern !== 'none' && (
                            <rect width="100%" height={pageHeight} fill={`url(#${canvasPattern})`} />
                        )}

                        {/* Page Border */}
                        <rect
                            width="100%"
                            height={pageHeight}
                            fill="none"
                            stroke="rgba(150, 150, 150, 0.3)"
                            strokeWidth="1"
                            pointerEvents="none"
                        />
                    </svg>
                );
            })}
        </div>
    );
}
