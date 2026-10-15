import { useMemo } from 'react';
import { useValidateUserPermissions } from '@src/data/hooks';
import {
  getOrgAggregateScopeKey, getPlatformAggregateScopeKey, SCOPE_TYPES,
} from '@src/authz-module/constants';
import {
  CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS,
} from '@src/authz-module/roles-permissions';

interface UseScopePermissionsParams {
  scopeType: string | undefined;
  orderedOrgs: string[];
}

interface UseScopePermissionsResult {
  hasPlatformPermission: boolean;
  orgHasPermission: Record<string, boolean>;
}

const useScopePermissions = ({
  scopeType,
  orderedOrgs,
}: UseScopePermissionsParams): UseScopePermissionsResult => {
  // Validate the platform-wide aggregate (course-v1:* / lib:*) and one org-level
  // aggregate (course-v1:Org+* / lib:Org:*) per org in a single request; `action`
  // is the same for every scope.

  // 1. Build the API request payload
  const permissionRequests = useMemo(() => {
    if (!scopeType) return [];

    const action = scopeType === SCOPE_TYPES.COURSE
      ? CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM
      : CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM;

    const platformRequest = { action, scope: getPlatformAggregateScopeKey(scopeType) };
    const orgRequests = orderedOrgs.map((org) => ({
      action,
      scope: getOrgAggregateScopeKey(scopeType, org),
    }));

    return [platformRequest, ...orgRequests];
  }, [orderedOrgs, scopeType]);

  const { data: perms } = useValidateUserPermissions(permissionRequests);

  // 2. Create a lightweight index for fast lookups
  // Indexed by the `scope` the API echoes back on each result.
  const allowedByScope = useMemo(() => {
    const byScope: Record<string, boolean> = Object.create(null);
    perms?.forEach(({ scope, allowed }) => {
      if (scope !== undefined) byScope[scope] = allowed;
    });
    return byScope;
  }, [perms]);

  // 3. Extract platform-wide permission
  const hasPlatformPermission = !!scopeType
    && (allowedByScope[getPlatformAggregateScopeKey(scopeType)] ?? false);

  // 4. Map permissions back to the requested Orgs
  const orgHasPermission = useMemo(() => {
    const result: Record<string, boolean> = {};
    if (scopeType) {
      orderedOrgs.forEach((org) => {
        const scope = getOrgAggregateScopeKey(scopeType, org);
        result[org] = allowedByScope[scope] ?? false;
      });
    }
    return result;
  }, [orderedOrgs, scopeType, allowedByScope]);

  return { hasPlatformPermission, orgHasPermission };
};

export default useScopePermissions;
