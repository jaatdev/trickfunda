export type CompressionQuality = 'ultra' | 'balanced' | 'maximum';

export interface CompressionOptions {
  quality: CompressionQuality;
  imageQuality: number;
  downscaleOversized: boolean;
  stripMetadata: boolean;
  deduplicateStreams: boolean;
  optimizeFonts: boolean;
  maxDimension?: number;
}

export interface CompressionProgress {
  phase: 'analyzing' | 'compressing' | 'rebuilding' | 'finalizing';
  pagesProcessed: number;
  totalPages: number;
  bytesProcessed: number;
  bytesSaved: number;
  currentOperation: string;
  estimatedTimeRemaining: number;
  percentage: number;
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  timeTaken: number;
  pagesProcessed: number;
  imagesCompressed: number;
  fontsOptimized: number;
  metadataStripped: number;
  compressedBlob?: Blob;
  compressedBytes?: Uint8Array;
  breakdown: {
    imagesSaved: number;
    fontsSaved: number;
    metadataSaved: number;
    otherSaved: number;
  };
}

export interface PageDetail {
  pageNumber: number;
  imageCount: number;
  fontCount: number;
}

export interface PDFAnalysis {
  totalPages: number;
  totalImages: number;
  totalFonts: number;
  estimatedCompressedSize: number;
  hasEncryption: boolean;
  fileSize: number;
  pageDetails: PageDetail[];
}

export type WorkerMessage = 
  | { type: 'COMPRESS'; payload: { pdfBytes: ArrayBuffer; options: CompressionOptions } }
  | { type: 'PROGRESS'; payload: CompressionProgress }
  | { type: 'RESULT'; payload: CompressionResult }
  | { type: 'ERROR'; payload: string }
  | { type: 'ABORT' };

export interface ImageInfo {
  width: number;
  height: number;
  bitsPerComponent: number;
  colorSpace: string;
  dataSize: number;
  objectRef: any;
}
