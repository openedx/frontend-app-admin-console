import { useMemo } from 'react';
import { useValidateUserPermissions } from '@src/data/hooks';
import { getOrgAggregateScopeKey, getPlatformAggregateScopeKey } from '@src/authz-module/constants';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from '@src/authz-module/roles-permissions';

interface UseScopePermissionsParams {
  contextType: string | undefined;
  orderedOrgs: string[];
}

interface UseScopePermissionsResult {
  hasPlatformPermission: boolean;
  orgHasPermission: Record<string, boolean>;
}

const useScopePermissions = ({
  contextType,
  orderedOrgs,
}: UseScopePermissionsParams): UseScopePermissionsResult => {
  // Validate the platform-wide aggregate (course-v1:* / lib:*) together with each
  // org-level aggregate in a single request. The platform-wide scope is always at
  // index 0; the per-org scopes follow in `orderedOrgs` order.
  // Note: Using glob patterns (*:org:*)
  const permissionRequests = useMemo(() => {
    if (!contextType) { return []; }
    const action = contextType === 'course'
      ? CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM
      : CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM;
    return [
      { action, scope: getPlatformAggregateScopeKey(contextType) },
      ...orderedOrgs.map((org) => ({
        action,
        scope: getOrgAggregateScopeKey(contextType, org),
      })),
    ];
  }, [orderedOrgs, contextType]);

  const { data: perms } = useValidateUserPermissions(permissionRequests);

  const hasPlatformPermission = !!contextType && (perms?.[0]?.allowed ?? false);

  // Build a map of `org: has_permission`. Offset by 1 to skip the platform-wide entry.
  const orgHasPermission = useMemo(() => {
    const map: Record<string, boolean> = {};
    orderedOrgs.forEach((org, idx) => {
      map[org] = perms?.[idx + 1]?.allowed ?? false;
    });
    return map;
  }, [orderedOrgs, perms]);

  return { hasPlatformPermission, orgHasPermission };
};

export default useScopePermissions;
