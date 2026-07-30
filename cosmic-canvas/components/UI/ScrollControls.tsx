import React, { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';

interface ScrollControlsProps {
    scrollWrapperRef: React.RefObject<HTMLDivElement | null>;
}

export const ScrollControls: React.FC<ScrollControlsProps> = ({ scrollWrapperRef }) => {
    const { isTouchDevice } = useDeviceCapabilities();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Only show on touch devices
    if (!isTouchDevice) return null;

    const startScroll = (direction: 'up' | 'down') => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (scrollWrapperRef.current) {
                scrollWrapperRef.current.scrollBy({
                    top: direction === 'up' ? -25 : 25,
                    behavior: 'auto'
                });
            }
        }, 16); // roughly 60fps scrolling
    };

    const stopScroll = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopScroll();
    }, []);

    return (
        <div 
            className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-50 pointer-events-auto"
            style={{ touchAction: 'none' }}
        >
            <button
                onPointerDown={() => startScroll('up')}
                onPointerUp={stopScroll}
                onPointerLeave={stopScroll}
                onPointerCancel={stopScroll}
                onContextMenu={(e) => e.preventDefault()}
                className="p-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl text-white hover:bg-black/80 active:scale-95 transition-all focus:outline-none"
                aria-label="Scroll Up"
            >
                <ChevronUp size={28} />
            </button>
            <button
                onPointerDown={() => startScroll('down')}
                onPointerUp={stopScroll}
                onPointerLeave={stopScroll}
                onPointerCancel={stopScroll}
                onContextMenu={(e) => e.preventDefault()}
                className="p-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl text-white hover:bg-black/80 active:scale-95 transition-all focus:outline-none"
                aria-label="Scroll Down"
            >
                <ChevronDown size={28} />
            </button>
        </div>
    );
};
