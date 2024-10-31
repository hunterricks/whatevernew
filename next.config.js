const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'es-MX', 'pt-BR'],
    defaultLocale: 'en',
  },
  sentry: {
    hideSourceMaps: true,
    tunnelRoute: '/monitoring-tunnel',
  },
};

// Wrap your config with Sentry
module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring-tunnel',
    hideSourceMaps: true,
    disableLogger: true,
  }
);
