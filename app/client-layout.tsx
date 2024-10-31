"use client";

import { UserProvider } from '@auth0/nextjs-auth0/client';
import { ThemeProvider } from "next-themes";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LoadingHeader } from '@/components/LoadingHeader';
import { Toaster } from '@/components/ui/toaster';
import { WebContainerIndicator } from '@/components/WebContainerIndicator';
import { usePathname } from 'next/navigation';
import { EnvProvider } from '@/lib/providers/env-provider';
import { ErrorBoundary as CustomErrorBoundary } from '@/components/ErrorBoundary';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

// Dynamically import components
const Header = dynamic(() => import('@/components/Header'), {
  ssr: false,
  loading: () => <LoadingHeader />
});

const Footer = dynamic(() => import('@/components/Footer'), { 
  ssr: false,
  loading: () => <div className="h-16" /> // Prevent layout shift
});

const MobileNavigation = dynamic(
  () => import('@/components/MobileNavigation').then(mod => mod.MobileNavigation), 
  { 
    ssr: false,
    loading: () => <div className="h-16 md:hidden" /> // Prevent layout shift
  }
);

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isErrorPage = pathname === '/error';

  return (
    <div className="flex flex-col min-h-screen">
      <CustomErrorBoundary>
        <Suspense fallback={<LoadingHeader />}>
          <Header />
        </Suspense>
        <main className="flex-1 pt-16">
          {children}
        </main>
        {!isAuthPage && !isErrorPage && (
          <>
            <Footer />
            <MobileNavigation />
            <PWAInstallPrompt />
          </>
        )}
        {process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer' && <WebContainerIndicator />}
      </CustomErrorBoundary>
    </div>
  );
}

function HtmlWrapper({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <meta name="description" content="Whatever - Connect with skilled professionals" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CustomErrorBoundary>
      <EnvProvider>
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </UserProvider>
      </EnvProvider>
    </CustomErrorBoundary>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <HtmlWrapper>
      <Providers>
        <LayoutWrapper>{children}</LayoutWrapper>
      </Providers>
    </HtmlWrapper>
  );
}
