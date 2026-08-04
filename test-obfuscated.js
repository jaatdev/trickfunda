const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { ConnectionTCPObfuscated } = require('telegram/network/connection/TCPObfuscated');

(async () => {
  const apiId = 31423371;
  const apiHash = 'e1b44767ebf3fb19e0bcad9e1f707d17';

  console.log('Testing Obfuscated connection...');
  const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
    connectionRetries: 1,
    connection: ConnectionTCPObfuscated,
  });

  try {
    await client.connect();
    console.log('Connected successfully with Obfuscated TCP!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.disconnect();
    process.exit(0);
  }
})();
