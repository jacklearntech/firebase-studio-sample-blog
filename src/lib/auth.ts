import { cookies } from 'next/headers';
import { type User } from '@/types/auth'; // Define User type later
import { decrypt, encrypt } from './session'; // Session encryption utilities

const SESSION_COOKIE_NAME = 'app_session';
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Retrieves the current session from the request cookies.
 * Decrypts the session cookie if it exists.
 */
export async function getSession(): Promise<{ user: User; accessToken: string } | null> {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decryptedSession = await decrypt<{ user: User; accessToken: string; expires: number }>(sessionCookie);

    // Check if session has expired
    if (decryptedSession && Date.now() < decryptedSession.expires) {
      return { user: decryptedSession.user, accessToken: decryptedSession.accessToken };
    } else {
      // Session expired or invalid, clear the cookie
      await deleteSession();
      return null;
    }
  } catch (error) {
    console.error("Failed to decrypt session:", error);
    // Consider clearing the potentially corrupted cookie
    await deleteSession();
    return null;
  }
}

/**
 * Creates a new session, encrypts it, and sets it as a cookie.
 */
export async function createSession(user: User, accessToken: string): Promise<void> {
  const expires = Date.now() + SESSION_TTL * 1000; // Expiry time in milliseconds
  const sessionData = { user, accessToken, expires };

  const encryptedSession = await encrypt(sessionData);

  cookies().set(SESSION_COOKIE_NAME, encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL,
    path: '/',
    sameSite: 'lax', // Recommended for most cases
  });
}

/**
 * Deletes the current session cookie.
 */
export async function deleteSession(): Promise<void> {
  cookies().set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1, // Expire immediately
    path: '/',
    sameSite: 'lax',
  });
}

/**
 * Retrieves the GitHub access token from the current session.
 */
export async function getGithubToken(): Promise<string | null> {
    const session = await getSession();
    return session?.accessToken ?? null;
}
