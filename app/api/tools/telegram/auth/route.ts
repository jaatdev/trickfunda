import { NextRequest, NextResponse } from 'next/server';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { getSessionData, saveSessionData, clearSessionData } from '@/utils/telegram-session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, apiId, apiHash, phone, phoneCodeHash, phoneCode, password, tempSession } = body;
    
    if (action === 'logout') {
      clearSessionData();
      return NextResponse.json({ success: true });
    }

    if (action === 'status') {
      const session = getSessionData();
      if (session?.stringSession) {
        try {
          const client = new TelegramClient(new StringSession(session.stringSession), Number(session.apiId), session.apiHash, { connectionRetries: 1 });
          await client.connect();
          const me = await client.getMe() as any;
          return NextResponse.json({ authenticated: true, user: me ? (me.username || me.firstName) : 'Unknown' });
        } catch (e) {
          return NextResponse.json({ authenticated: false });
        }
      }
      return NextResponse.json({ authenticated: false });
    }

    if (!apiId || !apiHash) {
      return NextResponse.json({ error: 'API ID and API Hash are required' }, { status: 400 });
    }

    const currentSessionString = tempSession || '';
    const client = new TelegramClient(new StringSession(currentSessionString), Number(apiId), apiHash, {
      connectionRetries: 5,
    });
    
    await client.connect();
    const apiCredentials = { apiId: Number(apiId), apiHash };

    if (action === 'sendCode') {
      if (!phone) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
      const result = await client.sendCode(apiCredentials, phone);
      return NextResponse.json({ 
        phoneCodeHash: result.phoneCodeHash,
        tempSession: (client.session.save() as unknown as string)
      });
    }

    if (action === 'signIn') {
      if (!phone || !phoneCodeHash || !phoneCode) {
        return NextResponse.json({ error: 'Missing sign in parameters' }, { status: 400 });
      }
      try {
        await client.invoke(
          new Api.auth.SignIn({
            phoneNumber: phone,
            phoneCodeHash: phoneCodeHash,
            phoneCode: phoneCode,
          })
        );
        const finalSession = (client.session.save() as unknown as string);
        saveSessionData({ apiId: apiId.toString(), apiHash, stringSession: finalSession });
        return NextResponse.json({ success: true });
      } catch (e: any) {
        if (e.errorMessage === 'SESSION_PASSWORD_NEEDED') {
           return NextResponse.json({ requiresPassword: true, tempSession: (client.session.save() as unknown as string) });
        }
        throw e;
      }
    }

    if (action === 'checkPassword') {
       if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 });
       try {
         await client.signInWithPassword(apiCredentials, {
           password: password,
           onError: (err: Error) => { throw err; }
         });
         const finalSession = (client.session.save() as unknown as string);
         saveSessionData({ apiId: apiId.toString(), apiHash, stringSession: finalSession });
         return NextResponse.json({ success: true });
       } catch (e: any) {
         throw e;
       }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Telegram Auth Error:', error);
    return NextResponse.json({ error: error.errorMessage || error.message }, { status: 500 });
  }
}
