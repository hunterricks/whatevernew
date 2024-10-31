import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth0 } from '@auth0/auth0-react';

export function useAuth() {
  const { user: auth0User, isLoading: auth0Loading, error: auth0Error } = useAuth0();
  const { user: nextUser, isLoading: nextLoading, error: nextError } = useUser();

  const user = auth0User || nextUser;
  const isLoading = auth0Loading || nextLoading;
  const error = auth0Error || nextError;

  const checkAuth = () => {
    return !!user;
  };

  return {
    user,
    isLoading,
    error,
    checkAuth,
  };
} 