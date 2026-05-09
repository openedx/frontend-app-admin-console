import { useMemo } from 'react';
import { useValidateUserPermissions } from '@src/data/hooks';
import { getOrgAggregateScopeKey } from '@src/authz-module/constants';
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
  // TODO: compute hasPlatformPermission once the backend supports validating platform-wide permissions.
  const hasPlatformPermission = false;

  // Validate per-organization permissions for org-level aggregate options
  // Note: Using glob patterns (*:org:*)
  const orgPermissionRequests = useMemo(() => {
    if (!orderedOrgs.length || !contextType) { return []; }
    const action = contextType === 'course'
      ? CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM
      : CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM;
    return orderedOrgs.map((org) => ({
      action,
      scope: getOrgAggregateScopeKey(contextType, org),
    }));
  }, [orderedOrgs, contextType]);

  const { data: orgPerms } = useValidateUserPermissions(orgPermissionRequests);

  // Build a map of `org: has_permission`
  const orgHasPermission = useMemo(() => {
    const map: Record<string, boolean> = {};
    orderedOrgs.forEach((org, idx) => {
      map[org] = orgPerms?.[idx]?.allowed ?? false;
    });
    return map;
  }, [orderedOrgs, orgPerms]);

  return { hasPlatformPermission, orgHasPermission };
};

export default useScopePermissions;
