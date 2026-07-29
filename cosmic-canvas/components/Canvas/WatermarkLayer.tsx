'use client';

import React from 'react';
import { PDF_PAGE_GAP } from '@cosmic/constants/canvas';

interface WatermarkLayerProps {
    pageCount: number;
    pageHeight: number;
    pageWidth: number;
}

export default function WatermarkLayer({ pageCount, pageHeight, pageWidth }: WatermarkLayerProps) {
    const leftLogoWidth = 100;
    const leftLogoHeight = 100;
    const paddingLeft = 20;
    
    const rightBannerWidth = 160;
    const rightBannerHeight = 45;
    const paddingRight = 0;
    
    const paddingBottom = 20;

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
            {Array.from({ length: pageCount }).map((_, i) => {
                const pageTop = i * (pageHeight + PDF_PAGE_GAP);
                return (
                    <React.Fragment key={i}>
                        {/* Bottom Left Logo */}
                        <div
                            style={{
                                position: 'absolute',
                                top: pageTop + pageHeight - paddingBottom - leftLogoHeight,
                                left: paddingLeft,
                                width: leftLogoWidth,
                                height: leftLogoHeight,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <img 
                                src="/tf-logo.jpeg" 
                                alt="TrickFunda Logo" 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'contain',
                                    pointerEvents: 'none' 
                                }} 
                            />
                        </div>

                        {/* Bottom Right Banner */}
                        <div
                            style={{
                                position: 'absolute',
                                top: pageTop + pageHeight - paddingRight - rightBannerHeight,
                                left: pageWidth - paddingRight - rightBannerWidth,
                                width: rightBannerWidth,
                                height: rightBannerHeight,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <img 
                                src="/trickfunda-official-banner.jpeg" 
                                alt="TrickFunda Banner" 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'fill',
                                    pointerEvents: 'none' 
                                }} 
                            />
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}
