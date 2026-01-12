import { NextRequest } from 'next/server';
import LogtoClient from '@logto/next/edge';
import { logtoConfig } from '@/lib/logto';

export const runtime = 'edge';

const client = new LogtoClient(logtoConfig);

export async function GET(request: NextRequest, { params }: { params: { action: string } }) {
  const { action } = await params;

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
}
