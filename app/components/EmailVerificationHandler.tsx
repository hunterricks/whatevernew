'use client';

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailVerificationProps {
  onVerified: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function EmailVerificationHandler({ onVerified, isLoading, setIsLoading }: EmailVerificationProps) {
  const { user, getAccessTokenSilently } = useAuth0();
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (user?.email_verified) {
      onVerified();
    }
  }, [user, onVerified]);

  const sendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      setVerificationSent(true);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.email_verified) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          Please verify your email address to continue. Check your inbox for a verification link.
        </AlertDescription>
      </Alert>

      {!verificationSent ? (
        <Button
          onClick={sendVerificationEmail}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Verification Email'}
        </Button>
      ) : (
        <div className="text-sm text-muted-foreground">
          Verification email sent. Didn't receive it?{' '}
          <button
            onClick={sendVerificationEmail}
            className="text-primary hover:underline"
            disabled={isLoading}
          >
            Send again
          </button>
        </div>
      )}
    </div>
  );
}
