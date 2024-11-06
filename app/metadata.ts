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
      // ... rest of the icons
    ],
    apple: [
      {
        url: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      }
    ]
  },
  // ... rest of the metadata
} 