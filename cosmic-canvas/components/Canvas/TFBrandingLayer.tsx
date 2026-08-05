'use client';

import React, { useMemo } from 'react';
import { useStore } from '@cosmic/store/useStore';
import { PDF_PAGE_GAP } from '@cosmic/constants/canvas';
import { getTFThemeById } from '@cosmic/constants/tfThemes';

export default function TFBrandingLayer() {
    const { 
        tfPageThemes, pageCount, canvasDimensions, 
        tfHeaderBrand, tfHeaderTopic, tfHeaderYoutube,
        setTFHeaderBrand, setTFHeaderTopic, setTFHeaderYoutube 
    } = useStore();
    const pageHeight = canvasDimensions.height;
    const pageWidth = canvasDimensions.width;

    // Only compute themed pages that are in range
    const themedPages = useMemo(() => {
        const result: { pageIndex: number; themeId: string }[] = [];
        for (const [key, val] of Object.entries(tfPageThemes)) {
            const idx = Number(key);
            if (idx >= 0 && idx < pageCount) {
                result.push({ pageIndex: idx, themeId: val });
            }
        }
        return result;
    }, [tfPageThemes, pageCount]);

    if (themedPages.length === 0) return null;

    const HEADER_HEIGHT = 50;
    const FOOTER_HEIGHT = 28;

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
            {themedPages.map(({ pageIndex, themeId }) => {
                const theme = getTFThemeById(themeId);
                if (!theme) return null;

                const pageTop = pageIndex * (pageHeight + PDF_PAGE_GAP);

                return (
                    <React.Fragment key={`tf-brand-${pageIndex}`}>
                        {/* ═══════════ HEADER BAR ═══════════ */}
                        <div
                            style={{
                                position: 'absolute',
                                top: pageTop,
                                left: 0,
                                width: pageWidth,
                                height: HEADER_HEIGHT,
                                backgroundColor: theme.headerBg,
                                borderBottom: `3px solid ${theme.headerAccent}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0 20px',
                                boxSizing: 'border-box',
                            }}
                        >
                            {/* Left: Logo + Brand */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                <img
                                    src="/tf-logo.jpeg"
                                    alt="TF"
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 8,
                                        objectFit: 'contain',
                                    }}
                                />
                                <input
                                    value={tfHeaderBrand}
                                    onChange={(e) => setTFHeaderBrand(e.target.value)}
                                    placeholder="Brand Name"
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 800,
                                        color: theme.headerAccent,
                                        letterSpacing: '0.5px',
                                        fontFamily: "'Poppins', 'Inter', sans-serif",
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        pointerEvents: 'auto',
                                        width: '200px'
                                    }}
                                />
                            </div>

                            {/* Center: Topic Name */}
                            <input
                                value={tfHeaderTopic}
                                onChange={(e) => setTFHeaderTopic(e.target.value)}
                                placeholder="Enter Topic Name..."
                                style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: theme.headerAccent,
                                    fontFamily: "'Inter', sans-serif",
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    pointerEvents: 'auto',
                                }}
                            />

                            {/* Right: YouTube */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                <svg viewBox="0 0 24 24" fill="#ff0000" width="24" height="24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                                <input
                                    value={tfHeaderYoutube}
                                    onChange={(e) => setTFHeaderYoutube(e.target.value)}
                                    placeholder="YouTube Channel"
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: 'rgba(255,255,255,0.7)',
                                        fontFamily: "'Inter', sans-serif",
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        pointerEvents: 'auto',
                                        width: '200px',
                                        textAlign: 'right'
                                    }}
                                />
                            </div>
                        </div>

                        {/* ═══════════ CENTER SHIELD WATERMARK ═══════════ */}
                        <div
                            style={{
                                position: 'absolute',
                                top: pageTop + HEADER_HEIGHT,
                                left: 0,
                                width: pageWidth,
                                height: pageHeight - HEADER_HEIGHT - FOOTER_HEIGHT,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                pointerEvents: 'none',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                }}
                            >
                                {/* Outer Glow Ring */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: 340,
                                        height: 400,
                                        borderRadius: '50%',
                                        border: `3px solid ${theme.watermarkColor}`,
                                        opacity: theme.watermarkOpacity,
                                    }}
                                />

                                {/* Shield Container (No clip-path, holds background and content) */}
                                <div
                                    style={{
                                        width: 280,
                                        height: 330,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    {/* Outer Shield Background */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            clipPath:
                                                'polygon(50% 0%, 100% 8%, 100% 55%, 85% 75%, 50% 100%, 15% 75%, 0% 55%, 0% 8%)',
                                            background: `linear-gradient(145deg, ${theme.watermarkSecondary}, ${theme.watermarkColor}, ${theme.watermarkSecondary})`,
                                            opacity: theme.watermarkOpacity * 0.5,
                                        }}
                                    />
                                    {/* Inner Shield Background */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: 250,
                                            height: 296,
                                            clipPath:
                                                'polygon(50% 0%, 100% 8%, 100% 55%, 85% 75%, 50% 100%, 15% 75%, 0% 55%, 0% 8%)',
                                            background: `linear-gradient(170deg, ${theme.watermarkSecondary}88, ${theme.watermarkColor}, ${theme.watermarkColor}cc)`,
                                            opacity: theme.watermarkOpacity * 0.8,
                                        }}
                                    />
                                    
                                    {/* Shield Content (No clip-path to prevent text cutoff) */}
                                    <div
                                        style={{
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 2,
                                            height: '100%',
                                        }}
                                    >
                                        {/* Divider Top */}
                                        <div
                                            style={{
                                                width: 120,
                                                height: 2,
                                                backgroundColor: theme.watermarkColor,
                                                marginBottom: 6,
                                                borderRadius: 2,
                                                opacity: 0.7,
                                            }}
                                        />

                                        {/* Stars */}
                                        <div
                                            style={{
                                                fontSize: 20,
                                                color: theme.watermarkColor,
                                                marginBottom: 3,
                                                letterSpacing: 10,
                                                opacity: 0.8,
                                            }}
                                        >
                                            ★ ★ ★
                                        </div>

                                        {/* TF Letters */}
                                        <div
                                            style={{
                                                fontSize: 100,
                                                fontWeight: 900,
                                                fontFamily: "'Georgia', 'Times New Roman', serif",
                                                color: theme.watermarkColor,
                                                letterSpacing: 6,
                                                lineHeight: 1,
                                                opacity: theme.watermarkOpacity * 1.5,
                                            }}
                                        >
                                            TF
                                        </div>

                                        {/* TRICKFUNDA */}
                                        <div
                                            style={{
                                                marginTop: 6,
                                                fontSize: 18,
                                                fontWeight: 900,
                                                fontFamily: "'Poppins', sans-serif",
                                                color: theme.watermarkColor,
                                                letterSpacing: 6,
                                                textTransform: 'uppercase' as const,
                                                opacity: theme.watermarkOpacity * 1.5,
                                            }}
                                        >
                                            TRICKFUNDA
                                        </div>

                                        {/* Stars Bottom */}
                                        <div
                                            style={{
                                                fontSize: 20,
                                                color: theme.watermarkColor,
                                                marginTop: 3,
                                                letterSpacing: 10,
                                                opacity: 0.8,
                                            }}
                                        >
                                            ★ ★ ★
                                        </div>

                                        {/* Divider Bottom */}
                                        <div
                                            style={{
                                                width: 120,
                                                height: 2,
                                                backgroundColor: theme.watermarkColor,
                                                marginTop: 6,
                                                borderRadius: 2,
                                                opacity: 0.7,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══════════ FOOTER BAR ═══════════ */}
                        <div
                            style={{
                                position: 'absolute',
                                top: pageTop + pageHeight - FOOTER_HEIGHT,
                                left: 0,
                                width: pageWidth,
                                height: FOOTER_HEIGHT,
                                backgroundColor: theme.footerBg,
                                borderTop: `1px solid rgba(255,255,255,0.1)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: theme.footerText,
                                    fontFamily: "'Inter', sans-serif",
                                    letterSpacing: '0.5px',
                                }}
                            >
                                TrickFunda | Smart Learning Platform
                            </span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}
