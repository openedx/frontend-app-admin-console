import { lazy } from 'react';
import { authenticatedLoader } from '@openedx/frontend-base';

import { AUTHZ_HOME_PATH } from './authz-module/constants';

const Main = lazy(() => import('./Main'));

const routes = [
  {
    id: 'org.openedx.frontend.route.adminConsole.main',
    path: `${AUTHZ_HOME_PATH}/*`,
    loader: authenticatedLoader,
    Component: Main,
    handle: {
      roles: ['org.openedx.frontend.role.adminConsole'],
    },
  },
];

export default routes;
