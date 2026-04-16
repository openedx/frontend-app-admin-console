// src/components/ProtectedRoute.tsx
import { ReactElement } from 'react';
import { useValidateUserPermissions } from '@src/data/hooks';
import LoadingPage from '@src/components/LoadingPage';
import { CustomErrors } from '@src/constants';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from '@src/authz-module/constants';

const REQUIRED_USER_PERMISSIONS = [
  CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM,
  CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM,
  CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM,
  CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
];

type ProtectedRouteProps = {
  children: ReactElement;
  fallback?: ReactElement;
};

export const ProtectedRoute = ({
  children,
  fallback,
}: ProtectedRouteProps) => {
  // TODO: which scope?
  const requiredPermissions = REQUIRED_USER_PERMISSIONS.map(action => ({ action, scope: '*' }));
  const { data: permissions, isLoading, isError } = useValidateUserPermissions(requiredPermissions);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError && fallback) {
    return fallback;
  }
  if (isError) {
    throw new Error(CustomErrors.SERVER_ERROR);
  }

  const hasAccess = permissions.some(permission => permission.allowed);

  if (!hasAccess) {
    throw new Error(CustomErrors.NO_ACCESS);
  }

  return children;
};
