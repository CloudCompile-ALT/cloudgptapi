import { auth } from '@clerk/nextjs/server';

/**
 * Get the current user ID from Clerk authentication
 * @returns The user ID if authenticated, null otherwise
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Require authentication and return the user ID
 * @throws Error with descriptive message if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Authentication required: No valid user session found');
  }
  return userId;
}
