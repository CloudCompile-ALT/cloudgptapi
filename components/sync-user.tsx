import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import { syncUser } from '@/lib/admin-actions';

export async function SyncUser() {
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);

  if (isAuthenticated && claims && claims.sub) {
    // Logto claims usually have email if the 'email' scope is requested
    // If not, we might need to fetch it from the Management API or userinfo endpoint
    const email = (claims.email as string) || '';
    const username = (claims.username as string) || '';
    const name = (claims.name as string) || '';
    const avatar = (claims.picture as string) || '';
    
    if (email) {
      try {
        await syncUser(claims.sub, email, username, name, avatar);
      } catch (err) {
        console.error('Failed to sync user profile:', err);
      }
    }
  }

  return null;
}
