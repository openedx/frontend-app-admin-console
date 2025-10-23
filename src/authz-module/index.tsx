import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import LoadingPage from '@src/components/LoadingPage';
import LibrariesErrorFallback from '@src/authz-module/libraries-manager/ErrorPage';
import { LibrariesTeamManager, LibrariesUserManager, LibrariesLayout } from './libraries-manager';
import { ROUTES } from './constants';

import './index.scss';

const AuthZModule = () => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary fallbackRender={LibrariesErrorFallback} onReset={reset}>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route element={<LibrariesLayout />}>
              <Route path={ROUTES.LIBRARIES_TEAM_PATH} element={<LibrariesTeamManager />} />
              <Route path={ROUTES.LIBRARIES_USER_PATH} element={<LibrariesUserManager />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

export default AuthZModule;
