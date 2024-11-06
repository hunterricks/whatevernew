import { useAuth } from '@/lib/auth';
import { Permission } from '../types/permissions';
import { rolePermissions } from '../permissions/mappings';

export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    const userPermissions = user.roles.flatMap(role => rolePermissions[role] || []);
    return userPermissions.includes(permission);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission
  };
} 