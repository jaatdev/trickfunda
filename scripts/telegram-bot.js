require('dotenv').config({ path: '.env.local' });
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { ConnectionTCPObfuscated } = require('telegram/network/connection/TCPObfuscated');
const { NewMessage } = require('telegram/events');
const { CallbackQuery } = require('telegram/events/CallbackQuery');
const fs = require('fs');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set in .env.local");
  process.exit(1);
}

const SESSION_FILE = path.join(process.cwd(), 'telegram-session.json');

function getSessionData() {
  if (fs.existsSync(SESSION_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
    } catch (e) {
      return null;
    }
  }
  return null;
}

const sessionData = getSessionData();
if (!sessionData || !sessionData.apiId || !sessionData.apiHash) {
  console.error("Please login via the web UI first to generate telegram-session.json containing apiId and apiHash.");
  process.exit(1);
}

const apiId = Number(sessionData.apiId);
const apiHash = sessionData.apiHash;

// Create the Bot Client
const botClient = new TelegramClient(new StringSession(''), apiId, apiHash, {
  connectionRetries: 5,
  connection: ConnectionTCPObfuscated,
  useIPV6: true,
});

async function main() {
  console.log('Starting Telegram Bot using MTProto...');
  await botClient.start({
    botAuthToken: token,
  });
  console.log('Bot is running and connected via MTProto (bypassing blocks)!');

  // Handle new messages (links)
  botClient.addEventHandler(async (event) => {
    const message = event.message;
    const chatId = message.chatId;
    const text = message.message || '';

    if (text.startsWith('/start')) {
      await botClient.sendMessage(chatId, { message: 'Welcome! Send me a Telegram message link (e.g. t.me/c/123/456) and I will download the media for you using your MTProto session.' });
      return;
    }

    if (text.includes('t.me/')) {
      const userSession = getSessionData();
      if (!userSession || !userSession.stringSession) {
        await botClient.sendMessage(chatId, { message: 'Not authenticated with Telegram MTProto. Please login via the web UI first.' });
        return;
      }

      let targetChatId = null;
      let messageId = null;

      try {
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
        await botClient.sendMessage(chatId, { message: 'Could not parse chat or message ID from the link. Please provide a valid link.' });
        return;
      }

      let statusMsg = await botClient.sendMessage(chatId, { message: 'Connecting to Telegram as User...' });

      const userClient = new TelegramClient(
        new StringSession(userSession.stringSession),
        apiId,
        apiHash,
        {
          connectionRetries: 1,
          connection: ConnectionTCPObfuscated,
          useIPV6: true,
        }
      );

      try {
        await userClient.connect();
        if (!userClient.connected) {
          throw new Error('Failed to connect to Telegram over IPv6. Connection blocked.');
        }

        await botClient.editMessage(chatId, { message: statusMsg.id, text: `Fetching message ${messageId}...` });

        const messages = await userClient.getMessages(targetChatId, { ids: [messageId] });
        if (!messages || messages.length === 0 || !messages[0]) {
          await botClient.editMessage(chatId, { message: statusMsg.id, text: 'Message not found. Ensure your user account is a member of the channel.' });
          return;
        }

        const msgObj = messages[0];
        if (!msgObj.media) {
          await botClient.editMessage(chatId, { message: statusMsg.id, text: 'This message does not contain any downloadable media.' });
          return;
        }

        let sizeStr = 'Unknown size';
        if (msgObj.document && msgObj.document.size) {
          const sizeMB = (msgObj.document.size / 1024 / 1024).toFixed(2);
          sizeStr = `${sizeMB} MB`;
        } else if (msgObj.photo) {
          sizeStr = 'Image';
        }

        const replyMarkup = new Api.ReplyInlineMarkup({
          rows: [
            new Api.KeyboardButtonRow({
              buttons: [
                new Api.KeyboardButtonCallback({
                  text: '⬇️ Download',
                  data: Buffer.from(`dl_${targetChatId}_${messageId}`),
                }),
              ],
            }),
          ],
        });

        await botClient.editMessage(chatId, { 
          message: statusMsg.id, 
          text: `Media found!\nSize: ${sizeStr}\n\nClick the button below to start downloading.`,
          replyMarkup: replyMarkup
        });
        
      } catch (err) {
        console.error(err);
        await botClient.sendMessage(chatId, { message: `Error: ${err.message || 'An unknown error occurred'}` });
      } finally {
        await userClient.disconnect();
      }
    }
  }, new NewMessage({}));

  // Handle callback queries (button clicks)
  botClient.addEventHandler(async (event) => {
    const data = event.query.data.toString();
    if (data.startsWith('dl_')) {
      const parts = data.split('_');
      const targetChatId = parts[1];
      const messageId = Number(parts[2]);
      
      const chatId = event.query.userId;
      const msgIdToEdit = event.query.msgId;

      await event.answer({ message: "Starting download..." });
      await botClient.editMessage(chatId, { message: msgIdToEdit, text: 'Preparing to download...' });

      const userSession = getSessionData();
      if (!userSession) return;

      const userClient = new TelegramClient(
        new StringSession(userSession.stringSession),
        apiId,
        apiHash,
        {
          connectionRetries: 1,
          connection: ConnectionTCPObfuscated,
          useIPV6: true,
        }
      );

      try {
        await userClient.connect();
        
        const messages = await userClient.getMessages(targetChatId, { ids: [messageId] });
        if (!messages || messages.length === 0 || !messages[0]) {
          await botClient.editMessage(chatId, { message: msgIdToEdit, text: 'Error: Message not found during download phase.' });
          return;
        }

        const msgObj = messages[0];
        
        const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
        if (!fs.existsSync(downloadsDir)) {
          fs.mkdirSync(downloadsDir, { recursive: true });
        }

        const ext = (msgObj.file && msgObj.file.ext) || '.mp4';
        const filename = `bot_dl_${messageId}_${Date.now()}${ext}`;
        const outputPath = path.join(downloadsDir, filename);

        let lastUpdate = 0;

        await userClient.downloadMedia(msgObj, {
          outputFile: outputPath,
          workers: 8,
          progressCallback: async (downloaded, total) => {
            const now = Date.now();
            if (now - lastUpdate < 3000 && downloaded.toString() !== total.toString()) return; 
            lastUpdate = now;
            
            let percentage = 0;
            const dl = Number(downloaded.toString());
            const tot = Number(total.toString());
            if (tot) percentage = Number(((dl / tot) * 100).toFixed(1));
            
            const progressText = `Downloading... ${percentage}% (${(dl / 1024 / 1024).toFixed(2)} MB)`;
            
            try {
              await botClient.editMessage(chatId, { message: msgIdToEdit, text: progressText });
            } catch (e) {}
          }
        });

        await botClient.editMessage(chatId, { message: msgIdToEdit, text: 'Download completed! Uploading back to you...' });

        await botClient.sendFile(chatId, {
          file: outputPath,
          replyTo: msgIdToEdit,
        });

        // Cleanup local file
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        
      } catch (err) {
        console.error(err);
        await botClient.editMessage(chatId, { message: msgIdToEdit, text: `Error during download: ${err.message || 'An unknown error occurred'}` });
      } finally {
        await userClient.disconnect();
      }
    }
  }, new CallbackQuery({}));
}

main().catch(console.error);
