import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: number;
  points: number;
  preferred_language: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track previous user ID to avoid unnecessary profile fetches
  const previousUserIdRef = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Debug logging (minimal in production)
        if (import.meta.env.DEV) {
          console.log('[Auth State] Event:', event);
        }

        setSession(session);
        setUser(session?.user ?? null);

        // Only fetch profile when user actually changes (not on token refresh)
        if (session?.user) {
          const userId = session.user.id;
          
          // Skip fetch if same user (e.g., TOKEN_REFRESHED event)
          if (userId !== previousUserIdRef.current) {
            previousUserIdRef.current = userId;
            // Defer profile fetch to avoid Supabase client deadlock
            setTimeout(() => {
              fetchProfile(userId);
            }, 0);
          }
        } else {
          // User signed out
          if (previousUserIdRef.current !== null) {
            previousUserIdRef.current = null;
            setProfile(null);
          }
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const userId = session.user.id;
        if (userId !== previousUserIdRef.current) {
          previousUserIdRef.current = userId;
          fetchProfile(userId);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    try {
      console.log('=== GOOGLE SIGN IN DEBUG ===');
      console.log('Starting Google OAuth...');
      
      const currentOrigin = window.location.origin;
      console.log('Current origin:', currentOrigin);
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${currentOrigin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('OAuth response:', { data, error });

      if (error) {
        console.error('Google sign in error:', error);
      }

      return { error: error as Error | null };
    } catch (error) {
      console.error('Google sign in exception:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  // Be resilient to transient missing provider states (e.g. Fast Refresh / HMR)
  if (!context) {
    if (import.meta.env.DEV) {
      console.warn('[Auth] AuthProvider is not mounted yet. Returning a safe fallback context.');
    }

    const providerMissingError = new Error('AuthProvider is not mounted');

    return {
      user: null,
      session: null,
      profile: null,
      loading: true,
      signUp: async () => ({ error: providerMissingError }),
      signIn: async () => ({ error: providerMissingError }),
      signInWithGoogle: async () => ({ error: providerMissingError }),
      signOut: async () => {},
      refreshProfile: async () => {},
    };
  }

  return context;
};
