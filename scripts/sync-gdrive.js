const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_FOLDER_ID = '1I3yBQrBcvlAZdyGRsosnC1o2BbH8fGJ9';
const DEST_DIR = path.join(process.cwd(), 'data');

// Basic .env parser
function loadEnv() {
  ['.env', '.env.local'].forEach(file => {
    if (fs.existsSync(file)) {
      fs.readFileSync(file, 'utf-8').split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
      });
    }
  });
}
loadEnv();

let clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
let privateKey = process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null;
let apiKey = process.env.GOOGLE_API_KEY; // The API key they provided in Vercel

if (fs.existsSync('gdrive-service-account.json')) {
  const sa = JSON.parse(fs.readFileSync('gdrive-service-account.json', 'utf-8'));
  clientEmail = sa.client_email;
  privateKey = sa.private_key;
}

if (!apiKey && (!clientEmail || !privateKey)) {
  console.error('ERROR: Missing Google Service Account credentials or GOOGLE_API_KEY.');
  console.error('Provide gdrive-service-account.json, or set GOOGLE_API_KEY in Vercel.');
  process.exit(1);
}

// Global token (either Bearer JWT or API Key query param)
let globalAuthToken = null;
let isApiKey = false;

async function getAccessToken() {
  if (apiKey) {
    isApiKey = true;
    return apiKey;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');
  const signatureInput = `${b64Header}.${b64Claim}`;
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(privateKey, 'base64url');
  
  const jwt = `${signatureInput}.${signature}`;
  
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Auth failed: ${errorText}`);
  }
  
  const data = await res.json();
  return data.access_token;
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.ok) return res;
    if (i === retries - 1) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
}

function appendAuth(urlStr) {
  const url = new URL(urlStr);
  if (isApiKey) {
    url.searchParams.append('key', globalAuthToken);
  }
  return url;
}

function getAuthHeaders() {
  if (isApiKey) return {};
  return { Authorization: `Bearer ${globalAuthToken}` };
}

async function listFiles(folderId) {
  let files = [];
  let pageToken = null;
  do {
    const url = appendAuth('https://www.googleapis.com/drive/v3/files');
    url.searchParams.append('q', `'${folderId}' in parents and trashed = false`);
    url.searchParams.append('fields', 'nextPageToken, files(id, name, mimeType)');
    if (pageToken) url.searchParams.append('pageToken', pageToken);

    const res = await fetchWithRetry(url.toString(), {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    files = files.concat(data.files || []);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return files;
}

async function downloadFile(fileId, destPath) {
  const url = appendAuth(`https://www.googleapis.com/drive/v3/files/${fileId}`);
  url.searchParams.append('alt', 'media');
  
  const res = await fetchWithRetry(url.toString(), {
    headers: getAuthHeaders()
  });
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

async function syncFolder(folderId, currentPath) {
  if (!fs.existsSync(currentPath)) {
    fs.mkdirSync(currentPath, { recursive: true });
  }

  const files = await listFiles(folderId);
  for (const file of files) {
    const filePath = path.join(currentPath, file.name);
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      console.log(`[Folder] ${filePath}`);
      await syncFolder(file.id, filePath);
    } else {
      console.log(`[File] ${filePath}`);
      await downloadFile(file.id, filePath);
    }
  }
}

async function main() {
  console.log('Authenticating with Google...');
  try {
    globalAuthToken = await getAccessToken();
  } catch (e) {
    console.error('Failed to authenticate:', e.message);
    process.exit(1);
  }

  console.log('Starting Google Drive sync...');
  if (fs.existsSync(DEST_DIR)) {
    fs.rmSync(DEST_DIR, { recursive: true, force: true });
  }
  
  try {
    await syncFolder(ROOT_FOLDER_ID, DEST_DIR);
    console.log('Sync complete!');
  } catch (e) {
    console.error('Error syncing:', e.message);
    process.exit(1);
  }
}

main();
