import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@edx/frontend-platform/react';
import LoadingPage from '@src/components/LoadingPage';
import { LibrariesTeamManager, LibrariesUserManager, LibrariesLayout } from './libraries-manager';
import { ROUTES } from './constants';

import './index.scss';

const AuthZModule = () => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route element={<LibrariesLayout />}>
          <Route path={ROUTES.LIBRARIES_TEAM_PATH} element={<LibrariesTeamManager />} />
          <Route path={ROUTES.LIBRARIES_USER_PATH} element={<LibrariesUserManager />} />
        </Route>
      </Routes>
    </Suspense>
  </ErrorBoundary>
);

export default AuthZModule;
