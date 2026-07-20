'use client';

import { PDF_PAGE_GAP } from '@cosmic/constants/canvas';

interface WatermarkLayerProps {
    pageCount: number;
    pageHeight: number;
    pageWidth: number;
}

export default function WatermarkLayer({ pageCount, pageHeight, pageWidth }: WatermarkLayerProps) {
    const watermarkWidth = 160;
    const watermarkHeight = 45;
    const paddingRight = 0;
    const paddingBottom = 0;

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
            {Array.from({ length: pageCount }).map((_, i) => {
                const pageTop = i * (pageHeight + PDF_PAGE_GAP);
                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            top: pageTop + pageHeight - paddingBottom - watermarkHeight,
                            left: pageWidth - paddingRight - watermarkWidth,
                            width: watermarkWidth,
                            height: watermarkHeight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        }}
                    >
                        {/* 
                          We use an image tag to render the TrickFunda logo.
                          It will overlap and hide NotebookLM or other PDF watermarks 
                          placed at the bottom right.
                        */}
                        <img 
                            src="/trickfunda-official-banner.jpeg" 
                            alt="TrickFunda" 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'fill',
                                pointerEvents: 'none' 
                            }} 
                        />
                    </div>
                );
            })}
        </div>
    );
}
