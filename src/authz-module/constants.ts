// Scope types the console supports, as the authz API names them (the namespace of the scope keys).
export const SCOPE_TYPES = {
  COURSE: 'course-v1',
  LIBRARY: 'lib',
} as const;

export type ScopeType = typeof SCOPE_TYPES[keyof typeof SCOPE_TYPES];

// Permission the user needs to view the teams of each scope type, and so its catalog.
export const VIEW_TEAM_ACTIONS: Record<string, string> = {
  [SCOPE_TYPES.COURSE]: 'courses.view_course_team',
  [SCOPE_TYPES.LIBRARY]: 'content_libraries.view_library_team',
};

// Permission the user needs to manage the teams of each scope type, and so assign its roles.
export const MANAGE_TEAM_ACTIONS: Record<string, string> = {
  [SCOPE_TYPES.COURSE]: 'courses.manage_course_team',
  [SCOPE_TYPES.LIBRARY]: 'content_libraries.manage_library_team',
};

// Validate/me requests for those permissions. Every consumer sends them in the same order
// (libraries first), so they share one query.
export const VIEW_TEAM_PERMISSIONS: { action: string }[] = [
  { action: VIEW_TEAM_ACTIONS[SCOPE_TYPES.LIBRARY] },
  { action: VIEW_TEAM_ACTIONS[SCOPE_TYPES.COURSE] },
];

export const MANAGE_TEAM_PERMISSIONS: { action: string }[] = [
  { action: MANAGE_TEAM_ACTIONS[SCOPE_TYPES.LIBRARY] },
  { action: MANAGE_TEAM_ACTIONS[SCOPE_TYPES.COURSE] },
];

const ORG_AGGREGATE_SCOPE_BUILDERS: Record<string, (orgSlug: string) => string> = {
  [SCOPE_TYPES.COURSE]: (orgSlug: string) => `course-v1:${orgSlug}+*`,
  [SCOPE_TYPES.LIBRARY]: (orgSlug: string) => `lib:${orgSlug}:*`,
};

export const getOrgAggregateScopeKey = (scopeType: string, orgSlug: string): string => {
  const builder = ORG_AGGREGATE_SCOPE_BUILDERS[scopeType];
  if (!builder) throw new Error(`Unknown scopeType: "${scopeType}"`);
  return builder(orgSlug);
};

const PLATFORM_AGGREGATE_SCOPE_KEYS: Record<string, string> = {
  [SCOPE_TYPES.COURSE]: 'course-v1:*',
  [SCOPE_TYPES.LIBRARY]: 'lib:*',
};

export const getPlatformAggregateScopeKey = (scopeType: string): string => {
  const scope = PLATFORM_AGGREGATE_SCOPE_KEYS[scopeType];
  if (!scope) throw new Error(`Unknown scopeType: "${scopeType}"`);
  return scope;
};

/** The `org` an assignment carries when it spans every organization. */
export const ALL_ORGS_KEY = '*';

/**
 * The scope type a scope belongs to, read from the scope key itself rather than from the role
 * that grants it, so it does not depend on role naming staying conventional. Unrecognised scopes
 * fall back to courses.
 */
export const getScopeType = (scope: string): ScopeType => (
  scope.startsWith(SCOPE_TYPES.LIBRARY) ? SCOPE_TYPES.LIBRARY : SCOPE_TYPES.COURSE
);

/**
 * Tells whether a scope is one of the wildcard scopes, and which level it aggregates.
 *
 * Returns `null` for a scope pointing at a single course or library. The org slug is
 * needed to recognize an org-level aggregate, since its key embeds the slug.
 */
export const getAggregateScopeType = (scope: string, org?: string | null): 'platform' | 'org' | null => {
  const scopeType = getScopeType(scope);
  if (scope === getPlatformAggregateScopeKey(scopeType)) {
    return 'platform';
  }
  if (org && scope === getOrgAggregateScopeKey(scopeType, org)) {
    return 'org';
  }
  return null;
};

export const DEFAULT_TOAST_DELAY = 5000;
export const RETRY_TOAST_DELAY = 120_000; // 2 minutes

/** Absolute base path of the module; src/routes.tsx derives its route prefix from this. */
export const AUTHZ_HOME_PATH = '/admin-console/authz';

/** Segments nested under the authz splat route, relative to AUTHZ_HOME_PATH. */
export const ROUTES = {
  AUDIT_USER_PATH: 'user/:username',
  ASSIGN_ROLE_WIZARD_PATH: 'assign-role',
};

export const buildAuditUserPath = (username: string) => `${AUTHZ_HOME_PATH}/user/${encodeURIComponent(username)}`;

export const buildWizardPath = (options?: { users?: string; from?: string }) => {
  const base = `${AUTHZ_HOME_PATH}/${ROUTES.ASSIGN_ROLE_WIZARD_PATH}`;
  if (!options) return base;
  const params = new URLSearchParams();
  if (options.users) params.set('users', options.users);
  if (options.from) params.set('from', options.from);
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
