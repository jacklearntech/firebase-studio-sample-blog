---
title: "Exploring Next.js Features"
date: 2024-07-26T11:30:00.000Z
slug: second-post
excerpt: "A brief look at Server Components, Server Actions, and file-based routing."
---

## Diving into Next.js

This blog utilizes several powerful Next.js features, enhancing both developer experience and application performance:

1.  **App Router:** Enables optimized routing, nested layouts, and improved data fetching patterns compared to the older Pages Router. Static and dynamic routes are easily managed. Our post routes (`/posts/[slug]`) are a prime example of dynamic routing.

2.  **Server Components:** Many components in this app (like the homepage and post detail pages) are Server Components by default. This means they fetch data and render on the server, sending minimal JavaScript to the client, which speeds up initial page loads.

3.  **Server Actions:** Used in the admin section (`/admin/new-post`) for form submissions. They allow direct function calls from client components to server-side code without needing to manually create API endpoints, simplifying data mutations.

4.  **File-Based Content:** As demonstrated by this very post, content can be managed directly using Markdown files within the project structure (`src/app/posts`). Libraries like `gray-matter` parse the frontmatter, and `react-markdown` renders the content.

### Example Server Action Snippet

```typescript
// src/actions/post.actions.ts (Simplified)
'use server';

import { z } from 'zod';
// ... other imports

const postFormSchema = z.object({ /* ... schema ... */ });

export async function createPost(values: z.infer<typeof postFormSchema>) {
  // 1. Validate input
  // 2. Check authentication
  // 3. Get GitHub token
  // 4. Format content (Markdown + Frontmatter)
  // 5. Commit to GitHub using a service
  // 6. Revalidate cache if needed
  console.log('Creating post:', values.title);
  // ... actual implementation uses GitHub API
  return { success: true };
}
```

This combination of features makes Next.js a robust framework for building modern web applications.
