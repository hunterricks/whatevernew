import { UserProvider } from '@auth0/nextjs-auth0/client';
import { ClientRoot } from './client-root';
import './globals.css';
import { metadata, viewport } from './metadata';

export { metadata, viewport };

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
        <UserProvider>
          <ClientRoot>
            {children}
          </ClientRoot>
        </UserProvider>
      </body>
    </html>
  );
}
