import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

/**
 * useAuth Hook
 * Manages user authentication state and provides methods for auth operations
 * 
 * Usage:
 * const { user, loading, error, signUp, signIn, signOut } = useAuth();
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setAuthState({
          user: session?.user ?? null,
          loading: false,
          error: null,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize auth';
        setAuthState({
          user: null,
          loading: false,
          error: message,
        });
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        loading: false,
        error: null,
      });
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string, username?: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
            display_name: username || email.split('@')[0],
          },
        },
      });

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        return { data: null, error: error.message };
      }

      setAuthState((prev) => ({
        ...prev,
        user: data.user,
        loading: false,
      }));

      return { data: data.user, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return { data: null, error: message };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        return { data: null, error: error.message };
      }

      setAuthState((prev) => ({
        ...prev,
        user: data.user,
        loading: false,
      }));

      return { data: data.user, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return { data: null, error: message };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
        },
      });

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign in failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return { data: null, error: message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        return { error: error.message };
      }

      setAuthState({
        user: null,
        loading: false,
        error: null,
      });

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return { error: message };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        return { error: error.message };
      }

      setAuthState((prev) => ({
        ...prev,
        loading: false,
      }));

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return { error: message };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
};
