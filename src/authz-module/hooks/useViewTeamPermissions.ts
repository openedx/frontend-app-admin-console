import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { SCOPE_TYPES, VIEW_TEAM_ACTIONS, VIEW_TEAM_PERMISSIONS } from '@src/authz-module/constants';

export const useViewTeamPermissions = () => {
  const { data: permissions, isLoading } = useValidateUserPermissionsNonSuspense(VIEW_TEAM_PERMISSIONS);

  const isCourseViewAllowed = permissions
    ? permissions.some((p) => p.action === VIEW_TEAM_ACTIONS[SCOPE_TYPES.COURSE] && p.allowed)
    : false;

  const isLibraryViewAllowed = permissions
    ? permissions.some((p) => p.action === VIEW_TEAM_ACTIONS[SCOPE_TYPES.LIBRARY] && p.allowed)
    : false;

  return { isCourseViewAllowed, isLibraryViewAllowed, isLoading };
};
