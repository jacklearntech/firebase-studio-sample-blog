import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { authenticateGithub, getGithubUser } from '@/services/github'; // Use the provided service
import { createSession } from '@/lib/auth'; // Use the session creation utility
import { type User } from '@/types/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error(`GitHub OAuth Error: ${error} - ${errorDescription}`);
    // Redirect to homepage with a generic error message
    return redirect('/?error=github_auth_error');
  }

  if (!code) {
    console.error("Authorization code not found in callback.");
    // Redirect to an error page or login page
    return redirect('/?error=github_auth_failed_no_code');
  }

  try {
    // 1. Exchange code for access token
    console.log("Exchanging GitHub code for access token...");
    const accessToken = await authenticateGithub(code); // Calls the service function

    if (!accessToken) {
       // Specific error logged within authenticateGithub service
       throw new Error("Failed to obtain GitHub access token.");
    }
    console.log("Successfully obtained GitHub access token.");


    // 2. Fetch user information using the access token
    console.log("Fetching GitHub user data...");
    const githubUserData = await getGithubUser(accessToken); // Calls the service function

    if (!githubUserData || !githubUserData.id || !githubUserData.login) {
        // Specific error logged within getGithubUser service
        throw new Error("Failed to fetch user data from GitHub.");
    }
    console.log(`Successfully fetched GitHub user data for: ${githubUserData.login}`);


    // Map GitHub data to our User type
    const user: User = {
        id: githubUserData.id.toString(), // Ensure ID is string
        login: githubUserData.login,
        name: githubUserData.name,
        avatar_url: githubUserData.avatar_url,
    };


    // 3. Create a session for the user
    console.log(`Creating session for user: ${user.login}`);
    await createSession(user, accessToken);
    console.log(`Session created successfully for user: ${user.login}`);


    // 4. Redirect to the admin dashboard or homepage after successful login
    console.log("Redirecting to /admin...");
    return redirect('/admin');

  } catch (error) {
    console.error("GitHub callback processing error:", error instanceof Error ? error.message : error);
    // Redirect to an error page or login page with an error indicator
    return redirect('/?error=github_callback_failed');
  }
}
