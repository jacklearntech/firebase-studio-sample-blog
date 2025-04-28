'use server';

import { z } from 'zod';
import { getSession, getGithubToken } from '@/lib/auth';
import { commitToGithub, type GitHubRepo } from '@/services/github'; // Import the service
import { revalidatePath } from 'next/cache'; // To update cached pages

const postFormSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  content: z.string().min(1),
});

type PostFormValues = z.infer<typeof postFormSchema>;

// Function to format Markdown content with frontmatter
function formatMarkdownWithFrontmatter(data: PostFormValues): string {
    const frontmatter = `---
title: "${data.title.replace(/"/g, '\\"')}"
date: ${new Date().toISOString()}
slug: ${data.slug}
---

`;
    return frontmatter + data.content;
}

export async function createPost(
    values: PostFormValues
): Promise<{ success: boolean; error?: string }> {
  // 1. Validate input using Zod (already partially done by form)
  const validationResult = postFormSchema.safeParse(values);
  if (!validationResult.success) {
     const errorMsg = "Input validation failed: " + validationResult.error.flatten().fieldErrors.toString();
     console.error(`[createPost] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const validatedData = validationResult.data;
  console.log(`[createPost] Input validated for slug: ${validatedData.slug}`);

  // 2. Check user authentication
  const session = await getSession();
  if (!session?.user) {
     console.error("[createPost] User not authenticated.");
    return { success: false, error: 'User not authenticated.' };
  }
  console.log(`[createPost] User authenticated: ${session.user.login}`);


  // 3. Get GitHub token
  const githubToken = await getGithubToken();
   if (!githubToken) {
     console.error("[createPost] GitHub token not found in session.");
     return { success: false, error: 'GitHub token not found.' };
   }
   console.log("[createPost] GitHub token retrieved.");


  // 4. Prepare GitHub commit details
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const postsPath = process.env.GITHUB_POSTS_PATH || 'posts'; // Default to 'posts' folder

  if (!repoOwner || !repoName) {
     console.error("[createPost] GitHub repository configuration missing in environment variables (GITHUB_REPO_OWNER or GITHUB_REPO_NAME).");
     return { success: false, error: 'GitHub repository configuration missing in environment variables.' };
  }
  console.log(`[createPost] Repo configured: ${repoOwner}/${repoName}, Path: ${postsPath}`);


  const repoInfo: GitHubRepo = { owner: repoOwner, repo: repoName };
  const filePath = `${postsPath}/${validatedData.slug}.md`;
  const fileContent = formatMarkdownWithFrontmatter(validatedData);
  const commitMessage = `feat: add post '${validatedData.title}'`;
  console.log(`[createPost] Prepared commit details: Path=${filePath}, Message=${commitMessage}`);


  // 5. Commit to GitHub using the service
  try {
    console.log(`[createPost] Calling commitToGithub for path: ${filePath}`);
    const commitSuccess = await commitToGithub(
      repoInfo,
      filePath,
      fileContent,
      commitMessage,
      githubToken
    );

    if (!commitSuccess) {
        // commitToGithub function now handles its own internal logging
        console.error(`[createPost] commitToGithub returned false for path: ${filePath}.`);
        console.error(`[createPost] Failed commit details: repo=${repoInfo.owner}/${repoInfo.repo}, path=${filePath}, message=${commitMessage}`);
        // Provide a user-friendly error, the detailed error is logged in the service
        return { success: false, error: 'Failed to commit changes to GitHub. Check server logs for details.' };
    }

    console.log(`[createPost] commitToGithub successful for path: ${filePath}`);

    // 6. Revalidate relevant paths (optional but good practice)
    console.log(`[createPost] Revalidating paths: /, /posts, /posts/${validatedData.slug}`);
    revalidatePath('/'); // Revalidate homepage
    revalidatePath('/posts'); // Revalidate a potential posts list page
    revalidatePath(`/posts/${validatedData.slug}`); // Revalidate the new post page

    return { success: true };
  } catch (error) {
    // This catch block might catch errors thrown *before* or *after* the commitToGithub call itself,
    // or if commitToGithub itself throws an unexpected error (though it's designed to return boolean).
    console.error('[createPost] Unexpected error during GitHub commit process:', error);
    return { success: false, error: 'An unexpected error occurred while attempting to save the post.' };
  }
}
