'use server';

import { getSession, deleteSession } from '@/lib/auth';
import { type User } from '@/types/auth';
import { redirect } from 'next/navigation';

/**
 * Server Action to get the currently authenticated user from the session.
 * Returns the user object or null if not authenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Server Action to log the user out by deleting the session cookie.
 */
export async function logout(): Promise<void> {
  await deleteSession();
  // Optionally redirect after logout, but often handled client-side based on context update
  // redirect('/');
}
