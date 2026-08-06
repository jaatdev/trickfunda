require('dotenv').config({ path: '.env.local' });
const TelegramBot = require('node-telegram-bot-api');
const BotConstructor = typeof TelegramBot === 'function' ? TelegramBot : (TelegramBot.default || TelegramBot.TelegramBot);
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { ConnectionTCPObfuscated } = require('telegram/network/connection/TCPObfuscated');
const fs = require('fs');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set in .env.local");
  process.exit(1);
}

const bot = new BotConstructor(token, { polling: true });

bot.on('polling_error', (error) => {
  console.log('Polling Error:', error.code || error.message);
});

const SESSION_FILE = path.join(process.cwd(), 'telegram-session.json');

function getSessionData() {
  if (fs.existsSync(SESSION_FILE)) {
    try {
      const data = fs.readFileSync(SESSION_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }
  return null;
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  if (text.startsWith('/start')) {
    bot.sendMessage(chatId, 'Welcome! Send me a Telegram message link (e.g. t.me/c/123/456) and I will download the media and send it to you here.').catch(console.error);
    return;
  }

  // Check if it's a telegram link
  if (text.includes('t.me/')) {
    const session = getSessionData();
    if (!session || !session.stringSession) {
      bot.sendMessage(chatId, 'Not authenticated with Telegram MTProto. Please login via the web UI first.').catch(console.error);
      return;
    }

    let targetChatId = null;
    let messageId = null;

    try {
      // Basic extraction
      const match = text.match(/t\.me\/(c\/)?([a-zA-Z0-9_-]+)\/(\d+)/);
      if (match) {
        if (match[1] === 'c/') {
          targetChatId = Number('-100' + match[2]);
        } else {
          targetChatId = match[2];
        }
        messageId = Number(match[3]);
      }
    } catch (e) {
      console.error(e);
    }

    if (!targetChatId || !messageId) {
      bot.sendMessage(chatId, 'Could not parse chat or message ID from the link. Please provide a valid link.').catch(console.error);
      return;
    }

    let statusMsgId = null;
    try {
      const msg = await bot.sendMessage(chatId, 'Connecting to Telegram...');
      statusMsgId = msg.message_id;
    } catch (e) { console.error(e); }

    const client = new TelegramClient(
      new StringSession(session.stringSession),
      Number(session.apiId),
      session.apiHash,
      {
        connectionRetries: 1,
        connection: ConnectionTCPObfuscated,
        useIPV6: true,
      }
    );

    try {
      await client.connect();
      if (!client.connected) {
        throw new Error('Failed to connect to Telegram over IPv6. Connection blocked.');
      }
      
      if (statusMsgId) bot.editMessageText(`Fetching message ${messageId}...`, { chat_id: chatId, message_id: statusMsgId }).catch(console.error);

      const messages = await client.getMessages(targetChatId, { ids: [messageId] });
      if (!messages || messages.length === 0 || !messages[0]) {
        if (statusMsgId) bot.editMessageText('Message not found. Ensure your user account is a member of the channel.', { chat_id: chatId, message_id: statusMsgId }).catch(console.error);
        return;
      }

      const message = messages[0];
      if (!message.media) {
        if (statusMsgId) bot.editMessageText('This message does not contain any downloadable media.', { chat_id: chatId, message_id: statusMsgId }).catch(console.error);
        return;
      }

      const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      const ext = (message.file && message.file.ext) || '.mp4';
      const filename = `bot_dl_${messageId}_${Date.now()}${ext}`;
      const outputPath = path.join(downloadsDir, filename);

      let lastUpdate = 0;

      await client.downloadMedia(message, {
        outputFile: outputPath,
        workers: 8,
        progressCallback: (downloaded, total) => {
          const now = Date.now();
          if (now - lastUpdate < 3000 && downloaded.toString() !== total.toString()) return; 
          lastUpdate = now;
          
          let percentage = 0;
          const dl = Number(downloaded.toString());
          const tot = Number(total.toString());
          if (tot) percentage = Number(((dl / tot) * 100).toFixed(1));
          
          const progressText = `Downloading to bot server... ${percentage}% (${(dl / 1024 / 1024).toFixed(2)} MB)`;
          
          if (statusMsgId) {
             bot.editMessageText(progressText, { chat_id: chatId, message_id: statusMsgId }).catch(() => {});
          }
        }
      });

      if (statusMsgId) bot.editMessageText('Download complete! Uploading video to chat so you can save it...', { chat_id: chatId, message_id: statusMsgId }).catch(console.error);

      // Upload file back to Telegram via the Bot API
      if (ext === '.mp4' || ext === '.mkv') {
        await bot.sendVideo(chatId, outputPath);
      } else if (ext === '.jpg' || ext === '.png') {
        await bot.sendPhoto(chatId, outputPath);
      } else {
        await bot.sendDocument(chatId, outputPath);
      }

      // Cleanup local file
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      
    } catch (err) {
      console.error(err);
      if (statusMsgId) bot.editMessageText(`Error: ${err.message || 'An unknown error occurred'}`, { chat_id: chatId, message_id: statusMsgId }).catch(console.error);
    } finally {
      client.disconnect();
    }
  }
});

console.log('Telegram Bot is running...');
