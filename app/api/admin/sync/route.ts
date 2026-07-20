import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

    if (!deployHookUrl) {
      return NextResponse.json(
        { error: 'Deploy Hook URL is not configured. Please add VERCEL_DEPLOY_HOOK_URL to your environment variables.' },
        { status: 500 }
      );
    }

    // Trigger the Vercel Deploy Hook
    const response = await fetch(deployHookUrl, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to trigger deployment: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error triggering Vercel Deploy Hook:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while trying to trigger the sync.' },
      { status: 500 }
    );
  }
}
