import { EnvironmentTypes, SiteConfig } from '@openedx/frontend-base';

import { appId } from './src/constants';

const siteConfig: SiteConfig = {
  siteId: 'admin-console-test-site',
  siteName: 'Admin Console Test Site',
  baseUrl: 'http://localhost:2025',
  lmsBaseUrl: 'http://localhost:8000',
  cmsBaseUrl: 'http://studio.local.openedx.io:8001',
  loginUrl: 'http://localhost:8000/login',
  logoutUrl: 'http://localhost:8000/logout',
  environment: EnvironmentTypes?.TEST ?? 'test',
  basename: '/admin-console',
  apps: [{
    appId,
    config: {
      COURSE_AUTHORING_MICROFRONTEND_URL: 'http://localhost:2001',
    },
  }],

  accessTokenCookieName: 'edx-jwt-cookie-header-payload',
  segmentKey: '',
};

export default siteConfig;
