import { NextResponse } from 'next/server';
import { requireAdminAPI } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

const KD_METHOD_DIR = path.join(process.cwd(), 'data', 'study-material');

// Helper to ensure paths don't escape the study-material directory
function getSafePath(requestPath: string) {
  // Remove leading slashes and normalize
  const normalized = path.normalize(requestPath.replace(/^\/+/, ''));
  const fullPath = path.join(KD_METHOD_DIR, normalized);
  
  if (!fullPath.startsWith(KD_METHOD_DIR)) {
    throw new Error('Invalid path: Directory traversal not allowed');
  }
  return fullPath;
}

export async function POST(req: Request) {
  try {
    await requireAdminAPI();
    
    const body = await req.json();
    const { action, targetPath, content } = body;
    
    if (!action || !targetPath) {
      return NextResponse.json({ error: 'Action and targetPath are required' }, { status: 400 });
    }
    
    const safePath = getSafePath(targetPath);
    
    switch (action) {
      case 'readDir':
        if (!fs.existsSync(safePath)) {
          return NextResponse.json({ error: 'Directory not found' }, { status: 404 });
        }
        const entries = await fs.promises.readdir(safePath, { withFileTypes: true });
        const items = entries.map(entry => ({
          name: entry.name,
          isDirectory: entry.isDirectory(),
          path: path.posix.join(targetPath, entry.name)
        }));
        return NextResponse.json({ items });
        
      case 'readFile':
        if (!fs.existsSync(safePath)) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        const fileContent = await fs.promises.readFile(safePath, 'utf-8');
        return NextResponse.json({ content: fileContent });
        
      case 'writeFile':
        if (content === undefined) {
          return NextResponse.json({ error: 'Content required for writeFile' }, { status: 400 });
        }
        // Ensure parent directory exists
        await fs.promises.mkdir(path.dirname(safePath), { recursive: true });
        await fs.promises.writeFile(safePath, content, 'utf-8');
        return NextResponse.json({ success: true, message: 'File saved' });
        
      case 'mkdir':
        await fs.promises.mkdir(safePath, { recursive: true });
        return NextResponse.json({ success: true, message: 'Directory created' });
        
      case 'delete':
        if (!fs.existsSync(safePath)) {
          return NextResponse.json({ error: 'Path not found' }, { status: 404 });
        }
        const stat = await fs.promises.stat(safePath);
        if (stat.isDirectory()) {
          await fs.promises.rm(safePath, { recursive: true, force: true });
        } else {
          await fs.promises.unlink(safePath);
        }
        return NextResponse.json({ success: true, message: 'Deleted' });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('FS API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
