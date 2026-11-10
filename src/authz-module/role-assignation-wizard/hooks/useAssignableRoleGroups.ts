import { useMemo } from 'react';

import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import {
  MANAGE_TEAM_ACTIONS, MANAGE_TEAM_PERMISSIONS, SCOPE_TYPES,
} from '@src/authz-module/constants';
import { useAuthzCatalog } from '@src/authz-module/catalog';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import type { RoleGroup } from '../components/SelectUsersAndRoleStep';

/**
 * The roles the user may assign, grouped by scope type, for every entry point to the wizard.
 * One permissions query answers both whether the user can assign at all and which roles the
 * wizard may offer, so the rules live here and not in each host.
 */
const useAssignableRoleGroups = () => {
  const { data: managePermissions } = useValidateUserPermissionsNonSuspense(MANAGE_TEAM_PERMISSIONS);
  const { isCourseAuthoringEnabled } = useCourseAuthoringFlag();
  const {
    scopeTypes, getScopeCatalog, isLoading, isError,
  } = useAuthzCatalog();

  const canAssignRole = !!managePermissions?.some((permission) => permission.allowed);

  // The catalog roles of the scope types where the user can manage the team, in catalog order.
  const roleGroups: RoleGroup[] = useMemo(() => scopeTypes
    .filter((scopeType) => managePermissions?.some(
      ({ action, allowed }) => allowed && action === MANAGE_TEAM_ACTIONS[scopeType],
    ))
    // Course (authoring) roles are only assignable when the course-authoring flag is enabled.
    .filter((scopeType) => scopeType !== SCOPE_TYPES.COURSE || isCourseAuthoringEnabled)
    .map(getScopeCatalog)
    .filter((scopeCatalog) => scopeCatalog !== undefined), [
    scopeTypes, managePermissions, isCourseAuthoringEnabled, getScopeCatalog,
  ]);

  return {
    canAssignRole, roleGroups, isLoading, isError,
  };
};

export default useAssignableRoleGroups;
