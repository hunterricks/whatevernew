const path = require('path');
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'es-MX', 'pt-BR'],
    defaultLocale: 'en',
  },
  // Disable webpack caching in development
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  // Experimental features
  experimental: {
    // Disable webpack cache in development
    webpackBuildWorker: false,
  },
};

// Sentry configuration
module.exports = withSentryConfig(
  nextConfig,
  {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring-tunnel',
    hideSourceMaps: true,
    disableLogger: true,
  }
);
