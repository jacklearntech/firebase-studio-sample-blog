import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth'; // Use the same getSession logic

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all routes under /admin
  if (pathname.startsWith('/admin')) {
    const session = await getSession(); // Check session on the server edge

    if (!session?.user) {
      // If no user session, redirect to the GitHub login initiation route
      const loginUrl = new URL('/api/auth/github', request.url);
      // Optional: add callbackUrl param if needed by login page
      // loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow the request to proceed if authenticated or not an admin route
  return NextResponse.next();
}

// Define the paths the middleware should run on
export const config = {
  matcher: ['/admin/:path*'], // Apply middleware to all routes starting with /admin
};
