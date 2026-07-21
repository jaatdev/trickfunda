import { motion } from 'framer-motion';
import { FileArchive, Upload, FileCheck } from 'lucide-react';
import { useCallback, useState } from 'react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isDisabled: boolean;
}

export default function DropZone({ onFileSelect, isDisabled }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isDisabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf' && file.size <= 500 * 1024 * 1024) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [isDisabled, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isDisabled) setIsDragOver(true);
  }, [isDisabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf' && file.size <= 500 * 1024 * 1024) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-500 ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className={`absolute inset-0 bg-white/[0.02] border-2 border-dashed rounded-3xl transition-colors duration-500 ${
        isDragOver ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-white/30 hover:bg-white/[0.04]'
      }`} />
      
      {/* Particles/glow effect for drag over */}
      {isDragOver && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="absolute inset-0 bg-violet-500/20 blur-[50px] -z-10"
        />
      )}

      <input
        type="file"
        accept="application/pdf"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-50"
        onChange={handleFileChange}
        disabled={isDisabled}
      />

      <div className="relative p-12 flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          animate={{
            scale: isDragOver ? 1.1 : 1,
            y: isDragOver ? -10 : 0
          }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="relative"
        >
          {selectedFile ? (
            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
              <FileCheck className="w-12 h-12 text-green-400" />
            </div>
          ) : (
            <div className={`w-24 h-24 rounded-full flex items-center justify-center border ${
              isDragOver ? 'bg-violet-500/20 border-violet-500/50' : 'bg-white/5 border-white/10'
            }`}>
              {isDragOver ? (
                <Upload className="w-12 h-12 text-violet-400" />
              ) : (
                <FileArchive className="w-12 h-12 text-gray-400" />
              )}
            </div>
          )}
          
          {!selectedFile && !isDragOver && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -inset-4 border border-white/10 rounded-full pointer-events-none"
            />
          )}
        </motion.div>

        <div className="space-y-2">
          {selectedFile ? (
            <>
              <h3 className="text-xl font-bold text-white">{selectedFile.name}</h3>
              <p className="text-gray-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Drop your PDF here
              </h3>
              <p className="text-gray-400">
                or click to browse from your device
              </p>
            </>
          )}
        </div>
        
        {!selectedFile && (
          <div className="text-xs text-gray-500 bg-black/20 px-4 py-2 rounded-full border border-white/5">
            Max file size: 500MB
          </div>
        )}
      </div>
    </motion.div>
  );
}
