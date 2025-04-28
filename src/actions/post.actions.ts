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
    return { success: false, error: validationResult.error.flatten().fieldErrors.toString() };
  }

  const validatedData = validationResult.data;

  // 2. Check user authentication
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: 'User not authenticated.' };
  }

  // 3. Get GitHub token
  const githubToken = await getGithubToken();
   if (!githubToken) {
     return { success: false, error: 'GitHub token not found.' };
   }


  // 4. Prepare GitHub commit details
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const postsPath = process.env.GITHUB_POSTS_PATH || 'posts'; // Default to 'posts' folder

  if (!repoOwner || !repoName) {
     return { success: false, error: 'GitHub repository configuration missing in environment variables.' };
  }

  const repoInfo: GitHubRepo = { owner: repoOwner, repo: repoName };
  const filePath = `${postsPath}/${validatedData.slug}.md`;
  const fileContent = formatMarkdownWithFrontmatter(validatedData);
  const commitMessage = `feat: add post '${validatedData.title}'`;

  // 5. Commit to GitHub using the service
  try {
    const commitSuccess = await commitToGithub(
      repoInfo,
      filePath,
      fileContent,
      commitMessage,
      githubToken
    );

    if (!commitSuccess) {
        // The service function should ideally provide more specific errors
      return { success: false, error: 'Failed to commit changes to GitHub.' };
    }

    // 6. Revalidate relevant paths (optional but good practice)
    revalidatePath('/'); // Revalidate homepage
    revalidatePath('/posts'); // Revalidate a potential posts list page
    revalidatePath(`/posts/${validatedData.slug}`); // Revalidate the new post page

    return { success: true };
  } catch (error) {
    console.error('Error committing to GitHub:', error);
    return { success: false, error: 'An unexpected error occurred while committing to GitHub.' };
  }
}
