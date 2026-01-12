import { auth, currentUser } from '@clerk/nextjs/server';
import { syncUser } from '@/lib/admin-actions';

export async function SyncUser() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    const user = await currentUser();
    
    if (user) {
      const email = user.emailAddresses[0]?.emailAddress || '';
      const username = user.username || '';
      const name = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || '';
      const avatar = user.imageUrl || '';
      
      if (email) {
        try {
          await syncUser(userId, email, username, name, avatar);
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      }
    }
  } catch (err) {
    // During build/prerendering, this is expected to fail
    // Silently ignore - authentication will be handled at runtime
  }

  return null;
}
