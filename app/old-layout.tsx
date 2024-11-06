'use client';

import { ClientRoot } from './client-root';
import './globals.css';
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000'
}

export const metadata: Metadata = {
  title: 'WHATEVER™ - Home Services Platform',
  description: 'Connect with service providers and clients for home improvement projects',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png'
      },
      {
        url: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png'
      },
      {
        url: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png'
      },
      {
        url: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png'
      },
      {
        url: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png'
      },
      {
        url: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        url: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png'
      },
      {
        url: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    apple: [
      {
        url: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      }
    ]
  },
  applicationName: 'WHATEVER™',
  keywords: ['home services', 'contractors', 'home improvement', 'service providers'],
  authors: [{ name: 'WHATEVER™' }],
  category: 'business',
  creator: 'WHATEVER™',
  publisher: 'WHATEVER™',
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'WHATEVER™',
    title: 'WHATEVER™ - Home Services Platform',
    description: 'Connect with service providers and clients for home improvement projects',
    images: [
      {
        url: '/screenshots/mobile-home.png',
        width: 1170,
        height: 2532,
        alt: 'WHATEVER™ Home Screen'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WHATEVER™ - Home Services Platform',
    description: 'Connect with service providers and clients for home improvement projects',
    images: ['/screenshots/mobile-home.png'],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <ClientRoot>
          {children}
        </ClientRoot>
      </body>
    </html>
  );
}