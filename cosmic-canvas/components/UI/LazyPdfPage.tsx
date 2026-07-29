import { useState, useEffect, useRef } from 'react';
import { Page } from 'react-pdf';

export default function LazyPdfPage({ pageNumber }: { pageNumber: number }) {
    const [isVisible, setIsVisible] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Observe visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { rootMargin: '400px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Observe container resize for perfect fit
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
            {isVisible && containerWidth > 0 ? (
                <Page
                    pageNumber={pageNumber}
                    width={containerWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    devicePixelRatio={2}
                    className="pointer-events-none shadow-sm"
                    loading={<div className="w-full h-full animate-pulse bg-black/5" />}
                />
            ) : (
                <div className="w-full h-full animate-pulse bg-black/5" />
            )}
        </div>
    );
}
