import { usePermissions } from '@openedx/frontend-base';
import { SCOPE_TYPES, VIEW_TEAM_PERMISSIONS } from '@src/authz-module/constants';

export const useViewTeamPermissions = () => {
  // Authz checks are always enabled in the admin console.
  const permissions = usePermissions(VIEW_TEAM_PERMISSIONS, true);

  return {
    isCourseViewAllowed: permissions[SCOPE_TYPES.COURSE] === true,
    isLibraryViewAllowed: permissions[SCOPE_TYPES.LIBRARY] === true,
    isLoading: permissions.isLoading,
  };
};
