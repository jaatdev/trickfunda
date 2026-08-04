const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { ConnectionTCPObfuscated } = require('telegram/network/connection/TCPObfuscated');

(async () => {
  const apiId = 31423371;
  const apiHash = 'e1b44767ebf3fb19e0bcad9e1f707d17';

  console.log('Starting check...');
  const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
    connectionRetries: 1,
    connection: ConnectionTCPObfuscated
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected! Is connected boolean:', client.connected);
    if (!client.connected) {
      console.log('Client is NOT actually connected despite connect() resolving!');
    }
  } catch (error) {
    console.error('Fatal Error:', error);
  } finally {
    process.exit(0);
  }
})();
