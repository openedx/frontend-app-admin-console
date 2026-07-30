import { useMemo } from 'react';
import { useValidateUserPermissions } from '@src/data/hooks';
import { getOrgAggregateScopeKey, getPlatformAggregateScopeKey } from '@src/authz-module/constants';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from '@src/authz-module/roles-permissions';
import type { ContextType } from '@src/types';

interface UseScopePermissionsParams {
  contextType: ContextType | undefined;
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
  // Validate the platform-wide aggregate (course-v1:* / lib:*) and one org-level
  // aggregate (course-v1:Org+* / lib:Org:*) per org in a single request; `action`
  // is the same for every scope.
  const typedContext = contextType as ContextType;

  // 1. Build the API request payload
  const permissionRequests = useMemo(() => {
    if (!typedContext) { return []; }

    const action = typedContext === 'course'
      ? CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM
      : CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM;

    const platformRequest = { action, scope: getPlatformAggregateScopeKey(typedContext) };
    const orgRequests = orderedOrgs.map((org) => ({
      action,
      scope: getOrgAggregateScopeKey(typedContext, org),
    }));

    return [platformRequest, ...orgRequests];
  }, [orderedOrgs, typedContext]);

  const { data: perms } = useValidateUserPermissions(permissionRequests);

  // 2. Create a lightweight index for fast lookups
  // Indexed by the `scope` the API echoes back on each result.
  const allowedByScope = useMemo(() => {
    const byScope: Record<string, boolean> = Object.create(null);
    perms?.forEach(({ scope, allowed }) => {
      if (scope !== undefined) { byScope[scope] = allowed; }
    });
    return byScope;
  }, [perms]);

  // 3. Extract platform-wide permission
  const hasPlatformPermission = !!typedContext
    && (allowedByScope[getPlatformAggregateScopeKey(typedContext)] ?? false);

  // 4. Map permissions back to the requested Orgs
  const orgHasPermission = useMemo(() => {
    const result: Record<string, boolean> = {};
    if (typedContext) {
      orderedOrgs.forEach((org) => {
        const scope = getOrgAggregateScopeKey(typedContext, org);
        result[org] = allowedByScope[scope] ?? false;
      });
    }
    return result;
  }, [orderedOrgs, typedContext, allowedByScope]);

  return { hasPlatformPermission, orgHasPermission };
};

export default useScopePermissions;
