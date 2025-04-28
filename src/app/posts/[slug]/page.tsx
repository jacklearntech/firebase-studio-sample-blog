import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Placeholder function to fetch post data by slug
// In a real app, this would read the markdown file from the local cache or potentially fetch from GitHub if cache is stale.
async function getPostData(slug: string) {
  // Simulating fetching data
  console.log(`Fetching post data for slug: ${slug}`);
  // Replace with actual file reading logic later
  if (slug === 'first-post') {
    return {
      title: 'My First Blog Post',
      content: `
# Welcome to my first post!

This is the content of the first blog post. It supports **Markdown**.

*   List item 1
*   List item 2

\`\`\`javascript
console.log('Hello, world!');
\`\`\`
      `,
    };
  } else if (slug === 'second-post') {
     return {
       title: 'Another Interesting Topic',
       content: `
## Exploring the Second Topic

More details about the second topic go here.
      `,
     };
  }
  return null; // Post not found
}

// Basic Markdown to HTML conversion (replace with a proper library like 'marked' or 'react-markdown' later)
function renderMarkdown(markdown: string): string {
   // VERY basic conversion for demonstration
   return markdown
     .replace(/^# (.*$)/gim, '<h1>$1</h1>')
     .replace(/^## (.*$)/gim, '<h2>$1</h2>')
     .replace(/^### (.*$)/gim, '<h3>$1</h3>')
     .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
     .replace(/\*(.*)\*/gim, '<em>$1</em>')
     .replace(/`{3}([^`]+)`{3}/gim, '<pre><code>$1</code></pre>') // Basic code block
     .replace(/`([^`]+)`/gim, '<code>$1</code>') // Inline code
     .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>') // Basic unordered list (needs improvement for multi-line)
     .replace(/\n/g, '<br />'); // Replace newlines with <br> (simple approach)

}


export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostData(params.slug);

  if (!post) {
    notFound();
  }

  const htmlContent = renderMarkdown(post.content);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <article className="prose prose-lg dark:prose-invert max-w-3xl mx-auto">
           {/* Using prose for basic markdown styling */}
          <h1>{post.title}</h1>
          {/* Render the HTML content */}
           {/* WARNING: Only use dangerouslySetInnerHTML if you trust the source or sanitize the HTML */}
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </article>
      </main>
      <Footer />
    </div>
  );
}

// Optional: Generate static paths if posts are known at build time
// export async function generateStaticParams() {
//   // Fetch all post slugs here (e.g., by reading filenames)
//   const posts = [{ slug: 'first-post' }, { slug: 'second-post' }]; // Placeholder
//   return posts.map((post) => ({
//     slug: post.slug,
//   }));
// }
