import { ReactNode } from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { Permission } from '@/lib/types/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permissions: Permission[];
  requireAll?: boolean;
}

export function PermissionGuard({ 
  children, 
  permissions, 
  requireAll = true 
}: PermissionGuardProps) {
  const { hasAllPermissions, hasAnyPermission } = usePermissions();
  
  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasAccess) return null;
  
  return <>{children}</>;
} 