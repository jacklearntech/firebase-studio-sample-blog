import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getAllPostsMeta } from '@/lib/posts'; // Import the utility function

export default function Home() {
  const posts = getAllPostsMeta(); // Fetch posts using the new utility

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Welcome to GitBlog</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.slug}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <p className="text-sm text-muted-foreground pt-1">
                    {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
              </CardHeader>
              <CardContent>
                <CardDescription>{post.excerpt || 'No excerpt available.'}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild variant="link" className="text-accent p-0">
                  <Link href={`/posts/${post.slug}`}>Read More →</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
           {/* Placeholder if no posts */}
           {posts.length === 0 && (
             <p className="text-muted-foreground col-span-full text-center">No posts found. Check the `src/app/posts` directory or add posts via the admin dashboard.</p>
           )}
        </div>
      </main>
       <Footer />
    </div>
  );
}
