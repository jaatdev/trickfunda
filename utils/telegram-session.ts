import fs from 'fs';
import path from 'path';

const SESSION_FILE = path.join(process.cwd(), 'telegram-session.json');

export interface TelegramSession {
  apiId: string;
  apiHash: string;
  stringSession: string;
}

export function getSessionData(): TelegramSession | null {
  if (fs.existsSync(SESSION_FILE)) {
    try {
      const data = fs.readFileSync(SESSION_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function saveSessionData(data: TelegramSession) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
}

export function clearSessionData() {
  if (fs.existsSync(SESSION_FILE)) {
    fs.unlinkSync(SESSION_FILE);
  }
}
