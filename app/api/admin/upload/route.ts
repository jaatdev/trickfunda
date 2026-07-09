import { NextResponse } from 'next/server';
import { requireAdminAPI } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    await requireAdminAPI();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'uploads'; // e.g., 'figures', 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure the folder exists inside the public directory
    const publicDir = path.join(process.cwd(), 'public', folder);
    if (!fs.existsSync(publicDir)) {
      await fs.promises.mkdir(publicDir, { recursive: true });
    }

    // Generate a unique filename to prevent overwriting
    const originalName = file.name;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const uniqueFilename = `${baseName}-${Date.now()}${extension}`;
    const filePath = path.join(publicDir, uniqueFilename);

    await fs.promises.writeFile(filePath, buffer);

    // Return the URL that can be used to access the image
    const url = `/${folder}/${uniqueFilename}`;
    
    return NextResponse.json({ success: true, url, filename: uniqueFilename });

  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await requireAdminAPI();
    
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'uploads';
    
    const publicDir = path.join(process.cwd(), 'public', folder);
    if (!fs.existsSync(publicDir)) {
      return NextResponse.json({ files: [] });
    }
    
    const entries = await fs.promises.readdir(publicDir, { withFileTypes: true });
    const files = entries
      .filter(entry => entry.isFile() && !entry.name.startsWith('.'))
      .map(entry => ({
        name: entry.name,
        url: `/${folder}/${entry.name}`,
        // We can't get creation time reliably from readdir without stat, 
        // but for now just returning the names is fine.
      }));
      
    // Optionally stat files to sort by date
    const filesWithStats = await Promise.all(
      files.map(async (file) => {
        const stat = await fs.promises.stat(path.join(publicDir, file.name));
        return {
          ...file,
          mtime: stat.mtime.getTime(),
          size: stat.size
        };
      })
    );
    
    // Sort by newest first
    filesWithStats.sort((a, b) => b.mtime - a.mtime);
    
    return NextResponse.json({ files: filesWithStats });
    
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdminAPI();
    
    const body = await req.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Prevent directory traversal
    const normalizedUrl = path.normalize(url).replace(/^(\.\.[\/\\])+/, '');
    
    const filePath = path.join(process.cwd(), 'public', normalizedUrl);
    
    if (!filePath.startsWith(path.join(process.cwd(), 'public'))) {
       return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
