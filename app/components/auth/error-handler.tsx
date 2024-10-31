'use client';

import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';

export function AuthErrorHandler() {
  const { error } = useAuth0();

  useEffect(() => {
    if (error) {
      let message = 'An error occurred during authentication.';
      
      if (error.message === 'Popup closed') {
        message = 'Login cancelled. Please try again.';
      } else if (error.message.includes('popup_closed_by_user')) {
        message = 'Login window was closed. Please try again.';
      }
      
      toast.error(message);
      console.error('Auth0 error:', error);
    }
  }, [error]);

  return null;
}
