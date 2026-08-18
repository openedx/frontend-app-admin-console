import { notificationsApp } from '@openedx/frontend-app-notifications';
import {
  EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp,
} from '@openedx/frontend-base';

import { adminConsoleApp } from './src';

const siteConfig: SiteConfig = {
  siteId: 'admin-console-ci',
  siteName: 'Admin Console CI',
  baseUrl: 'http://localhost:2025',
  lmsBaseUrl: 'http://localhost:8000',
  loginUrl: 'http://localhost:8000/login',
  logoutUrl: 'http://localhost:8000/logout',

  environment: EnvironmentTypes.PRODUCTION,
  basename: '/admin-console',
  apps: [
    shellApp,
    headerApp,
    footerApp,
    adminConsoleApp,
    notificationsApp,
  ],

  accessTokenCookieName: 'edx-jwt-cookie-header-payload',
};

export default siteConfig;
