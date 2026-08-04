const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { ConnectionTCPObfuscated } = require('telegram/network/connection/TCPObfuscated');
const { Logger } = require('telegram/extensions/Logger');

(async () => {
  const apiId = 31423371;
  const apiHash = 'e1b44767ebf3fb19e0bcad9e1f707d17';
  const phone = '+919897147756';

  console.log('Starting GramJS Debug...');
  const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
    connectionRetries: 1,
    connection: ConnectionTCPObfuscated,
    useWSS: false
  });
  
  client.setLogLevel('debug'); // extremely verbose

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected!');
    
    console.log('Sending Code...');
    const result = await client.sendCode({ apiId, apiHash }, phone);
    console.log('Code sent successfully!', result);
  } catch (error) {
    console.error('Fatal Error:', error);
  } finally {
    await client.disconnect();
    process.exit(0);
  }
})();
