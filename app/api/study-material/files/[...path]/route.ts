export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: routePath } = await params;
  
  // Removed hardcoded notes.pdf
  
  // Ensure the path is joined safely without directory traversal
  const safePath = routePath.join('/').replace(/\.\./g, '');
  const filePath = path.join(process.cwd(), 'data', 'study-material', safePath);

  // Only allow serving PDF files for security
  if (!filePath.toLowerCase().endsWith('.pdf')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    if (!fs.existsSync(filePath)) {
      // Check for pdf-{filename}.txt mapping
      const dirName = path.dirname(filePath);
      const fileName = path.basename(filePath);
      const txtFileName = `pdf-${fileName.replace('.pdf', '.txt')}`;
      const txtFilePath = path.join(dirName, txtFileName);

      if (fs.existsSync(txtFilePath)) {
        const gDriveUrl = fs.readFileSync(txtFilePath, 'utf-8').trim();
        return NextResponse.redirect(gDriveUrl);
      }

      return new NextResponse('Not Found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const file = fs.readFileSync(filePath);
    const isDownload = request.nextUrl.searchParams.get('download') === '1';

    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': stat.size.toString(),
        // Inline disposition tells the browser to display it rather than downloading
        'Content-Disposition': isDownload ? 'attachment' : 'inline',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    console.error('Error serving Study Material PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
