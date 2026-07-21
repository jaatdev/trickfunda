import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCcw, Check } from 'lucide-react';
import type { CompressionResult } from '@/lib/pdf-compressor/types';

interface DownloadButtonProps {
  result: CompressionResult;
  fileName: string;
  onReset: () => void;
}

export default function DownloadButton({ result, fileName, onReset }: DownloadButtonProps) {
  const [downloaded, setDownloaded] = useState(false);

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

    // Create output filename: "compressed_originalname.pdf"
    const baseName = fileName.replace(/\.pdf$/i, '');
    a.download = `compressed_${baseName}.pdf`;

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
      className="flex flex-col items-center space-y-4 mt-8"
    >
      <button
        onClick={handleDownload}
        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-violet-600 to-blue-600 rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]"
      >
        <span className="absolute inset-0 w-full h-full -mt-1 rounded-full opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
        {downloaded ? (
          <Check className="w-5 h-5 mr-2 text-emerald-300" />
        ) : (
          <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
        )}
        {downloaded ? 'Downloaded!' : 'Download Compressed PDF'}
        <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
          {(result.compressedSize / (1024 * 1024)).toFixed(2)} MB
        </span>
      </button>

      <button
        onClick={onReset}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <RefreshCcw className="w-4 h-4" />
        Compress Another File
      </button>
    </motion.div>
  );
}
