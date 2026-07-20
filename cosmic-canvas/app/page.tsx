'use client';

import dynamic from 'next/dynamic';

import { Suspense } from 'react';

// Dynamic imports with SSR disabled to prevent DOMMatrix errors during build
const Stage = dynamic(() => import("@cosmic/components/Canvas/Stage"), { ssr: false });
const Toolbar = dynamic(() => import("@cosmic/components/UI/Toolbar"), { ssr: false });
const Header = dynamic(() => import("@cosmic/components/UI/Header"), { ssr: false });
const PageNavigator = dynamic(() => import("@cosmic/components/UI/PageNavigator"), { ssr: false });
const PDFUrlLoader = dynamic(() => import("@cosmic/components/Canvas/PDFUrlLoader"), { ssr: false });
const OverlayModeLoader = dynamic(() => import("@cosmic/components/Canvas/OverlayModeLoader"), { ssr: false });
import { useEffect } from 'react';
import { useStore } from '@cosmic/store/useStore';

export default function Home() {
  const clearCanvas = useStore((state) => state.clearCanvas);

  const isOverlayMode = useStore((state) => state.isOverlayMode);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CLEAR_CANVAS') {
        clearCanvas();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [clearCanvas]);

  return (
    <>
      <Suspense fallback={null}>
        <PDFUrlLoader />
        <OverlayModeLoader />
      </Suspense>
      {!isOverlayMode && <Header />}
      <Stage />
      <Toolbar />
      {!isOverlayMode && <PageNavigator />}
    </>
  );
}
