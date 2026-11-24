import { useMemo } from 'react';
import { usePermissions } from '@openedx/frontend-base';

import { MANAGE_TEAM_PERMISSIONS, SCOPE_TYPES } from '@src/authz-module/constants';
import { useAuthzCatalog } from '@src/authz-module/catalog';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import type { RoleGroup } from '../components/SelectUsersAndRoleStep';

/**
 * The roles the user may assign, grouped by scope type, for every entry point to the wizard.
 * One permissions query answers both whether the user can assign at all and which roles the
 * wizard may offer, so the rules live here and not in each host.
 */
const useAssignableRoleGroups = () => {
  // Authz checks are always enabled in the admin console.
  const managePermissions = usePermissions(MANAGE_TEAM_PERMISSIONS, true);
  const { isCourseAuthoringEnabled } = useCourseAuthoringFlag();
  const {
    scopeTypes, getScopeCatalog, isLoading, isError,
  } = useAuthzCatalog();

  // Joined because `usePermissions` returns a new object on every render, and a string keeps the
  // memo below, and so the roles the wizard is given, stable while the answer does not change.
  const manageableKey = Object.keys(MANAGE_TEAM_PERMISSIONS)
    .filter((scopeType) => managePermissions[scopeType] === true)
    .join(',');
  const canAssignRole = manageableKey !== '';

  // The catalog roles of the scope types where the user can manage the team, in catalog order.
  const roleGroups: RoleGroup[] = useMemo(() => scopeTypes
    .filter((scopeType) => manageableKey.split(',').includes(scopeType))
    // Course (authoring) roles are only assignable when the course-authoring flag is enabled.
    .filter((scopeType) => scopeType !== SCOPE_TYPES.COURSE || isCourseAuthoringEnabled)
    .map(getScopeCatalog)
    .filter((scopeCatalog) => scopeCatalog !== undefined), [
    scopeTypes, manageableKey, isCourseAuthoringEnabled, getScopeCatalog,
  ]);

  return {
    canAssignRole, roleGroups, isLoading, isError,
  };
};

export default useAssignableRoleGroups;
