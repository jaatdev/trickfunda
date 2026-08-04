import { NextRequest, NextResponse } from 'next/server';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { getSessionData } from '@/utils/telegram-session';
import path from 'path';
import fs from 'fs';
const { ConnectionTCPObfuscated } = require('telegram/network/connection/TCPObfuscated');

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionData();
    if (!session || !session.stringSession) {
      return NextResponse.json({ error: 'Not authenticated with Telegram' }, { status: 401 });
    }

    const body = await req.json();
    const { link } = body;

    if (!link) {
      return NextResponse.json({ error: 'Telegram message link is required' }, { status: 400 });
    }

    let chatId: any = null;
    let messageId: number | null = null;

    try {
      const url = new URL(link);
      const parts = url.pathname.split('/').filter(Boolean);
      
      if (parts[0] === 'c') {
        // Private channel: https://t.me/c/1234567890/123
        chatId = Number('-100' + parts[1]);
        messageId = Number(parts[2]);
      } else {
        // Public channel: https://t.me/channelname/123
        chatId = parts[0];
        messageId = Number(parts[1]);
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Telegram link format' }, { status: 400 });
    }

    if (!chatId || !messageId) {
       return NextResponse.json({ error: 'Could not parse chat or message ID from link' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;
        const send = (type: string, data: any) => {
          if (isClosed) return;
          try {
            controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
          } catch(e) {
            isClosed = true;
          }
        };

        send('info', `Connecting to Telegram...`);

        const client = new TelegramClient(new StringSession(session.stringSession), Number(session.apiId), session.apiHash, {
          connectionRetries: 1,
          connection: ConnectionTCPObfuscated,
          useIPV6: true,
        });

        try {
          await client.connect();
          if (!client.connected) {
             throw new Error('Failed to connect to Telegram over IPv6. Connection blocked.');
          }
          send('info', `Fetching message ${messageId}...`);

          const messages = await client.getMessages(chatId, { ids: [messageId] });
          if (!messages || messages.length === 0 || !messages[0]) {
             send('error', 'Message not found. Ensure you are a member of the channel.');
             controller.close();
             return;
          }

          const message = messages[0];
          if (!message.media) {
             send('error', 'This message does not contain any downloadable media.');
             controller.close();
             return;
          }

          send('info', 'Media found! Starting download...');

          const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
          if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
          }

          // Generate filename
          const ext = (message.file as any)?.ext || '.mp4';
          const filename = `telegram_vid_${messageId}_${Date.now()}${ext}`;
          const outputPath = path.join(downloadsDir, filename);

          // Stream download directly to file with optimal superfast settings
          let lastUpdate = 0;
          await client.downloadMedia(message, {
            outputFile: outputPath,
            workers: 8, // 8 is the optimal parallel number (higher causes TCP congestion/slowdowns)
            progressCallback: (downloaded: any, total: any) => {
               const now = Date.now();
               // Throttle SSE events to once every 500ms to prevent extreme Node.js event loop lag
               if (now - lastUpdate < 500 && downloaded.toString() !== total.toString()) return;
               lastUpdate = now;
               
               let percentage = 0;
               const dl = Number(downloaded.toString());
               const tot = Number(total.toString());
               if (tot) percentage = Number(((dl / tot) * 100).toFixed(1));
               send('progress', { downloaded: dl, total: tot, percentage });
            }
          } as any);

          send('success', 'Download completed successfully!');
          send('done', `/downloads/${filename}`);

        } catch (err: any) {
          console.error(err);
          send('error', err.errorMessage || err.message || 'An unknown error occurred');
        } finally {
          if (!isClosed) {
            try { controller.close(); } catch(e) {}
            isClosed = true;
          }
        }
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
