const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { ConnectionTCPObfuscated } = require('telegram/network/connection/TCPObfuscated');

(async () => {
  const apiId = 31423371;
  const apiHash = 'e1b44767ebf3fb19e0bcad9e1f707d17';
  const phone = '+919897147756';

  const stringSession = new StringSession('');
  // Force DC 4 to use a different IP
  stringSession.setDC(4, '91.108.56.164', 443);

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 1,
    connection: ConnectionTCPObfuscated,
    useWSS: false
  });

  try {
    console.log('Connecting to alternate IP (91.108.56.164)...');
    await client.connect();
    console.log('Connected!');
    
    console.log('Sending Code...');
    const result = await client.sendCode({ apiId, apiHash }, phone);
    console.log('Code sent successfully!');
  } catch (error) {
    console.error('Fatal Error:', error);
  } finally {
    await client.disconnect();
    process.exit(0);
  }
})();
