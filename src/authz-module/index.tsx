import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import LoadingPage from '@src/components/LoadingPage';
import ErrorFallback from '@src/authz-module/components/ErrorPage';
import { CustomErrors } from '@src/constants';
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
      <ErrorBoundary fallbackRender={ErrorFallback} onReset={reset}>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route index element={<AuthzHome />} />
            <Route path={ROUTES.AUDIT_USER_PATH} element={<AuditUserPage />} />
            <Route path="*" element={<NotFoundError />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

export default AuthZModule;
