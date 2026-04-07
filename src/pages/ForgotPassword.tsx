import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate email
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Call Supabase resetPasswordForEmail
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      // Success - show confirmation message
      setResetSent(true);
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(message);
      setLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl border border-border shadow-lg p-8 text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                <CheckCircle2 className="h-16 w-16 text-green-500 relative" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Check Your Email</h2>
              <p className="text-muted-foreground">
                We've sent a password reset link to{' '}
                <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-accent/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">1.</strong> Check your email inbox (and spam folder just in case)
              </p>
              <p>
                <strong className="text-foreground">2.</strong> Click the reset link in the email
              </p>
              <p>
                <strong className="text-foreground">3.</strong> Create a new password
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white"
              >
                Back to Sign In
              </Button>
              <Button
                onClick={() => setResetSent(false)}
                variant="outline"
                className="w-full h-10"
              >
                Try another email
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground pt-4">
              Didn't receive the email?{' '}
              <button
                onClick={() => setResetSent(false)}
                className="text-primary hover:text-primary/80 underline font-medium"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Harga<span className="text-primary">Rakyat</span>
          </h1>
          <p className="text-muted-foreground">Reset your password</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl border border-border shadow-lg p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Error</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-accent/50 rounded-lg p-4 text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </div>

          {/* Email Reset Form */}
          <form onSubmit={handleResetRequest} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 bg-primary hover:bg-primary/90 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="pt-4 border-t border-border">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium w-full py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Remember your password?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 underline">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
