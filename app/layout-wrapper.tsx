'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LoadingHeader } from '@/components/LoadingHeader';
import { Toaster } from '@/components/ui/toaster';
import { WebContainerIndicator } from '@/components/WebContainerIndicator';
import { usePathname } from 'next/navigation';
import { ErrorBoundary as CustomErrorBoundary } from '@/components/ErrorBoundary';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

const Header = dynamic(() => import('@/components/Header'), {
  ssr: false,
  loading: () => <LoadingHeader />
});

const Footer = dynamic(() => import('@/components/Footer'), { 
  ssr: false,
  loading: () => <div className="h-16" />
});

const MobileNavigation = dynamic(
  () => import('@/components/MobileNavigation').then(mod => mod.MobileNavigation), 
  { 
    ssr: false,
    loading: () => <div className="h-16 md:hidden" />
  }
);

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
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