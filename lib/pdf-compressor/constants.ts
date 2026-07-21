import { CompressionOptions, CompressionQuality } from './types';

export const QUALITY_PRESETS: Record<CompressionQuality, Partial<CompressionOptions>> = {
  ultra: {
    imageQuality: 0.92,
    maxDimension: Infinity,
    downscaleOversized: false
  },
  balanced: {
    imageQuality: 0.75,
    maxDimension: 2048,
    downscaleOversized: true
  },
  maximum: {
    imageQuality: 0.55,
    maxDimension: 1200,
    downscaleOversized: true
  }
};

export const COMPRESSION_CONFIG = {
  chunkSize: 1024 * 1024,
  maxWorkers: 2,
  progressInterval: 100
};

export const PRESET_LABELS = {
  ultra: {
    label: 'Ultra',
    description: 'Minimal loss, retains high quality, less compression'
  },
  balanced: {
    label: 'Balanced',
    description: 'Good balance between quality and file size reduction'
  },
  maximum: {
    label: 'Maximum',
    description: 'Aggressive compression, noticeable quality reduction, smallest file'
  }
};
