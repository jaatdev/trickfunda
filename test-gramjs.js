const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

(async () => {
  const apiId = 31423371;
  const apiHash = 'e1b44767ebf3fb19e0bcad9e1f707d17';
  const phone = '+919897147756';

  console.log('Testing GramJS connection...');
  const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
    connectionRetries: 1,
    ipv6: true,
  });

  try {
    await client.connect();
    console.log('Connected successfully!');
    
    // Do not actually send the code to avoid spamming the user, just check if connect works
    // console.log('Sending code...');
    // await client.sendCode({ apiId, apiHash }, phone);
    // console.log('Code sent successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.disconnect();
    process.exit(0);
  }
})();
