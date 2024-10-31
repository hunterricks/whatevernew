// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors

  // Auth-specific settings
  beforeSend(event) {
    // Remove sensitive data
    if (event.request?.cookies) {
      event.request.cookies = '[Filtered]';
    }
    
    // Add authentication context
    event.tags = {
      ...event.tags,
      'auth.provider': 'auth0',
    };
    
    return event;
  },

  // Environment
  environment: process.env.NEXT_PUBLIC_ENV || 'development',
});
