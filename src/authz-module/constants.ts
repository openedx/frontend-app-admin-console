import type { ContextType } from '@src/types';
import { allRolesMetadata } from './roles-permissions';

const ORG_AGGREGATE_SCOPE_BUILDERS: Record<ContextType, (orgSlug: string) => string> = {
  course: (orgSlug: string) => `course-v1:${orgSlug}+*`,
  library: (orgSlug: string) => `lib:${orgSlug}:*`,
};

export const getOrgAggregateScopeKey = (contextType: string, orgSlug: string): string => {
  const builder = ORG_AGGREGATE_SCOPE_BUILDERS[contextType];
  if (!builder) { throw new Error(`Unknown contextType: "${contextType}"`); }
  return builder(orgSlug);
};

export const getScopeContextType = (scope: string): ContextType => (scope.startsWith('lib') ? 'library' : 'course');

export const DEFAULT_TOAST_DELAY = 5000;
export const RETRY_TOAST_DELAY = 120_000; // 2 minutes

export const ROUTES = {
  HOME_PATH: '/authz',
  AUDIT_USER_PATH: '/user/:username',
  ASSIGN_ROLE_WIZARD_PATH: '/assign-role',
};

export const buildUserPath = (username: string) => `${ROUTES.HOME_PATH}${ROUTES.AUDIT_USER_PATH.replace(':username', encodeURIComponent(username))}`;

export const buildWizardPath = (options?: { users?: string; from?: string }) => {
  const base = `${ROUTES.HOME_PATH}${ROUTES.ASSIGN_ROLE_WIZARD_PATH}`;
  if (!options) { return base; }
  const params = new URLSearchParams();
  if (options.users) { params.set('users', options.users); }
  if (options.from) { params.set('from', options.from); }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
};

export const MAX_TABLE_FILTERS_APPLIED = 10;

// Role data received from the API uses the dotted format for Django-managed roles.
export const SUPERUSER_ROLE = 'django.superuser';
export const GLOBAL_STAFF_ROLE = 'django.staff';
export const DJANGO_MANAGED_ROLES = [SUPERUSER_ROLE, GLOBAL_STAFF_ROLE];

export const MAP_ROLE_KEY_TO_LABEL: Record<string, string> = {
  ...Object.fromEntries(allRolesMetadata.map((meta) => [meta.role, meta.name])),
  [SUPERUSER_ROLE]: 'Super Admin',
  [GLOBAL_STAFF_ROLE]: 'Global Staff',
};

export const TABLE_DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_FILTER_PAGE_SIZE = 5;
export const ADMIN_ROLES = ['course_admin', 'library_admin'];

// Resource Type Definitions
export const CONTEXT_TYPES = {
  LIBRARY: 'library',
  COURSE: 'course',
} as const;
