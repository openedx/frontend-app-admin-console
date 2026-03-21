import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import LoadingPage from '@src/components/LoadingPage';
import LibrariesErrorFallback from '@src/authz-module/libraries-manager/ErrorPage';
import { CustomErrors } from '@src/constants';
import { ToastManagerProvider } from './libraries-manager/ToastManagerContext';
import { LibrariesUserManager, LibrariesLayout, LibrariesTeamManager } from './libraries-manager';
import AuthzHome from './authz-home';
import AuditUserPage from './audit-user';
import { ROUTES } from './constants';

import './index.scss';

const NotFoundError = () => {
  const error = new Error(CustomErrors.NOT_FOUND);
  throw error;
};

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
              <Route index element={<AuthzHome />} />
              <Route path="*" element={<NotFoundError />} />
              <Route
                path={ROUTES.AUDIT_USER_PATH}
                element={<AuditUserPage />}
              />
            </Routes>
          </Suspense>
        </ToastManagerProvider>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

export default AuthZModule;
