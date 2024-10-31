'use client';

import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CallbackPage() {
  const { handleRedirectCallback, user } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback();
        
        // Check user role and redirect accordingly
        const userRole = user?.['https://whatever.com/roles']?.[0];
        
        switch (userRole) {
          case 'service_provider':
            router.push('/dashboard/service-provider');
            break;
          case 'client':
            router.push('/dashboard/client');
            break;
          default:
            console.error('Unknown or missing user role:', userRole);
            toast.error('Account type not recognized. Please contact support.');
            router.push('/login');
        }
      } catch (error) {
        console.error('Error handling redirect callback:', error);
        toast.error('Login failed. Please try again.');
        router.push('/login');
      }
    };

    handleCallback();
  }, [handleRedirectCallback, router, user]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
    </div>
  );
}
