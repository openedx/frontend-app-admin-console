// Resource Type Definitions
export const CONTEXT_TYPES = {
  LIBRARY: 'library',
  COURSE: 'course',
} as const;

export type ContextType = typeof CONTEXT_TYPES[keyof typeof CONTEXT_TYPES];

const ORG_AGGREGATE_SCOPE_BUILDERS = {
  [CONTEXT_TYPES.COURSE]: (orgSlug: string) => `course-v1:${orgSlug}+*`,
  [CONTEXT_TYPES.LIBRARY]: (orgSlug: string) => `lib:${orgSlug}:*`,
};

export const getOrgAggregateScopeKey = (contextType: ContextType, orgSlug: string): string => {
  const builder = ORG_AGGREGATE_SCOPE_BUILDERS[contextType];
  if (!builder) { throw new Error(`Unknown contextType: "${contextType}"`); }
  return builder(orgSlug);
};

const PLATFORM_AGGREGATE_SCOPE_KEYS = {
  [CONTEXT_TYPES.COURSE]: 'course-v1:*',
  [CONTEXT_TYPES.LIBRARY]: 'lib:*',
};

export const getPlatformAggregateScopeKey = (contextType: ContextType): string => {
  const scope = PLATFORM_AGGREGATE_SCOPE_KEYS[contextType];
  if (!scope) { throw new Error(`Unknown contextType: "${contextType}"`); }
  return scope;
};

/** The `org` an assignment carries when it spans every organization. */
export const ALL_ORGS_KEY = '*';

/**
 * The kind of resource a scope points at, read from the scope key itself rather than from
 * the role that grants it, so it does not depend on role naming staying conventional.
 */
export const getScopeContextType = (scope: string): ContextType => (
  scope.startsWith('lib') ? CONTEXT_TYPES.LIBRARY : CONTEXT_TYPES.COURSE
);

/**
 * Tells whether a scope is one of the wildcard scopes, and which level it aggregates.
 *
 * Returns `null` for a scope pointing at a single course or library. The org slug is
 * needed to recognize an org-level aggregate, since its key embeds the slug.
 */
export const getAggregateScopeType = (scope: string, org?: string | null): 'platform' | 'org' | null => {
  const contextType = getScopeContextType(scope);
  if (scope === getPlatformAggregateScopeKey(contextType)) { return 'platform'; }
  if (org && scope === getOrgAggregateScopeKey(contextType, org)) { return 'org'; }
  return null;
};

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

/**
 * Cap on the assignments nested under each user in the team members table, sent as the
 * `assignments_limit` query param. The sub-table footer counts what actually came back.
 */
export const MAX_INLINE_ASSIGNMENTS = 3;

export const DEFAULT_FILTER_PAGE_SIZE = 5;
export const ADMIN_ROLES = ['course_admin', 'library_admin'];
