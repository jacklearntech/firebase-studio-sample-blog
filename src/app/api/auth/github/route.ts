import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function GET() {
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  if (!githubClientId) {
    console.error("GITHUB_CLIENT_ID is not set.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/github/callback`;

  // Define the required scopes. 'repo' is needed to write to repositories.
  // 'user:read' or 'read:user' to read user profile data.
  const scopes = ['repo', 'read:user']; // Adjust scopes as needed

  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', githubClientId);
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('scope', scopes.join(' '));
  // Optional: Add state parameter for CSRF protection

  redirect(authUrl.toString());
}
