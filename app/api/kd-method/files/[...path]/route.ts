import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: routePath } = await params;
  
  // Ensure the path is joined safely without directory traversal
  const safePath = routePath.join('/').replace(/\.\./g, '');
  const filePath = path.join(process.cwd(), 'data', 'kd-method', safePath);

  // Only allow serving PDF files for security
  if (!filePath.toLowerCase().endsWith('.pdf')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    if (!fs.existsSync(filePath)) {
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
    console.error('Error serving KD Method PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
