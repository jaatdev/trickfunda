import { VideoMeta } from '../types';

export const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/ogg'];
export const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const format2 = (num: number) => num.toString().padStart(2, '0');

  if (h > 0) {
    return `${h}:${format2(m)}:${format2(s)}`;
  }
  return `${format2(m)}:${format2(s)}`;
}

export function isValidVideoFile(file: File): boolean {
  return SUPPORTED_VIDEO_FORMATS.includes(file.type) && file.size <= MAX_VIDEO_SIZE;
}

export function getVideoMeta(file: File): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        name: file.name,
        duration: video.duration,
        width: video.videoWidth, // display width - default to natural
        height: video.videoHeight,
        naturalWidth: video.videoWidth,
        naturalHeight: video.videoHeight,
        type: file.type,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata.'));
    };

    video.src = url;
  });
}
