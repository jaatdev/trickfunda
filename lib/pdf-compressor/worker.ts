/**
 * PDF Compression Web Worker
 * 
 * Runs the compression pipeline off the main thread for zero UI freezing.
 * Communicates via structured messages with Transferable ArrayBuffers.
 */

import { compressPDF, requestAbort } from './pipeline';
import type { WorkerMessage } from './types';

/* eslint-disable no-restricted-globals */
const ctx: Worker = self as any;

ctx.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const message = e.data;

  if (message.type === 'ABORT') {
    requestAbort();
    return;
  }

  if (message.type === 'COMPRESS') {
    try {
      const { pdfBytes, options } = message.payload;

      const result = await compressPDF(pdfBytes, options, (progress) => {
        const msg: WorkerMessage = { type: 'PROGRESS', payload: progress };
        ctx.postMessage(msg);
      });

      const resultMessage: WorkerMessage = { type: 'RESULT', payload: result };

      if (result.compressedBytes) {
        ctx.postMessage(resultMessage, [result.compressedBytes.buffer] as any);
      } else {
        ctx.postMessage(resultMessage);
      }
    } catch (error) {
      const errMsg: WorkerMessage = {
        type: 'ERROR',
        payload: error instanceof Error ? error.message : String(error),
      };
      ctx.postMessage(errMsg);
    }
  }
};
