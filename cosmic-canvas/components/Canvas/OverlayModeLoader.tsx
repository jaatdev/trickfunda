'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@cosmic/store/useStore';

export default function OverlayModeLoader() {
    const searchParams = useSearchParams();
    const setIsOverlayMode = useStore((state) => state.setIsOverlayMode);

    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'overlay') {
            setIsOverlayMode(true);
            document.documentElement.style.background = 'transparent';
            document.body.style.background = 'transparent';
        } else {
            setIsOverlayMode(false);
            document.documentElement.style.background = '';
            document.body.style.background = '';
        }
    }, [searchParams, setIsOverlayMode]);

    return null;
}
