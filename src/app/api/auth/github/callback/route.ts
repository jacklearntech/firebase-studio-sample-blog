import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { authenticateGithub, getGithubUser } from '@/services/github'; // Use the provided service
import { createSession } from '@/lib/auth'; // Use the session creation utility
import { type User } from '@/types/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  // Optional: Verify state parameter here if used

  if (!code) {
    console.error("Authorization code not found in callback.");
    // Redirect to an error page or login page
    return redirect('/?error=github_auth_failed');
  }

  try {
    // 1. Exchange code for access token
    const accessToken = await authenticateGithub(code); // Calls the service function

    if (!accessToken) {
       throw new Error("Failed to obtain GitHub access token.");
    }

    // 2. Fetch user information using the access token
    const githubUserData = await getGithubUser(accessToken); // Calls the service function

    if (!githubUserData || !githubUserData.id || !githubUserData.login) {
        throw new Error("Failed to fetch user data from GitHub.");
    }

    // Map GitHub data to our User type
    const user: User = {
        id: githubUserData.id,
        login: githubUserData.login,
        name: githubUserData.name,
        avatar_url: githubUserData.avatar_url,
    };


    // 3. Create a session for the user
    await createSession(user, accessToken);

    // 4. Redirect to the admin dashboard or homepage after successful login
    return redirect('/admin');

  } catch (error) {
    console.error("GitHub callback error:", error);
    // Redirect to an error page or login page with an error indicator
    return redirect('/?error=github_callback_failed');
  }
}
