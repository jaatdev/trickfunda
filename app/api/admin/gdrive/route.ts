import { NextResponse } from 'next/server';
import { requireAdminAPI } from '@/lib/adminAuth';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Load credentials from service account file or env vars
function getCredentials() {
  let clientEmail: string | null = null;
  let privateKey: string | null = null;
  let apiKey: string | null = null;

  const saPath = path.join(process.cwd(), 'gdrive-service-account.json');
  if (fs.existsSync(saPath)) {
    const sa = JSON.parse(fs.readFileSync(saPath, 'utf-8'));
    clientEmail = sa.client_email;
    privateKey = sa.private_key;
  }

  if (!clientEmail && process.env.GOOGLE_CLIENT_EMAIL) {
    clientEmail = process.env.GOOGLE_CLIENT_EMAIL.replace(/^['"]|['"]$/g, '').trim();
  }
  if (!privateKey && process.env.GOOGLE_PRIVATE_KEY) {
    privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/^['"]|['"]$/g, '').replace(/\\\\n/g, '\n').trim();
  }
  if (process.env.GOOGLE_API_KEY) {
    apiKey = process.env.GOOGLE_API_KEY.replace(/^['"]|['"]$/g, '').trim();
  }

  return { clientEmail, privateKey, apiKey };
}

async function getAccessToken(creds: ReturnType<typeof getCredentials>) {
  if (creds.apiKey) {
    return { token: creds.apiKey, isApiKey: true };
  }

  if (!creds.clientEmail || !creds.privateKey) {
    throw new Error('No Google credentials configured. Add gdrive-service-account.json or set GOOGLE_API_KEY.');
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: creds.clientEmail,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');
  const signatureInput = `${b64Header}.${b64Claim}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(creds.privateKey, 'base64url');

  const jwt = `${signatureInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google auth failed: ${errorText}`);
  }

  const data = await res.json();
  return { token: data.access_token, isApiKey: false };
}

function buildUrl(base: string, params: Record<string, string>, auth: { token: string; isApiKey: boolean }) {
  const url = new URL(base);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  if (auth.isApiKey) {
    url.searchParams.append('key', auth.token);
  }
  return url.toString();
}

function getHeaders(auth: { token: string; isApiKey: boolean }): Record<string, string> {
  if (auth.isApiKey) return {};
  return { Authorization: `Bearer ${auth.token}` };
}

// Extract folder ID from various Google Drive URL formats
function extractFolderId(url: string): string | null {
  // Direct folder ID (no URL)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url.trim())) {
    return url.trim();
  }

  const patterns = [
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}

async function listDriveFolder(folderId: string, auth: { token: string; isApiKey: boolean }): Promise<DriveFile[]> {
  let files: DriveFile[] = [];
  let pageToken: string | null = null;

  do {
    const params: Record<string, string> = {
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime)',
      orderBy: 'folder,name',
      pageSize: '100',
    };
    if (pageToken) params.pageToken = pageToken;

    const url = buildUrl('https://www.googleapis.com/drive/v3/files', params, auth);
    const res = await fetch(url, { headers: getHeaders(auth) });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Drive API error: ${err}`);
    }

    const data = await res.json();
    files = files.concat(data.files || []);
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return files;
}

async function downloadDriveFile(fileId: string, auth: { token: string; isApiKey: boolean }): Promise<Buffer> {
  const url = buildUrl(`https://www.googleapis.com/drive/v3/files/${fileId}`, { alt: 'media' }, auth);
  const res = await fetch(url, { headers: getHeaders(auth) });
  if (!res.ok) {
    throw new Error(`Failed to download file: ${res.statusText}`);
  }
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer);
}

async function syncDriveToLocal(
  folderId: string,
  targetPath: string,
  auth: { token: string; isApiKey: boolean },
  selectedFiles: string[] | null,
  log: string[]
): Promise<void> {
  const localDir = path.join(DATA_DIR, targetPath);
  if (!localDir.startsWith(DATA_DIR)) {
    throw new Error('Invalid target path');
  }

  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  const files = await listDriveFolder(folderId, auth);
  for (const file of files) {
    // If selectedFiles is provided, only sync those
    if (selectedFiles && !selectedFiles.includes(file.id)) continue;

    const filePath = path.join(localDir, file.name);

    if (file.mimeType === 'application/vnd.google-apps.folder') {
      log.push(`📁 Creating folder: ${path.posix.join(targetPath, file.name)}`);
      await syncDriveToLocal(file.id, path.posix.join(targetPath, file.name), auth, null, log);
    } else {
      log.push(`📄 Downloading: ${path.posix.join(targetPath, file.name)}`);
      const buffer = await downloadDriveFile(file.id, auth);
      fs.writeFileSync(filePath, buffer);
    }
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminAPI();

    const body = await req.json();
    const { action } = body;

    const creds = getCredentials();
    const auth = await getAccessToken(creds);

    switch (action) {
      case 'browse': {
        const { url, folderId: directId } = body;
        let folderId = directId;

        if (url) {
          folderId = extractFolderId(url);
          if (!folderId) {
            return NextResponse.json({ error: 'Invalid Google Drive URL. Please paste a valid folder link.' }, { status: 400 });
          }
        }

        if (!folderId) {
          return NextResponse.json({ error: 'Folder ID or URL is required' }, { status: 400 });
        }

        const files = await listDriveFolder(folderId, auth);
        const items = files.map((f) => ({
          id: f.id,
          name: f.name,
          isFolder: f.mimeType === 'application/vnd.google-apps.folder',
          mimeType: f.mimeType,
          size: f.size ? parseInt(f.size) : 0,
          modifiedTime: f.modifiedTime || null,
        }));

        return NextResponse.json({ folderId, items });
      }

      case 'preview': {
        const { fileId } = body;
        if (!fileId) {
          return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
        }

        const buffer = await downloadDriveFile(fileId, auth);
        const content = buffer.toString('utf-8');

        // Try to parse as JSON for pretty formatting
        let parsed = null;
        try {
          parsed = JSON.parse(content);
        } catch {
          // Not JSON, return raw text
        }

        return NextResponse.json({
          content: parsed ? JSON.stringify(parsed, null, 2) : content,
          isJson: !!parsed,
          size: buffer.length,
        });
      }

      case 'sync': {
        const { url, folderId: directId, targetPath, selectedFiles } = body;
        let folderId = directId;

        if (url) {
          folderId = extractFolderId(url);
        }

        if (!folderId || !targetPath) {
          return NextResponse.json({ error: 'Folder ID and target path are required' }, { status: 400 });
        }

        // Validate target path
        const normalizedTarget = path.normalize(targetPath.replace(/^\/+/, ''));
        const fullTarget = path.join(DATA_DIR, normalizedTarget);
        if (!fullTarget.startsWith(DATA_DIR)) {
          return NextResponse.json({ error: 'Invalid target path' }, { status: 400 });
        }

        const log: string[] = [];
        log.push(`🚀 Starting sync from Drive folder ${folderId} → data/${normalizedTarget}`);

        await syncDriveToLocal(folderId, normalizedTarget, auth, selectedFiles || null, log);

        log.push(`✅ Sync complete!`);

        return NextResponse.json({ success: true, log });
      }

      default:
        return NextResponse.json({ error: 'Invalid action. Use: browse, preview, sync' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('GDrive API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
