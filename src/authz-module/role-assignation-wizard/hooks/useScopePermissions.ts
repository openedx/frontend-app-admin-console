import { useMemo } from 'react';
import { useValidateUserPermissions } from '@src/data/hooks';
import { useOrgs } from '@src/authz-module/data/hooks';
import { CONTENT_LIBRARY_PERMISSIONS, CONTENT_COURSE_PERMISSIONS } from '../../constants';

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
  const { data } = useOrgs();
  const organizations = useMemo(() => data?.results ?? [], [data]);

  // Build permission validation requests for platform-wide check
  // Note: Using glob patterns (*:org:*)
  const platformCoursePermissionRequests = useMemo(
    () => organizations?.map((org) => ({
      action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM,
      scope: `course-v1:${org.shortName}+*`,
    })) ?? [],
    [organizations],
  );

  const platformLibraryPermissionRequests = useMemo(
    () => organizations?.map((org) => ({
      action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM,
      scope: `lib:${org.shortName}:*`,
    })) ?? [],
    [organizations],
  );

  const { data: coursePlatformPerms } = useValidateUserPermissions(platformCoursePermissionRequests);
  const { data: libraryPlatformPerms } = useValidateUserPermissions(platformLibraryPermissionRequests);

  // Platform-wide permission = user has permission for ALL organizations
  const hasPlatformCoursePermission = coursePlatformPerms?.every((p) => p.allowed) ?? false;
  const hasPlatformLibraryPermission = libraryPlatformPerms?.every((p) => p.allowed) ?? false;

  const hasPlatformPermission = contextType === 'course'
    ? hasPlatformCoursePermission
    : hasPlatformLibraryPermission;

  // Validate per-organization permissions for org-level aggregate options
  // Note: Using glob patterns (*:org:*)
  const orgPermissionRequests = useMemo(() => {
    if (!orderedOrgs.length) { return []; }
    const action = contextType === 'course'
      ? CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM
      : CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM;
    return orderedOrgs.map((org) => ({
      action,
      scope: contextType === 'course' ? `course-v1:${org}+*` : `lib:${org}:*`,
    }));
  }, [orderedOrgs, contextType]);

  const { data: orgPerms } = useValidateUserPermissions(orgPermissionRequests);

  // Build a map of org -> has permission
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
