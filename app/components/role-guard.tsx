"use client";

import { useAuth } from '@/lib/auth';
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.activeRole)) {
    redirect('/unauthorized');
  }

  return <>{children}</>;
} 