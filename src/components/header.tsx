'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/actions/auth.actions'; // We will create this action

export function Header() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Optionally redirect or update UI state after logout
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          {/* Optional: Add a simple SVG logo */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
            <path d="M4 7v10M9 7v10M14 7v10M19 7v10M4 12h15"/>
          </svg>
          <span className="font-bold">GitBlog</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4">
          {/* Add other navigation links here if needed */}
           {user && (
             <Link href="/admin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
               Admin Dashboard
             </Link>
           )}
        </nav>
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url ?? undefined} alt={user.login ?? 'User Avatar'} />
                      <AvatarFallback>{user.login?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.login}</p>
                    {/* Optional: Add email if available */}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/api/auth/github">
                <Github className="mr-2 h-4 w-4" /> Login with GitHub
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
