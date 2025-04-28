'use client'; // Required for form handling

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { redirect } from 'next/navigation'; // Use next/navigation for client components
import { useAuth } from '@/context/auth-context';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createPost } from '@/actions/post.actions'; // We will create this server action
import { Loader2 } from 'lucide-react';

const postFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  slug: z.string().min(3, { message: 'Slug must be at least 3 characters long.' }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens.' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters long.' }),
});

type PostFormValues = z.infer<typeof postFormSchema>;

export default function NewPostPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
    },
  });

   // Redirect logic needs to be handled carefully in client components
   // useEffect can check auth state after initial render
   // but server-side redirect in the parent (/admin) is better for security
  if (authLoading) {
     return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>; // Or a proper loading skeleton
  }

  if (!user && typeof window !== 'undefined') {
    // Can't use server-side redirect here. Redirect client-side.
    window.location.href = '/api/auth/github';
    return null; // Render nothing while redirecting
  }


  const onSubmit = async (values: PostFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createPost(values);
      if (result.success) {
        toast({
          title: 'Post Created',
          description: `"${values.title}" has been saved and synced to GitHub.`,
        });
        // Redirect to the admin page or the new post page after success
        // router.push('/admin'); // Use useRouter hook from next/navigation if needed
        // For now, maybe just clear the form or show a success message staying on page
         form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Creating Post',
          description: result.error || 'An unexpected error occurred.',
        });
      }
    } catch (error) {
       console.error("Failed to create post:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit the post. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate slug from title (simple version)
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;
    form.setValue('title', title);
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word characters (excluding space and hyphen)
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
    form.setValue('slug', slug);
     // Trigger validation for slug after auto-generating
     form.trigger('slug');
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Create New Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post title" {...field} onChange={handleTitleChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="auto-generated-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (Markdown)</FormLabel>
                      <FormControl>
                        {/* Basic Textarea - Replace with Markdown Editor Later */}
                        <Textarea
                          placeholder="Write your blog post content here using Markdown..."
                          className="min-h-[300px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                     </>
                   ) : (
                     'Save and Sync Post'
                   )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
