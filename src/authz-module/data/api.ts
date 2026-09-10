import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  Org, Scope, TeamMember, UserRole,
} from '@src/types';
import { camelCaseObject } from '@edx/frontend-platform';
import { getApiUrl } from '@src/data/utils';

export interface QuerySettings {
  roles: string | null;
  scopes: string | null;
  organizations: string | null;
  search: string | null;
  order: string | null;
  sortBy: string | null;
  pageSize: number;
  pageIndex: number;
}

export interface GetUserAssignmentsResponse {
  results: UserRole[];
  count: number;
  next: string | null;
  previous: string | null;
}

export type RevokeUserRolesRequest = {
  users: string;
  role: string;
  scope: string;
  querySettings?: QuerySettings;
};

export interface DeleteRevokeUserRolesResponse {
  completed: {
    userIdentifiers: string;
    status: string;
  }[],
  errors: {
    userIdentifiers: string;
    error: string;
  }[],
}

export interface PutAssignTeamMembersRoleResponse {
  completed: { userIdentifier: string; status: string }[];
  errors: { userIdentifier: string; scope: string; error: string }[];
}

export interface AssignTeamMembersRoleRequest {
  users: string[];
  role: string;
  scopes: string[];
}

export interface GetTeamMembersAssignmentsResponse {
  results: TeamMember[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface GetOrgsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results:Array<Org>;
}

export interface GetScopesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results:Array<Scope>;
}
export type ValidateUsersRequest = {
  users: string[];
};

export type ValidateUsersResponse = {
  validUsers: string[];
  invalidUsers: string[];
  summary: {
    total: number;
    validCount: number;
    invalidCount: number;
  };
};

export interface GetScopesParams {
  scopeType?: string;
  search?: string;
  orgs?: string[];
  page?: number;
  pageSize?: number;
  managementPermissionOnly?: boolean;
}

export interface WaffleFlagOverrides {
  on: string[];
  off: string[];
}

/**
 * Enablement state of the course-authoring waffle flag across scopes.
 * `orgOverrides`/`courseOverrides` list the org short names / course ids whose
 * override differs from `global` (explicitly forced `on` or `off`).
 */
export interface CourseAuthoringFlagStates {
  global: boolean;
  orgOverrides: WaffleFlagOverrides;
  courseOverrides: WaffleFlagOverrides;
}

export const assignTeamMembersRole = async (
  data: AssignTeamMembersRoleRequest,
): Promise<PutAssignTeamMembersRoleResponse> => {
  const res = await getAuthenticatedHttpClient().put(getApiUrl('/api/authz/v1/roles/users/'), data);
  return camelCaseObject(res.data);
};

export const validateUsers = async (
  data: ValidateUsersRequest,
): Promise<ValidateUsersResponse> => {
  const res = await getAuthenticatedHttpClient().post(
    getApiUrl('/api/authz/v1/users/validate/'),
    data,
  );
  return camelCaseObject(res.data);
};

export const revokeUserRoles = async (
  data: RevokeUserRolesRequest,
): Promise<DeleteRevokeUserRolesResponse> => {
  const url = new URL(getApiUrl('/api/authz/v1/roles/users/'));
  url.searchParams.append('users', data.users);
  url.searchParams.append('role', data.role);
  url.searchParams.append('scope', data.scope);

  // If this is not transformed to string, it shows a 404 with the token CSRF acquisition request
  const res = await getAuthenticatedHttpClient().delete(url.toString());
  return camelCaseObject(res.data);
};

/**
 * Fetches team members grouped by user: one entry per user carrying up to
 * `assignmentsLimit` of their role assignments plus their absolute `assignmentCount`.
 *
 * Filters decide which users come back; they do not trim each user's nested
 * `assignments` array, and `assignmentCount` always reflects the user's full total.
 */
export const getTeamMembersAssignments = async (querySettings: QuerySettings, assignmentsLimit: number)
: Promise<GetTeamMembersAssignmentsResponse> => {
  const url = new URL(getApiUrl('/api/authz/v1/users/'));

  if (querySettings.roles) {
    url.searchParams.set('roles', querySettings.roles);
  }
  if (querySettings.scopes) {
    url.searchParams.set('scopes', querySettings.scopes);
  }
  if (querySettings.organizations) {
    url.searchParams.set('orgs', querySettings.organizations);
  }
  if (querySettings.search) {
    url.searchParams.set('search', querySettings.search);
  }
  if (querySettings.sortBy && querySettings.order) {
    url.searchParams.set('sort_by', querySettings.sortBy);
    url.searchParams.set('order', querySettings.order);
  }
  url.searchParams.set('assignments_limit', assignmentsLimit.toString());
  url.searchParams.set('page_size', querySettings.pageSize.toString());
  url.searchParams.set('page', (querySettings.pageIndex + 1).toString());

  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data);
};

export const getOrgs = async (search?: string, page?: number, pageSize?: number): Promise<GetOrgsResponse> => {
  const url = new URL(getApiUrl('/api/authz/v1/orgs/'));
  if (search !== undefined) {
    url.searchParams.set('search', search);
  }
  if (page !== undefined) {
    url.searchParams.set('page', page.toString());
  }
  if (pageSize !== undefined) {
    url.searchParams.set('page_size', pageSize.toString());
  }
  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data);
};

export const getScopes = async (params: GetScopesParams): Promise<GetScopesResponse> => {
  const url = new URL(getApiUrl('/api/authz/v1/scopes/'));
  if (params.search) { url.searchParams.set('search', params.search); }
  if (params.scopeType) { url.searchParams.set('scope_type', params.scopeType); }
  if (params.orgs?.length) { url.searchParams.set('orgs', params.orgs.join(',')); }
  if (params.managementPermissionOnly) { url.searchParams.set('management_permission_only', 'true'); }
  url.searchParams.set('page', (params.page ?? 1).toString());
  url.searchParams.set('page_size', (params.pageSize ?? 10).toString());
  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data);
};

export const getCourseAuthoringFlagStates = async (): Promise<CourseAuthoringFlagStates> => {
  const { data } = await getAuthenticatedHttpClient().get(getApiUrl('/api/authz/v1/waffle-flag-states/'));
  return camelCaseObject(data);
};

export const getUserAssignedRoles = async (username?: string, querySettings?: QuerySettings)
: Promise<GetUserAssignmentsResponse> => {
  const url = new URL(getApiUrl(`/api/authz/v1/users/${username}/assignments/`));

  if (querySettings?.roles) {
    url.searchParams.set('roles', querySettings.roles);
  }
  if (querySettings?.organizations) {
    url.searchParams.set('orgs', querySettings.organizations);
  }
  if (querySettings?.search) {
    url.searchParams.set('search', querySettings.search);
  }
  if (querySettings?.sortBy && querySettings?.order) {
    url.searchParams.set('sort_by', querySettings.sortBy);
    url.searchParams.set('order', querySettings?.order || '');
  }
  url.searchParams.set('page_size', querySettings?.pageSize?.toString() || '');
  url.searchParams.set('page', ((querySettings?.pageIndex ?? 0) + 1).toString());

  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data);
};
