"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { UserCircle } from "lucide-react";
import type { UserRole } from "@/lib/auth";
import { useRouter } from 'next/navigation';

const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

// Define consistent role labels
const ROLE_LABELS: Record<UserRole, string> = {
  client: 'Client',
  service_provider: 'Service Provider'
};

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const router = useRouter();

  if (!user?.roles || user.roles.length <= 1) {
    return null;
  }

  const handleRoleSwitch = async (role: UserRole) => {
    if (role !== user.activeRole) {
      await switchRole(role);
      // Convert role to URL-friendly format
      const dashboardPath = role === 'service_provider' ? 'service-provider' : role;
      router.push(`/dashboard/${dashboardPath}`);
    }
  };

  const getRoleLabel = (role: UserRole) => ROLE_LABELS[role];

  return (
    <div className="flex items-center gap-2">
      {isWebContainer && (
        <div className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
          Web Container Mode
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <UserCircle className="h-4 w-4" />
            {getRoleLabel(user.activeRole)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {user.roles.map((role) => (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleSwitch(role)}
              className={`gap-2 cursor-pointer ${role === user.activeRole ? 'bg-primary/5' : ''}`}
            >
              <UserCircle className="h-4 w-4" />
              Switch to {getRoleLabel(role)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}