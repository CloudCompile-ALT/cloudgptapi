import { LogtoNextConfig } from '@logto/next';

const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_APP_URL || 
           (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  // Remove any trailing slashes to avoid double-slashes in redirect URIs
  // and ensure cookie path consistency
  return url.replace(/\/$/, '');
};

export const logtoConfig: LogtoNextConfig = {
  endpoint: process.env.LOGTO_ENDPOINT || 'https://ethical-incident-barbara-proceedings.trycloudflare.com',
  appId: process.env.LOGTO_APP_ID || 'qcma8qo4f4req96mhc5kl',
  appSecret: process.env.LOGTO_APP_SECRET || 'A3JW4aZgqcSc8vUA7uP9IdATpAuN6q4I',
  baseUrl: getBaseUrl(),
  cookieSecret: process.env.LOGTO_COOKIE_SECRET || '7f9e8d7c6b5a493827160a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v',
  // In production (Vercel/Cloudflare), always use secure cookies.
  // If testing locally via http://localhost:3000, cookieSecure will be false.
  cookieSecure: process.env.NODE_ENV === 'production' && !getBaseUrl().includes('localhost'),
  scopes: ['email', 'profile'],
};
