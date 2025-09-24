import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@edx/frontend-platform/react';
import LoadingPage from '@src/components/LoadingPage';
import LibrariesAuthZManager from './libraries-manager/LibrariesAuthZManager';
import { ROUTES } from './constants';

import './index.scss';

const AuthZModule = () => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path={ROUTES.LIBRARIES_TEAM_PATH} element={<LibrariesAuthZManager />} />
      </Routes>
    </Suspense>
  </ErrorBoundary>
);

export default AuthZModule;
