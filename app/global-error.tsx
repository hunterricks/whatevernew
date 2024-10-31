"use client";

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import { Providers } from './providers';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error, {
      tags: {
        errorDigest: error.digest,
        component: 'GlobalError',
      },
      extra: {
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      <body 
        className="min-h-screen bg-background font-sans antialiased"
        data-sentry-release={process.env.NEXT_PUBLIC_SENTRY_RELEASE}
        data-sentry-environment={process.env.NEXT_PUBLIC_ENV}
      >
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <h2 className="text-2xl font-bold">Something went wrong!</h2>
                <p className="text-muted-foreground">Please try again later.</p>
                <Button onClick={reset} variant="outline">
                  Try again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}