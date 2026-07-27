import { useMemo } from 'react';
import { useValidateUserPermissions } from '@src/data/hooks';
import { getOrgAggregateScopeKey, getPlatformAggregateScopeKey } from '@src/authz-module/constants';
import type { ContextType } from '@src/authz-module/constants';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from '@src/authz-module/roles-permissions';

// Stands in for the org slug on the platform-wide entry, which belongs to no org.
const PLATFORM_ORG_KEY = '*';

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
  // Every scope this hook validates, mapped back to the org it belongs to: the
  // platform-wide aggregate (course-v1:* / lib:*) plus one org-level aggregate per
  // org. Keyed by scope because that is what the API echoes back on each result.
  // Note: Using glob patterns (*:org:*)
  const orgByScope = useMemo(() => {
    if (!contextType) { return new Map<string, string>(); }
    return new Map<string, string>([
      [getPlatformAggregateScopeKey(contextType as ContextType), PLATFORM_ORG_KEY],
      ...orderedOrgs.map((org) => (
        [getOrgAggregateScopeKey(contextType as ContextType, org), org] as [string, string]
      )),
    ]);
  }, [orderedOrgs, contextType]);

  // Validate them all in a single request. Building the payload from the keys keeps
  // the org slugs out of it; `action` is the same for every scope.
  const permissionRequests = useMemo(() => {
    const action = contextType === 'course'
      ? CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM
      : CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM;
    return Array.from(orgByScope.keys(), (scope) => ({ action, scope }));
  }, [orgByScope, contextType]);

  const { data: perms } = useValidateUserPermissions(permissionRequests);

  // Results are matched by the `scope` the API echoes back. Orgs are seeded to `false` first
  // so any scope the response omits stays denied.
  return useMemo(() => {
    const orgHasPermission: Record<string, boolean> = {};
    orgByScope.forEach((org) => {
      if (org !== PLATFORM_ORG_KEY) { orgHasPermission[org] = false; }
    });
    let hasPlatformPermission = false;
    perms?.forEach(({ scope, allowed }) => {
      const org = scope === undefined ? undefined : orgByScope.get(scope);
      if (org === PLATFORM_ORG_KEY) {
        hasPlatformPermission = allowed;
      } else if (org !== undefined) {
        orgHasPermission[org] = allowed;
      }
    });
    return { hasPlatformPermission, orgHasPermission };
  }, [orgByScope, perms]);
};

export default useScopePermissions;
