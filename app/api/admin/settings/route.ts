import { NextResponse } from 'next/server';
import { requireAdminAPI } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

const DEFAULT_SETTINGS = {
  siteName: 'TrickFunda',
  maintenanceMode: false,
  allowRegistrations: true,
  seoDescription: 'World-Class Notes and Quizzes',
  contactEmail: 'admin@trickfunda.com',
  features: {
    kdMethod: true,
    customQuizzes: true,
    leaderboard: false,
  }
};

export async function GET() {
  try {
    await requireAdminAPI();
    
    if (!fs.existsSync(SETTINGS_PATH)) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
    
    const data = await fs.promises.readFile(SETTINGS_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error: any) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminAPI();
    
    const body = await req.json();
    
    // Ensure data directory exists
    const dataDir = path.dirname(SETTINGS_PATH);
    if (!fs.existsSync(dataDir)) {
      await fs.promises.mkdir(dataDir, { recursive: true });
    }
    
    await fs.promises.writeFile(SETTINGS_PATH, JSON.stringify(body, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
