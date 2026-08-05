import type { RoleMetadata } from '@src/types';
import { CONTENT_COURSE_PERMISSIONS, courseRolesMetadata as _courseRolesMetadata } from './course/constants';
import { CONTENT_LIBRARY_PERMISSIONS, libraryRolesMetadata as _libraryRolesMetadata } from './library/constants';

export {
  CONTENT_LIBRARY_PERMISSIONS,
  libraryResourceTypes,
  libraryPermissions,
  libraryRolesMetadata,
  libraryRolesWithPermissions,
} from './library/constants';

export const LIBRARY_ROLE_KEYS = _libraryRolesMetadata.map((r) => r.role).join(',');

export {
  CONTENT_COURSE_PERMISSIONS,
  courseResourceTypes,
  coursePermissions,
  courseRolesWithPermissions,
  courseRolesMetadata,
} from './course/constants';

export const MANAGE_TEAM_PERMISSIONS: { action: string }[] = [
  { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM },
  { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM },
];

export const VIEW_TEAM_PERMISSIONS: { action: string }[] = [
  { action: CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM },
  { action: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM },
];
export const allRolesMetadata: RoleMetadata[] = [..._courseRolesMetadata, ..._libraryRolesMetadata];

// Role data received from the API uses the dotted format for Django-managed roles.
export const SUPERUSER_ROLE = 'django.superuser';
export const GLOBAL_STAFF_ROLE = 'django.staff';
export const DJANGO_MANAGED_ROLES = [SUPERUSER_ROLE, GLOBAL_STAFF_ROLE];

export const ADMIN_ROLES = ['course_admin', 'library_admin'];

export const MAP_ROLE_KEY_TO_LABEL: Record<string, string> = {
  ...Object.fromEntries(allRolesMetadata.map((meta) => [meta.role, meta.name])),
  [SUPERUSER_ROLE]: 'Super Admin',
  [GLOBAL_STAFF_ROLE]: 'Global Staff',
};

export { buildPermissionMatrixByResource, getPermissionMetadata } from './utils';
