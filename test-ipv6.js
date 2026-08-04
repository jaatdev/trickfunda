const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { ConnectionTCPObfuscated } = require('telegram/network/connection/TCPObfuscated');

(async () => {
  const apiId = 31423371;
  const apiHash = 'e1b44767ebf3fb19e0bcad9e1f707d17';

  const stringSession = new StringSession('');
  stringSession.setDC(4, '2001:67c:4e8:f004::a', 443);

  console.log('Starting IPv6 check...');
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 1,
    connection: ConnectionTCPObfuscated
  });

  try {
    console.log('Connecting via IPv6...');
    await client.connect();
    console.log('Connected! Is connected boolean:', client.connected);
  } catch (error) {
    console.error('Fatal Error:', error);
  } finally {
    process.exit(0);
  }
})();
