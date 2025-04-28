import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth'; // We will create this
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FilePlus, GitBranch } from 'lucide-react';

// Placeholder for fetching admin-specific data, like posts managed by the user
async function getAdminData() {
  // In a real app, fetch posts, settings, etc.
  return {
    postCount: 5, // Example data
    repoName: process.env.GITHUB_REPO_OWNER + '/' + process.env.GITHUB_REPO_NAME,
  };
}

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/github'); // Redirect to login if not authenticated
  }

  const adminData = await getAdminData();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button asChild>
            <Link href="/admin/new-post">
              <FilePlus className="mr-2 h-4 w-4" /> New Post
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                 {/* Optional: Icon */}
              </CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold">{adminData.postCount}</div>
                 {/* Optional: Description or link */}
              </CardContent>
           </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Connected Repository</CardTitle>
                 <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold truncate">{adminData.repoName}</div>
                 <p className="text-xs text-muted-foreground">
                   Posts are synced here.
                 </p>
              </CardContent>
           </Card>
        </div>

        {/* Placeholder for Post Management List */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Manage Posts</h2>
          <Card>
             <CardContent className="p-6">
               <p className="text-muted-foreground">Post management functionality coming soon...</p>
               {/* Add a table or list of posts here later */}
             </CardContent>
          </Card>
        </div>

      </main>
      <Footer />
    </div>
  );
}
