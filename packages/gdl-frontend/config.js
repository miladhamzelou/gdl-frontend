// @flow
/**
 * Part of GDL gdl-frontend.
 * Copyright (C) 2017 GDL
 *
 * See LICENSE
 */
/*::
import type { ConfigShape } from './types';
*/
const { GDL_ENVIRONMENT } = require('gdl-config');
const dnsResolver = require('./lib/customResolver');

const isDev = process.env.NODE_ENV !== 'production';

const bookApiUrl = () => {
  switch (GDL_ENVIRONMENT) {
    case 'dev':
      return 'https://api.test.digitallibrary.io/book-api/v1';
    case 'local':
      return 'http://book-api.gdl-local:40001/book-api/v1';
    case 'prod':
      return 'https://api.digitallibrary.io/book-api/v1';
    default:
      return `https://api.${GDL_ENVIRONMENT}.digitallibrary.io/book-api/v1`;
  }
};

const canonicalUrl = () => {
  switch (GDL_ENVIRONMENT) {
    case 'dev':
      return 'http://localhost:3000';
    case 'local':
      return 'http://localhost:40003';
    case 'prod':
      return 'https://digitallibrary.io';
    default:
      return `https://${GDL_ENVIRONMENT}.digitallibrary.io`;
  }
};

const googleAnalyticsId = () => {
  switch (GDL_ENVIRONMENT) {
    case 'test':
      return 'UA-111724798-1';
    case 'staging':
      return 'UA-111796456-1';
    case 'prod':
      return 'UA-111771573-1';
    default:
      return null;
  }
};

module.exports = {
  serverRuntimeConfig: {
    port: process.env.GDL_FRONTEND_PORT || 3005,
    // No need to add this to the public config (and ship to client) since we only use it in _document.js
    googleSiteVerificationId: 't5dnhhLP6IP-A-0-EPdggXp7th33SJI_dgqLv9vkAcA',
    // If we want to use our own custom DNS resolver (when running in Docker)
    get bookApiUrl() {
      return process.env.CUSTOM_DNS_RESOLVE
        ? dnsResolver('book-api.gdl-local', '/book-api/v1')
        : bookApiUrl();
    }
  },
  publicRuntimeConfig: {
    bookApiUrl: bookApiUrl(),
    canonicalUrl: canonicalUrl(),

    DEFAULT_LANGUAGE: {
      code: 'en',
      name: 'English'
    },

    SENTRY_PROJECT_ID: '1195015',
    SENTRY_PUBLIC_KEY: '7d5b3ec618464d4abceb4b4fc2ee0ed0',
    REPORT_ERRORS: !(
      isDev ||
      GDL_ENVIRONMENT === 'dev' ||
      GDL_ENVIRONMENT === 'local'
    ),

    AUTH0: {
      clientId: 'Hf3lgXrS71nxiiEaHAyRZ3GncgeE2pq5',
      audience: 'gdl_system',
      domain: 'digitallibrary.eu.auth0.com'
    },

    googleAnalyticsId: googleAnalyticsId(),

    zendeskUrl: 'https://digitallibrary.zendesk.com/hc/en-us/requests/new'
  }
};
