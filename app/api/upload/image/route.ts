// app/api/upload/image/route.ts
import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';
import { requireAdminFromCookies } from '@/lib/adminAuth';
import rateLimit from '@/lib/rateLimiter';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  // Verify Clerk auth via cookies (App Router)
  const auth = await requireAdminFromCookies();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status || 401 });

  try {
    const { data, folder } = await req.json(); // data = dataURL e.g. data:image/png;base64,...
    if (!data) return NextResponse.json({ error: 'no data' }, { status: 400 });

    // Rate limit: 3 uploads per minute per user
    const rlKey = `upload:${auth.userId}`;
    const rl = rateLimit.inMemory(rlKey, 3, 60 * 1000, 1);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded (3 per minute)' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const uploadRes = await cloudinary.v2.uploader.upload(data, {
      folder: folder || 'notty',
      resource_type: 'image',
      overwrite: false,
    });

    return NextResponse.json({ url: uploadRes.secure_url, raw: uploadRes }, { status: 200 });
  } catch (err: any) {
    console.error('Cloudinary upload error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

