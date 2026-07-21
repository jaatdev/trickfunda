'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Globe, FileDown, AlertTriangle } from 'lucide-react';

import DropZone from '@/components/tools/pdf-compressor/DropZone';
import QualitySelector from '@/components/tools/pdf-compressor/QualitySelector';
import CompressionProgress from '@/components/tools/pdf-compressor/CompressionProgress';
import ResultsDashboard from '@/components/tools/pdf-compressor/ResultsDashboard';
import DownloadButton from '@/components/tools/pdf-compressor/DownloadButton';

import type {
  CompressionOptions,
  CompressionProgress as CompressionProgressType,
  CompressionResult,
  CompressionQuality,
} from '@/lib/pdf-compressor/types';

type AppState = 'idle' | 'fileSelected' | 'compressing' | 'complete' | 'error';

export default function PDFCompressorClient() {
  const [state, setState] = useState<AppState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<CompressionQuality>('balanced');
  const [progress, setProgress] = useState<CompressionProgressType | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lazy-load the worker manager (code-split the heavy pdf-lib dependency)
  const workerManagerRef = useRef<any>(null);

  const getWorkerManager = useCallback(async () => {
    if (!workerManagerRef.current) {
      const { CompressionWorkerManager } = await import('@/lib/pdf-compressor/worker-manager');
      workerManagerRef.current = new CompressionWorkerManager();
    }
    return workerManagerRef.current;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state === 'compressing') {
          handleCancel();
        } else {
          handleReset();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setState('fileSelected');
    setError(null);
    setResult(null);
  }, []);

  const handleCompress = async () => {
    if (!file) return;

    setState('compressing');
    setError(null);
    setProgress({
      phase: 'analyzing',
      pagesProcessed: 0,
      totalPages: 0,
      bytesProcessed: 0,
      bytesSaved: 0,
      currentOperation: 'Reading PDF file...',
      estimatedTimeRemaining: 0,
      percentage: 0,
    });

    try {
      // Read file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      const options: CompressionOptions = {
        quality,
        imageQuality: quality === 'ultra' ? 0.92 : quality === 'balanced' ? 0.75 : 0.55,
        downscaleOversized: quality !== 'ultra',
        stripMetadata: true,
        deduplicateStreams: true,
        optimizeFonts: true,
      };

      const manager = await getWorkerManager();

      const compressionResult = await manager.compress(
        arrayBuffer,
        options,
        (progressUpdate: CompressionProgressType) => {
          setProgress(progressUpdate);
        }
      );

      setResult(compressionResult);
      setState('complete');
    } catch (err: any) {
      console.error('[PDFCompressor] Error:', err);
      const message = err?.message || 'An unknown error occurred during compression.';
      
      if (message.includes('aborted')) {
        // User cancelled — just reset
        handleReset();
        return;
      }

      setError(message);
      setState('error');
    }
  };

  const handleCancel = async () => {
    const manager = workerManagerRef.current;
    if (manager) {
      manager.abort();
    }
    handleReset();
  };

  const handleReset = () => {
    setState('idle');
    setFile(null);
    setProgress(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030014] pb-24 selection:bg-violet-500/30 font-sans">
      {/* Deep Space Background Grid & Glowing Orbs */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none mix-blend-overlay z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Pulsing Orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse z-0" />
      <div className="fixed bottom-0 right-1/4 w-[700px] h-[700px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-32">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-3 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl mb-4"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              100% Private
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-300">
              <Zap className="w-4 h-4 text-yellow-400" />
              Instant
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-300">
              <Globe className="w-4 h-4 text-cyan-400" />
              No Upload
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 tracking-tighter pb-2 drop-shadow-sm"
          >
            PDF Compressor
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Compress large PDFs directly in your browser. Maximum privacy, zero
            server uploads, blazing fast speeds.
          </motion.p>
        </div>

        {/* Main Content Area */}
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {/* Idle & File Selected State */}
            {(state === 'idle' || state === 'fileSelected') && (
              <motion.div
                key="upload-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full flex flex-col items-center"
              >
                <DropZone
                  onFileSelect={handleFileSelect}
                  isDisabled={false}
                />

                <AnimatePresence>
                  {state === 'fileSelected' && file && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full flex flex-col items-center"
                    >
                      {/* File info badge */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {file.name} — {(file.size / (1024 * 1024)).toFixed(1)} MB ready
                      </motion.div>

                      <QualitySelector
                        selected={quality}
                        onSelect={setQuality}
                        isDisabled={false}
                      />

                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={handleCompress}
                        className="mt-12 group relative inline-flex items-center justify-center px-12 py-5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-out -skew-x-12 -ml-8 w-1/2" />
                        <FileDown className="w-6 h-6 mr-3" />
                        <span className="text-lg">Compress PDF Now</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Compressing State */}
            {state === 'compressing' && progress && (
              <motion.div
                key="progress-section"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full"
              >
                <CompressionProgress
                  progress={progress}
                  onCancel={handleCancel}
                />
              </motion.div>
            )}

            {/* Complete State */}
            {state === 'complete' && result && (
              <motion.div
                key="result-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col items-center"
              >
                <ResultsDashboard result={result} />
                <DownloadButton
                  result={result}
                  fileName={file?.name || 'document.pdf'}
                  onReset={handleReset}
                />
              </motion.div>
            )}

            {/* Error State */}
            {state === 'error' && (
              <motion.div
                key="error-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-3xl max-w-lg mx-auto backdrop-blur-md"
              >
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Compression Failed
                </h3>
                <p className="text-red-300/80 mb-6 text-sm">{error}</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
