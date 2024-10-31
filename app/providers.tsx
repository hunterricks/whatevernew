"use client";

import { ThemeProvider } from "next-themes";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { EnvProvider } from '@/lib/providers/env-provider';
import dynamic from 'next/dynamic';
import { LoadingHeader } from '@/components/LoadingHeader';

const Header = dynamic(() => import('@/components/Header'), {
  ssr: false,
  loading: () => <LoadingHeader />
});

const Footer = dynamic(() => import('@/components/Footer'), { 
  ssr: false 
});

const MobileNavigation = dynamic(
  () => import('@/components/MobileNavigation').then(mod => mod.MobileNavigation), 
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <EnvProvider>
      <UserProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 pt-16">
              {mounted ? children : null}
            </main>
            <Footer />
            <MobileNavigation />
          </div>
          <Toaster />
        </ThemeProvider>
      </UserProvider>
    </EnvProvider>
  );
}