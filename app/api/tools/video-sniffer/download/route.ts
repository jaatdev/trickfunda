import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// This is required to enable streaming responses in Next.js App Router for Edge/Node
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, filename, headers } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400 });
    }

    const safeFilename = filename ? filename.replace(/[^a-z0-9_\-\.]/gi, '_') : 'video';
    
    // Ensure the public/downloads directory exists
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const outputPath = path.join(downloadsDir, `${safeFilename}.mp4`);

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        // Function to send SSE messages
        const send = (type: string, data: string) => {
          controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        send('info', `Starting download for ${url}...`);
        send('info', `Output file will be saved as: ${safeFilename}.mp4`);

        // Specify local binaries path
        const binPath = path.join(process.cwd(), 'bin');
        const ytDlpPath = path.join(binPath, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

        const args: string[] = [
          url,
          '-o',
          outputPath,
          '--merge-output-format',
          'mp4'
        ];

        let hasCookie = false;

        if (headers && typeof headers === 'object') {
          for (const [key, value] of Object.entries(headers)) {
            if (key && value && typeof value === 'string') {
              args.push('--add-header', `${key}: ${value}`);
              if (key.toLowerCase() === 'referer') {
                args.push('--referer', value);
              }
              if (key.toLowerCase() === 'cookie') {
                hasCookie = true;
              }
            }
          }
        }

        // Add --cookies-from-browser fallback option if Cookie is not passed directly in headers
        if (!hasCookie) {
          args.push('--cookies-from-browser', 'chrome');
        }

        // Spawn yt-dlp process using the local binary
        const ytDlpProcess = spawn(ytDlpPath, args, {
          env: {
            ...process.env,
            PATH: `${binPath}${path.delimiter}${process.env.PATH}` // Add local bin to PATH for ffmpeg
          }
        });

        ytDlpProcess.stdout.on('data', (data) => {
          const lines = data.toString().split('\n').filter((line: string) => line.trim() !== '');
          for (const line of lines) {
            send('log', line);
          }
        });

        ytDlpProcess.stderr.on('data', (data) => {
          const lines = data.toString().split('\n').filter((line: string) => line.trim() !== '');
          for (const line of lines) {
            send('log', line);
          }
        });

        ytDlpProcess.on('close', (code) => {
          if (code === 0) {
            send('success', `Download completed successfully!`);
            send('done', `/downloads/${safeFilename}.mp4`);
          } else {
            send('error', `Process exited with code ${code}`);
          }
          controller.close();
        });

        ytDlpProcess.on('error', (err) => {
          send('error', `Failed to start process: ${err.message}. Make sure yt-dlp and ffmpeg are installed and in your PATH.`);
          controller.close();
        });
        
        // If the client disconnects, kill the process
        req.signal.addEventListener('abort', () => {
          send('info', 'Client disconnected, aborting download...');
          ytDlpProcess.kill();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
