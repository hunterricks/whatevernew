'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    toast.error('You are not authorized to access this page');
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
      <p className="text-muted-foreground">Redirecting to home page...</p>
    </div>
  );
}
