const { w3cwebsocket } = require('websocket');
global.WebSocket = w3cwebsocket; // Polyfill for gramjs

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

(async () => {
  const apiId = 31423371;
  const apiHash = 'e1b44767ebf3fb19e0bcad9e1f707d17';

  console.log('Starting WSS polyfill check...');
  const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
    connectionRetries: 1,
    useWSS: true
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected! Is connected boolean:', client.connected);
  } catch (error) {
    console.error('Fatal Error:', error);
  } finally {
    process.exit(0);
  }
})();
