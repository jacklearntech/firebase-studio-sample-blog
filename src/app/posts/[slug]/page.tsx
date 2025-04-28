import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { notFound } from 'next/navigation';
import { getPostData, getAllPostSlugs, type PostData } from '@/lib/posts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown support (tables, etc.)


export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostData(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <article className="prose prose-lg dark:prose-invert max-w-3xl mx-auto">
          <h1>{post.title}</h1>
          <p className="text-muted-foreground text-base">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {/* Use react-markdown to render content */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]} // Enable GFM features
             components={{
               // Customize rendering if needed, e.g., for images or code blocks
               // See react-markdown documentation for examples
                 code(props) {
                    const {children, className, node, ...rest} = props
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                       // Add syntax highlighting logic here if desired
                       <pre className={className} {...rest}><code>{children}</code></pre>
                    ) : (
                      <code className={className} {...rest}>
                        {children}
                      </code>
                    )
                  }
             }}
          >
              {post.content}
          </ReactMarkdown>
        </article>
      </main>
      <Footer />
    </div>
  );
}

// Generate static paths for all posts at build time
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs;
}

// Ensure dynamic segments are treated as static paths
export const dynamicParams = false; // Changed from true to false for static generation
