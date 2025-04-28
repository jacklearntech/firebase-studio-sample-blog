import type { User } from '@/types/auth';

/**
 * Represents information about a GitHub repository.
 */
export interface GitHubRepo {
  /**
   * The owner of the repository.
   */
  owner: string;
  /**
   * The name of the repository.
   */
  repo: string;
}

const GITHUB_API_BASE = 'https://api.github.com';

interface GithubUserResponse {
  id: number;
  login: string;
  name?: string | null;
  avatar_url?: string | null;
  // Add other fields as needed
}

/**
 * Authenticates with Github using OAuth.
 * Exchanges the provided code for an access token.
 *
 * @param code The authentication code obtained from Github OAuth.
 * @returns A promise that resolves to the Github access token or null if failed.
 */
export async function authenticateGithub(code: string): Promise<string | null> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("GitHub client ID or secret not configured.");
    return null;
  }

  const tokenUrl = 'https://github.com/login/oauth/access_token';
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json', // Request JSON response
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      // redirect_uri: process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/github/callback', // Optional: If required by GitHub app settings
    }),
  });

  if (!response.ok) {
    console.error(`GitHub token exchange failed: ${response.status} ${response.statusText}`);
     try {
       const errorBody = await response.json();
       console.error("Error details:", errorBody);
     } catch (e) {
       // Ignore if response body is not JSON
     }
    return null;
  }

  const data = await response.json();

  if (data.error) {
      console.error(`GitHub token exchange error: ${data.error} - ${data.error_description}`);
      return null;
  }


  return data.access_token ?? null;
}

/**
 * Retrieves user information from Github using an access token.
 *
 * @param githubToken The Github access token.
 * @returns A promise that resolves to the Github user information (mapped to User type) or null if failed.
 */
export async function getGithubUser(githubToken: string): Promise<User | null> {
  const userUrl = `${GITHUB_API_BASE}/user`;
  const response = await fetch(userUrl, {
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch GitHub user: ${response.status} ${response.statusText}`);
    return null;
  }

  const userData: GithubUserResponse = await response.json();

  // Map to our User type
  return {
      id: userData.id,
      login: userData.login,
      name: userData.name,
      avatar_url: userData.avatar_url,
  };
}

/**
 * Helper function to get the SHA of a file or blob from GitHub.
 * Returns null if the file doesn't exist.
 */
async function getFileSha(
    repoInfo: GitHubRepo,
    filePath: string,
    githubToken: string
): Promise<string | null> {
    const url = `${GITHUB_API_BASE}/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${filePath}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (response.status === 404) {
            return null; // File not found
        }

        if (!response.ok) {
            console.error(`Failed to get file SHA (${response.status}): ${await response.text()}`);
            return null;
        }

        const data = await response.json();
        return data.sha;
    } catch (error) {
        console.error('Error fetching file SHA:', error);
        return null;
    }
}


/**
 * Asynchronously commits changes to a file in a GitHub repository.
 * Handles both creating new files and updating existing ones.
 *
 * @param repoInfo Information about the GitHub repository.
 * @param filePath The path to the file in the repository.
 * @param content The content to be committed to the file (plain text).
 * @param commitMessage The commit message.
 * @param githubToken Github authentication token.
 * @returns A promise that resolves to true if the commit was successful, false otherwise.
 */
export async function commitToGithub(
  repoInfo: GitHubRepo,
  filePath: string,
  content: string,
  commitMessage: string,
  githubToken: string
): Promise<boolean> {
  const url = `${GITHUB_API_BASE}/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${filePath}`;

  // Convert content to base64 as required by the GitHub API
  const contentBase64 = Buffer.from(content).toString('base64');

  // Check if the file already exists to get its SHA (required for updates)
   const currentSha = await getFileSha(repoInfo, filePath, githubToken);

   const payload: { message: string; content: string; sha?: string } = {
       message: commitMessage,
       content: contentBase64,
   };

    // If the file exists, include its SHA to update it
    if (currentSha) {
        payload.sha = currentSha;
    }


  try {
    const response = await fetch(url, {
      method: 'PUT', // PUT creates or replaces a file
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`GitHub commit failed (${response.status}): ${await response.text()}`);
      // Log more details for debugging
      console.error(`URL: ${url}`);
      // console.error(`Payload: ${JSON.stringify(payload)}`); // Be careful logging sensitive info like content/token
      return false;
    }

     console.log(`Successfully committed '${filePath}' to ${repoInfo.owner}/${repoInfo.repo}`);
    return true;
  } catch (error) {
    console.error("Error committing to GitHub:", error);
    return false;
  }
}
