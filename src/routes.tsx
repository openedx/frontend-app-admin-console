import { lazy } from 'react';

const Main = lazy(() => import('./Main'));

const routes = [
  {
    id: 'org.openedx.frontend.route.adminConsole.main',
    path: '/authz/*',
    Component: Main,
    handle: {
      role: 'org.openedx.frontend.role.adminConsole',
    },
  },
];

export default routes;
