'use client';

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { AuthProvider } from "@/components/providers/auth-provider";
import { EnvProvider } from '@/lib/providers/env-provider';
import { ErrorBoundary as CustomErrorBoundary } from '@/components/ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CustomErrorBoundary>
      <UserProvider>
        <AuthProvider>
          <EnvProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </EnvProvider>
        </AuthProvider>
      </UserProvider>
    </CustomErrorBoundary>
  );
}
