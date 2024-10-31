// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.5, // Sample 50% of requests for edge functions
  
  // Auth-specific settings
  beforeSend(event) {
    // Remove sensitive data
    if (event.request?.headers) {
      const sanitizedHeaders = { ...event.request.headers };
      delete sanitizedHeaders['authorization'];
      delete sanitizedHeaders['cookie'];
      event.request.headers = sanitizedHeaders;
    }

    // Add edge context
    event.tags = {
      ...event.tags,
      'runtime': 'edge',
      'auth.provider': 'auth0',
    };

    return event;
  },

  // Environment
  environment: process.env.NEXT_PUBLIC_ENV || 'development',
});
