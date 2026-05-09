const ORG_AGGREGATE_SCOPE_BUILDERS = {
  course: (orgSlug: string) => `course-v1:${orgSlug}+*`,
  library: (orgSlug: string) => `lib:${orgSlug}:*`,
};

export const getOrgAggregateScopeKey = (contextType: string, orgSlug: string): string => {
  const builder = ORG_AGGREGATE_SCOPE_BUILDERS[contextType];
  if (!builder) { throw new Error(`Unknown contextType: "${contextType}"`); }
  return builder(orgSlug);
};

export const DEFAULT_TOAST_DELAY = 5000;
export const RETRY_TOAST_DELAY = 120_000; // 2 minutes
export const SKELETON_ROWS = Array.from({ length: 10 }).map(() => ({
  username: 'skeleton',
  name: '',
  email: '',
  roles: [],
}));

export const ROUTES = {
  HOME_PATH: '/authz',
  AUDIT_USER_PATH: '/user/:username',
  ASSIGN_ROLE_WIZARD_PATH: '/assign-role',
};

export const buildWizardPath = (options?: { users?: string; from?: string }) => {
  const base = `${ROUTES.HOME_PATH}${ROUTES.ASSIGN_ROLE_WIZARD_PATH}`;
  if (!options) { return base; }
  const params = new URLSearchParams();
  if (options.users) { params.set('users', options.users); }
  if (options.from) { params.set('from', options.from); }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
};

export enum RoleOperationErrorStatus {
  USER_NOT_FOUND = 'user_not_found',
  USER_ALREADY_HAS_ROLE = 'user_already_has_role',
  USER_DOES_NOT_HAVE_ROLE = 'user_does_not_have_role',
  ROLE_ASSIGNMENT_ERROR = 'role_assignment_error',
  ROLE_REMOVAL_ERROR = 'role_removal_error',
}

export const MAX_TABLE_FILTERS_APPLIED = 10;

export const AUTHZ_HOME_PATH = '/authz';

export const MAP_ROLE_KEY_TO_LABEL: Record<string, string> = {
  library_admin: 'Library Admin',
  library_author: 'Library Author',
  library_contributor: 'Library Contributor',
  library_user: 'Library User',
  course_admin: 'Course Admin',
  course_staff: 'Course Staff',
  course_editor: 'Course Editor',
  course_auditor: 'Course Auditor',
  'django.superuser': 'Super Admin',
  'django.globalstaff': 'Global Staff',
};

export const DJANGO_MANAGED_ROLES = ['django.superuser', 'django.globalstaff'];

export const TABLE_DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_FILTER_PAGE_SIZE = 5;
export const ADMIN_ROLES = ['course_admin', 'library_admin'];

// Resource Type Definitions
export const RESOURCE_TYPES = {
  LIBRARY: 'library',
  COURSE: 'course',
} as const;

export type ResourceType = typeof RESOURCE_TYPES[keyof typeof RESOURCE_TYPES];
