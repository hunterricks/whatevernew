"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function useNavigationGuard(requiredRole?: string) {
  const router = useRouter();
  const { user, checkAuth } = useAuth();

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }

    if (requiredRole && user?.activeRole !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [router, checkAuth, user, requiredRole]);
} 