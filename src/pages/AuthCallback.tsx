import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * AuthCallback Page
 * Handles OAuth redirects (e.g., from Google sign-in)
 * This page is hit when Supabase redirects back after OAuth authentication
 * 
 * Route: /auth-callback
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log for debugging
        console.log('AuthCallback: Processing OAuth callback...');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);

        // Wait a moment for Supabase to process the hash token
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log('Session check result:', { session: !!session, error: sessionError });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          
          // Redirect to login after 2 seconds
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (session && session.user) {
          // User is authenticated, redirect to dashboard
          console.log('User authenticated successfully:', session.user.email);
          setLoading(false);
          navigate('/dashboard', { replace: true });
        } else {
          // No session found
          console.warn('No session found after OAuth callback');
          setError('Authentication failed. Please try again.');
          setLoading(false);
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        console.error('AuthCallback error:', message, err);
        setError(message);
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl border border-border shadow-lg p-8 text-center space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-destructive mb-2">Authentication Failed</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-border shadow-lg p-8 text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Harga<span className="text-primary">Rakyat</span>
            </h2>
            <p className="text-muted-foreground">Completing your sign in...</p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
