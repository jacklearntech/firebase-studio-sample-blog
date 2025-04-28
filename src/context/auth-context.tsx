'use client';

import type { User } from '@/types/auth';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser } from '@/actions/auth.actions'; // Server action to get current user
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refetchUser: () => Promise<void>; // Function to manually refetch user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start loading initially

  const fetchUser = async () => {
     setLoading(true); // Set loading true when fetching starts
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setUser(null); // Ensure user is null on error
    } finally {
       setLoading(false); // Set loading false when fetching ends
    }
  };

  useEffect(() => {
    fetchUser();
  }, []); // Fetch user only on initial mount

  const refetchUser = async () => {
     await fetchUser();
  };


  // Show loading indicator while fetching initial user state
  // You might want a more sophisticated loading screen/skeleton here
  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen">
  //       <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //     </div>
  //   );
  // }


  return (
    <AuthContext.Provider value={{ user, loading, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
