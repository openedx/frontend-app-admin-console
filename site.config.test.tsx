import { SiteConfig } from '@openedx/frontend-base';

import { appId } from './src/constants';

const siteConfig: SiteConfig = {
  siteId: 'admin-console-test-site',
  siteName: 'Admin Console Test Site',
  baseUrl: 'http://localhost:2025',
  lmsBaseUrl: 'http://localhost:8000',
  loginUrl: 'http://localhost:8000/login',
  logoutUrl: 'http://localhost:8000/logout',
  // Use 'test' instead of EnvironmentTypes.TEST to break a circular dependency
  // when mocking `@openedx/frontend-base` itself.
  environment: 'test' as SiteConfig['environment'],
  basename: '/admin-console',
  apps: [{
    appId,
    config: {},
  }],

  accessTokenCookieName: 'edx-jwt-cookie-header-payload',
  segmentKey: '',
};

export default siteConfig;
