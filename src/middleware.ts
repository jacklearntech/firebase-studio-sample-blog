import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth'; // Use the same getSession logic

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all routes under /admin
  if (pathname.startsWith('/admin')) {
    console.log(`Middleware: Checking auth for path: ${pathname}`);
    const session = await getSession(); // Check session on the server edge

    if (!session?.user) {
      // If no user session, redirect to the GitHub login initiation route
      const loginUrl = new URL('/api/auth/github', request.url);
      console.log(`Middleware: No active session found for ${pathname}. Redirecting to GitHub login: ${loginUrl.toString()}`);
      // Optional: add callbackUrl param if needed by login page
      // loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    } else {
       console.log(`Middleware: Active session found for user ${session.user.login}. Allowing access to ${pathname}.`);
    }
  } else {
     // console.log(`Middleware: Path ${pathname} does not require auth check.`);
  }

  // Allow the request to proceed if authenticated or not an admin route
  return NextResponse.next();
}

// Define the paths the middleware should run on
export const config = {
  matcher: ['/admin/:path*'], // Apply middleware to all routes starting with /admin
};
