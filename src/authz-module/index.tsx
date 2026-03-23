import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import LoadingPage from '@src/components/LoadingPage';
import LibrariesErrorFallback from '@src/authz-module/libraries-manager/ErrorPage';
import { ToastManagerProvider } from './libraries-manager/ToastManagerContext';
import { LibrariesUserManager, LibrariesLayout, LibrariesTeamManager } from './libraries-manager';
import RolesPermissions from './roles-permissions/RolesPermissions';
import { ROUTES } from './constants';

import './index.scss';

const AuthZModule = () => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary fallbackRender={LibrariesErrorFallback} onReset={reset}>
        <ToastManagerProvider>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route element={<LibrariesLayout />}>
                <Route path={ROUTES.LIBRARIES_USER_PATH} element={<LibrariesUserManager />} />
                <Route path={ROUTES.LIBRARIES_TEAM_PATH} element={<LibrariesTeamManager />} />
              </Route>
              <Route path={ROUTES.ROLES_PERMISSIONS_PATH} element={<RolesPermissions />} />
            </Routes>
          </Suspense>
        </ToastManagerProvider>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

export default AuthZModule;
