import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCcw, Check, Edit2 } from 'lucide-react';
import type { CompressionResult } from '@/lib/pdf-compressor/types';

interface DownloadButtonProps {
  result: CompressionResult;
  fileName: string;
  onReset: () => void;
}

export default function DownloadButton({ result, fileName, onReset }: DownloadButtonProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [customFileName, setCustomFileName] = useState('');

  useEffect(() => {
    const baseName = fileName.replace(/\.pdf$/i, '');
    setCustomFileName(`compressed_${baseName}.pdf`);
  }, [fileName]);

  const handleDownload = () => {
    // Create blob from either compressedBlob or compressedBytes
    let blob: Blob;
    if (result.compressedBlob) {
      blob = result.compressedBlob;
    } else if (result.compressedBytes) {
      blob = new Blob([result.compressedBytes as any], { type: 'application/pdf' });
    } else {
      console.error('No compressed data available');
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Ensure it ends with .pdf
    let finalName = customFileName.trim();
    if (!finalName) {
      const baseName = fileName.replace(/\.pdf$/i, '');
      finalName = `compressed_${baseName}.pdf`;
    }
    if (!finalName.toLowerCase().endsWith('.pdf')) {
      finalName += '.pdf';
    }
    
    a.download = finalName;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="flex flex-col items-center space-y-6 mt-8 w-full max-w-sm mx-auto"
    >
      <div className="w-full relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
          <Edit2 className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={customFileName}
          onChange={(e) => setCustomFileName(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all font-medium placeholder-gray-600"
          placeholder="Enter filename..."
        />
        <div className="absolute -top-6 left-0 w-full text-center text-xs text-gray-500/80 font-medium tracking-wide uppercase">
          Customize Filename
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="group relative inline-flex items-center justify-center w-full px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]"
      >
        <span className="absolute inset-0 w-full h-full -mt-1 rounded-2xl opacity-30 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
        {downloaded ? (
          <Check className="w-5 h-5 mr-2 text-emerald-300" />
        ) : (
          <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
        )}
        {downloaded ? 'Downloaded!' : 'Download Compressed PDF'}
        <span className="ml-auto px-2 py-1 rounded-lg bg-white/20 text-xs shadow-inner">
          {(result.compressedSize / (1024 * 1024)).toFixed(2)} MB
        </span>
      </button>

      <button
        onClick={onReset}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-2"
      >
        <RefreshCcw className="w-4 h-4" />
        Compress Another File
      </button>
    </motion.div>
  );
}
