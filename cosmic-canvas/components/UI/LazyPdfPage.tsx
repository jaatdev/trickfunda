import { useState, useEffect, useRef } from 'react';
import { Page } from 'react-pdf';

export default function LazyPdfPage({ pageNumber, width }: { pageNumber: number, width: number }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    // Optional: unload to save memory when out of view
                    // setIsVisible(false);
                }
            },
            { rootMargin: '400px' }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="w-full h-full flex items-center justify-center">
            {isVisible ? (
                <Page
                    pageNumber={pageNumber}
                    width={width}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    devicePixelRatio={1}
                    className="pointer-events-none shadow-sm"
                    loading={<div className="w-full h-full animate-pulse bg-black/5" />}
                />
            ) : (
                <div className="w-full h-full animate-pulse bg-black/5" />
            )}
        </div>
    );
}
