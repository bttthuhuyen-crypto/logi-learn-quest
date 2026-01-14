import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAllChannels } from '@/lib/realtimeManager';

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

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
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

// Pure data fetcher - returns profile data without setting state
const fetchProfileData = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!error && data) {
    return data as Profile;
  }
  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Consolidated state for minimal re-renders
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  // Track previous user ID to avoid unnecessary profile fetches
  const previousUserIdRef = useRef<string | null>(null);
  // Track initialization to prevent duplicate processing
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        let initialProfile: Profile | null = null;
        if (session?.user) {
          previousUserIdRef.current = session.user.id;
          initialProfile = await fetchProfileData(session.user.id);
        }

        // Single batched state update - profile is ready when loading becomes false
        setAuthState({
          session,
          user: session?.user ?? null,
          profile: initialProfile,
          loading: false,
        });

        initializedRef.current = true;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('[Auth] Initialization error:', error);
        }
        setAuthState(prev => ({ ...prev, loading: false }));
        initializedRef.current = true;
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip if not initialized - getSession will handle initial state
        if (!initializedRef.current) return;

        if (import.meta.env.DEV) {
          console.log('[Auth State] Event:', event);
        }

        const newUserId = session?.user?.id ?? null;
        const previousUserId = previousUserIdRef.current;

        // User signed out
        if (!session?.user) {
          if (previousUserId !== null) {
            previousUserIdRef.current = null;
            // Cleanup all realtime channels on logout
            cleanupAllChannels();
            setAuthState({
              session: null,
              user: null,
              profile: null,
              loading: false,
            });
          }
          return;
        }

        // User changed (new sign in)
        if (newUserId !== previousUserId) {
          previousUserIdRef.current = newUserId;
          
          // Fetch profile for new user
          const profile = await fetchProfileData(newUserId);
          
          setAuthState({
            session,
            user: session.user,
            profile,
            loading: false,
          });
          return;
        }

        // Same user, just token refresh - only update session/user
        setAuthState(prev => ({
          ...prev,
          session,
          user: session.user,
        }));
      }
    );

    // THEN initialize
    initializeAuth();

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
      if (import.meta.env.DEV) {
        console.log('=== GOOGLE SIGN IN DEBUG ===');
        console.log('Starting Google OAuth...');
        console.log('Current origin:', window.location.origin);
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (import.meta.env.DEV) {
        console.log('OAuth response:', { data, error });
      }

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
    // Cleanup all realtime channels before signout
    cleanupAllChannels();
    await supabase.auth.signOut();
    // State will be updated by onAuthStateChange listener
  };

  const refreshProfile = async () => {
    if (authState.user) {
      const profile = await fetchProfileData(authState.user.id);
      setAuthState(prev => ({ ...prev, profile }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        session: authState.session,
        profile: authState.profile,
        loading: authState.loading,
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
