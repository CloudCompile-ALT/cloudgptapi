import { NextRequest } from 'next/server';
import LogtoClient from '@logto/next/edge';
import { logtoConfig } from '@/lib/logto';

export async function GET(request: NextRequest, { params }: { params: { action: string } }) {
  const { action } = await params;
  
  // Debug logging
  console.log(`[Logto API] Action: ${action}`);
  console.log(`[Logto API] Request URL: ${request.url}`);
  console.log(`[Logto API] Base URL Config: ${logtoConfig.baseUrl}`);
  console.log(`[Logto API] Node Env: ${process.env.NODE_ENV}`);
  console.log(`[Logto API] Cookie Secure: ${logtoConfig.cookieSecure}`);
  
  // Inspect cookies
  const cookies = request.cookies.getAll();
  console.log(`[Logto API] Cookies present: ${cookies.length}`);
  cookies.forEach(c => {
    console.log(`[Logto API] Cookie name: ${c.name}`);
  });

  const client = new LogtoClient(logtoConfig);

  try {
    switch (action) {
      case 'sign-in':
        return client.handleSignIn()(request);
      case 'sign-out':
        return client.handleSignOut()(request);
      case 'sign-in-callback':
        return client.handleSignInCallback()(request);
      case 'user':
        return client.handleUser()(request);
      default:
        return new Response(null, { status: 404 });
    }
  } catch (error: any) {
    console.error(`[Logto ${action} Error]`, error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
