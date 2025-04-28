import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

// Placeholder for actual blog post data fetching
const posts = [
  { slug: 'first-post', title: 'My First Blog Post', excerpt: 'This is a short excerpt of my first blog post...' },
  { slug: 'second-post', title: 'Another Interesting Topic', excerpt: 'Exploring another topic in this second post...' },
];

export default function Home() {
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
              </CardHeader>
              <CardContent>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild variant="link" className="text-accent">
                  <Link href={`/posts/${post.slug}`}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
           {/* Placeholder if no posts */}
           {posts.length === 0 && (
             <p className="text-muted-foreground col-span-full text-center">No posts yet. Admin can add posts via the dashboard.</p>
           )}
        </div>
      </main>
       <Footer />
    </div>
  );
}
