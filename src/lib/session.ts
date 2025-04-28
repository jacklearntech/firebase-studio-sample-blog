import 'server-only'; // Ensure this runs only on the server

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.AUTH_SECRET;
if (!secretKey) {
    throw new Error("AUTH_SECRET environment variable is not set.");
}
const key = new TextEncoder().encode(secretKey);

/**
 * Encrypts a payload into a JWT token.
 * @param payload The object to encrypt.
 * @returns A promise resolving to the JWT string.
 */
export async function encrypt(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Match session TTL or configure as needed
    .sign(key);
}

/**
 * Decrypts a JWT token back into its original payload.
 * @param input The JWT string to decrypt.
 * @returns A promise resolving to the decrypted payload, or null if decryption fails.
 */
export async function decrypt<T>(input: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify<T>(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // Handle specific errors like JWTExpired, JWTClaimValidationFailed, etc. if needed
    console.error('Failed to verify session:', error instanceof Error ? error.message : error);
    return null;
  }
}
