import {
  EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp
} from '@openedx/frontend-base';

import { adminConsoleApp } from './src';

import '@openedx/frontend-base/shell/style';

const siteConfig: SiteConfig = {
  siteId: 'admin-console-dev',
  siteName: 'Admin Console Dev',
  baseUrl: 'http://apps.local.openedx.io:2025',
  lmsBaseUrl: 'http://local.openedx.io:8000',
  loginUrl: 'http://local.openedx.io:8000/login',
  logoutUrl: 'http://local.openedx.io:8000/logout',

  environment: EnvironmentTypes.DEVELOPMENT,
  basename: '/admin-console',
  apps: [
    shellApp,
    headerApp,
    footerApp,
    adminConsoleApp,
  ],
  externalRoutes: [
    {
      role: 'org.openedx.frontend.role.profile',
      url: 'http://apps.local.openedx.io:1995/profile/'
    },
    {
      role: 'org.openedx.frontend.role.account',
      url: 'http://apps.local.openedx.io:1997/account/'
    },
    {
      role: 'org.openedx.frontend.role.courseAuthoring',
      url: 'http://apps.local.openedx.io:2001/authoring/home'
    },
    {
      role: 'org.openedx.frontend.role.logout',
      url: 'http://local.openedx.io:8000/logout'
    },
  ],

  accessTokenCookieName: 'edx-jwt-cookie-header-payload', // check this
};

export default siteConfig;
