import { CompressionOptions, CompressionProgress, CompressionResult, WorkerMessage } from './types';
import { compressPDF } from './pipeline';

export class CompressionWorkerManager {
  private worker: Worker | null = null;

  public async compress(
    pdfBytes: ArrayBuffer,
    options: CompressionOptions,
    onProgress: (progress: CompressionProgress) => void
  ): Promise<CompressionResult> {
    return new Promise((resolve, reject) => {
      try {
        if (typeof window !== 'undefined' && window.Worker) {
          this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

          this.worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
            const msg = e.data;
            if (msg.type === 'PROGRESS') {
              onProgress(msg.payload);
            } else if (msg.type === 'RESULT') {
              const result = msg.payload;
              if (result.compressedBytes) {
                result.compressedBlob = new Blob([result.compressedBytes as any], { type: 'application/pdf' });
              }
              this.cleanup();
              resolve(result);
            } else if (msg.type === 'ERROR') {
              this.cleanup();
              reject(new Error(msg.payload));
            }
          };

          this.worker.onerror = (err) => {
            this.cleanup();
            reject(err);
          };

          this.worker.postMessage(
            {
              type: 'COMPRESS',
              payload: { pdfBytes, options }
            },
            [pdfBytes]
          );
        } else {
          compressPDF(pdfBytes, options, onProgress)
            .then(result => {
              if (result.compressedBytes) {
                result.compressedBlob = new Blob([result.compressedBytes as any], { type: 'application/pdf' });
              }
              resolve(result);
            })
            .catch(reject);
        }
      } catch (error) {
        this.cleanup();
        reject(error);
      }
    });
  }

  public abort() {
    if (this.worker) {
      this.worker.postMessage({ type: 'ABORT' });
      this.cleanup();
    }
  }

  private cleanup() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
