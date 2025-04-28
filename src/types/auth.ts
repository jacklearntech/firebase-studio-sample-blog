/**
 * Represents the authenticated user's information, typically from GitHub.
 */
export interface User {
  id: string; // GitHub user ID (as string for safety with large numbers)
  login: string; // GitHub username
  name?: string | null; // GitHub user's name
  avatar_url?: string | null; // URL to the user's avatar image
  // Add other relevant fields if needed, e.g., email
}
