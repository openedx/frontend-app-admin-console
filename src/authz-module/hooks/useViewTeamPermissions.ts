import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import {
  CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS, VIEW_TEAM_PERMISSIONS,
} from '@src/authz-module/roles-permissions';

export const useViewTeamPermissions = () => {
  const { data: permissions, isLoading } = useValidateUserPermissionsNonSuspense(VIEW_TEAM_PERMISSIONS);

  const isCourseViewAllowed = permissions
    ? permissions.some((p) => p.action === CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM && p.allowed)
    : false;

  const isLibraryViewAllowed = permissions
    ? permissions.some((p) => p.action === CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM && p.allowed)
    : false;

  return { isCourseViewAllowed, isLibraryViewAllowed, isLoading };
};
