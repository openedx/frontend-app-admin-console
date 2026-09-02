import { lazy } from 'react';
import { authenticatedLoader } from '@openedx/frontend-base';

const Main = lazy(() => import('./Main'));

const routes = [
  {
    id: 'org.openedx.frontend.route.adminConsole.main',
    path: '/authz/*',
    loader: authenticatedLoader,
    Component: Main,
    handle: {
      roles: ['org.openedx.frontend.role.adminConsole'],
    },
  },
];

export default routes;
