---
title: "My First Actual Post"
date: 2024-07-25T10:00:00.000Z
slug: first-post
excerpt: "Learn how this blog works and how posts are created from local files."
---

# Welcome to My First Post!

This post demonstrates how content is fetched from a Markdown file stored directly within the project under `src/app/posts`.

- Posts are written in standard **Markdown**.
- Frontmatter at the top includes metadata like `title`, `date`, `slug`, and `excerpt`.
- The homepage automatically lists posts found in this directory.
- Clicking "Read More" navigates to the full post page.

This approach allows for easy content management directly within the codebase, especially during development or for simpler blogs. For production, syncing with a Git repository (as implemented in the admin section) provides version control and collaboration benefits.

```javascript
// Example code block
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('World');
```

Enjoy reading!
