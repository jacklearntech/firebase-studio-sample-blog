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
  id: number; // Keep as number from API response
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
  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/github/callback`; // Ensure consistency

  if (!clientId || !clientSecret) {
    console.error("GitHub client ID or secret not configured in environment variables.");
    return null;
  }
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
     console.error("NEXT_PUBLIC_BASE_URL not configured in environment variables.");
     return null;
   }


  const tokenUrl = 'https://github.com/login/oauth/access_token';
  console.log(`[authenticateGithub] Exchanging code at URL: ${tokenUrl}`);
  console.log(`[authenticateGithub] Using Client ID: ${clientId}`); // Don't log secret
  console.log(`[authenticateGithub] Using Callback URL: ${callbackUrl}`);


  try {
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
          redirect_uri: callbackUrl, // Explicitly send redirect_uri if required by GitHub App settings
        }),
      });

      const data = await response.json(); // Attempt to parse JSON regardless of status

      if (!response.ok) {
        console.error(`[authenticateGithub] GitHub token exchange failed: ${response.status} ${response.statusText}`);
        console.error("[authenticateGithub] Error details:", data); // Log the parsed error body
        return null;
      }


      if (data.error) {
          console.error(`[authenticateGithub] GitHub token exchange error response: ${data.error} - ${data.error_description}`);
          return null;
      }

      if (!data.access_token) {
         console.error('[authenticateGithub] GitHub token exchange response did not contain access_token:', data);
         return null;
      }

      console.log("[authenticateGithub] Successfully obtained GitHub access token.");
      return data.access_token;

  } catch (error) {
     console.error("[authenticateGithub] Network or other error during GitHub token exchange:", error);
     return null;
  }
}

/**
 * Retrieves user information from Github using an access token.
 *
 * @param githubToken The Github access token.
 * @returns A promise that resolves to the Github user information (mapped to User type) or null if failed.
 */
export async function getGithubUser(githubToken: string): Promise<User | null> {
  const userUrl = `${GITHUB_API_BASE}/user`;
  console.log(`[getGithubUser] Fetching user data from: ${userUrl}`);
  try {
      const response = await fetch(userUrl, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        console.error(`[getGithubUser] Failed to fetch GitHub user: ${response.status} ${response.statusText}`);
        try {
          const errorBody = await response.json();
          console.error("[getGithubUser] Error details:", errorBody);
        } catch (e) {
          console.error("[getGithubUser] Could not parse error response body.");
        }
        return null;
      }

      const userData: GithubUserResponse = await response.json();

      if (!userData || typeof userData.id !== 'number' || typeof userData.login !== 'string') {
         console.error("[getGithubUser] Received incomplete or invalid user data from GitHub:", userData);
         return null;
      }

      // Map to our User type, ensuring ID is string
       const mappedUser: User = {
           id: userData.id.toString(),
           login: userData.login,
           name: userData.name,
           avatar_url: userData.avatar_url,
       };
       console.log(`[getGithubUser] Successfully fetched and mapped user data for: ${mappedUser.login}`);
      return mappedUser;
  } catch (error) {
     console.error("[getGithubUser] Network or other error during GitHub user fetch:", error);
     return null;
  }
}

/**
 * Helper function to get the SHA of a file or blob from GitHub.
 * Returns null if the file doesn't exist or an error occurs.
 */
async function getFileSha(
    repoInfo: GitHubRepo,
    filePath: string,
    githubToken: string
): Promise<string | null> {
    const url = `${GITHUB_API_BASE}/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${filePath}`;
    console.log(`[getFileSha] Checking for existing file SHA at: ${url}`);
    let response;
    try {
        response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Cache-Control': 'no-cache', // Avoid caching stale SHA
            },
        });

        if (response.status === 404) {
            console.log(`[getFileSha] File not found at path: ${filePath}`);
            return null; // File does not exist
        }

        const responseBody = await response.text(); // Read body as text first

        if (!response.ok) {
            console.error(`[getFileSha] Failed to get file SHA (${response.status} ${response.statusText}) for path: ${filePath}`);
            console.error("[getFileSha] Response body:", responseBody); // Log raw response body
            return null; // Treat as error, cannot proceed with update without SHA
        }

        // Try parsing as JSON only if response is OK
        try {
             const data = JSON.parse(responseBody);
             if (typeof data.sha !== 'string') {
                 console.error(`[getFileSha] Invalid SHA received for file ${filePath}. Response data:`, data);
                 return null;
             }
             console.log(`[getFileSha] Found existing file SHA: ${data.sha} for path: ${filePath}`);
             return data.sha;
         } catch (parseError) {
              console.error(`[getFileSha] Failed to parse JSON response for file ${filePath}:`, parseError);
              console.error("[getFileSha] Raw response body:", responseBody);
              return null;
         }

    } catch (error) {
        console.error(`[getFileSha] Network or other error fetching file SHA for ${filePath}:`, error);
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
  console.log(`[commitToGithub] Attempting to commit file to: ${url}`);

  // Convert content to base64 as required by the GitHub API
  const contentBase64 = Buffer.from(content, 'utf-8').toString('base64');

  // Check if the file already exists to get its SHA (required for updates)
   const currentSha = await getFileSha(repoInfo, filePath, githubToken);
   // If getFileSha errored (returned null despite not being a 404), we might still proceed,
   // but GitHub will likely reject the commit if the file exists without a SHA.
   // A more robust implementation might explicitly fail here if currentSha is null but it wasn't a 404.

   const payload: { message: string; content: string; sha?: string } = {
       message: commitMessage,
       content: contentBase64,
   };

    // If the file exists (SHA was found), include its SHA to update it
    if (currentSha) {
        payload.sha = currentSha;
        console.log(`[commitToGithub] Preparing to update existing file with SHA: ${currentSha}`);
    } else {
       console.log("[commitToGithub] Preparing to create new file.");
    }

  let response;
  try {
    console.log(`[commitToGithub] Sending PUT request to ${url} with message: "${commitMessage}"`);
    response = await fetch(url, {
      method: 'PUT', // PUT creates or replaces a file
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseBodyText = await response.text(); // Always read the response body as text

    if (!response.ok) {
      console.error(`[commitToGithub] GitHub commit failed (${response.status} ${response.statusText})`);
      console.error("[commitToGithub] URL:", url);
      // console.error(`Payload keys: ${Object.keys(payload).join(', ')}`); // Avoid logging full payload content
      console.error("[commitToGithub] Response body:", responseBodyText); // Log the raw text response
      return false;
    }

    // Try to parse as JSON for successful responses
    try {
        const responseBodyJson = JSON.parse(responseBodyText);
        console.log(`[commitToGithub] Successfully committed '${filePath}' to ${repoInfo.owner}/${repoInfo.repo}. Commit SHA: ${responseBodyJson?.commit?.sha}`);
        return true;
    } catch (parseError) {
        console.warn(`[commitToGithub] Commit seemed successful (status ${response.status}) but failed to parse JSON response. Raw response:`, responseBodyText);
        // Still return true if status code was OK, even if response parsing failed slightly.
        return true;
    }

  } catch (error) {
    console.error("[commitToGithub] Network or other error during GitHub commit:", error);
    if (response) {
        // If fetch succeeded but error occurred later, log status
        console.error(`[commitToGithub] Response status at time of error: ${response.status} ${response.statusText}`);
    }
    return false;
  }
}
