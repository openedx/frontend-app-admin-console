import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  LibraryMetadata, Org, Scope, TeamMember,
  UserRole,
} from '@src/types';
import { camelCaseObject } from '@edx/frontend-platform';
import { getApiUrl, getStudioApiUrl } from '@src/data/utils';

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

export interface GetTeamMembersResponse {
  results: TeamMember[];
  count: number;
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

export type PermissionsByRole = {
  role: string;
  permissions: string[];
  userCount: number;
};
export interface PutAssignTeamMembersRoleResponse {
  completed: { userIdentifier: string; status: string }[];
  errors: { userIdentifier: string; scope: string; error: string }[];
}

export interface AssignTeamMembersRoleRequest {
  users: string[];
  role: string;
  scopes: string[];
}

export interface GetAllRoleAssignmentsResponse {
  results: UserRole[];
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

export const getTeamMembers = async (object: string, querySettings: QuerySettings): Promise<GetTeamMembersResponse> => {
  const url = new URL(getApiUrl(`/api/authz/v1/roles/users/?scope=${object}`));

  if (querySettings.roles) {
    url.searchParams.set('roles', querySettings.roles);
  }
  if (querySettings.search) {
    url.searchParams.set('search', querySettings.search);
  }
  if (querySettings.sortBy && querySettings.order) {
    url.searchParams.set('sort_by', querySettings.sortBy);
    url.searchParams.set('order', querySettings.order);
  }
  url.searchParams.set('page_size', querySettings.pageSize.toString());
  url.searchParams.set('page', (querySettings.pageIndex + 1).toString());

  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data);
};

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

// TODO: this should be replaced in the future with Console API
export const getLibrary = async (libraryId: string): Promise<LibraryMetadata> => {
  const { data } = await getAuthenticatedHttpClient().get(getStudioApiUrl(`/api/libraries/v2/${libraryId}/`));
  return {
    id: data.id,
    org: data.org,
    title: data.title,
    slug: data.slug,
    allowPublicRead: data.allow_public_read,
  };
};

export const getPermissionsByRole = async (scope: string): Promise<PermissionsByRole[]> => {
  const url = new URL(getApiUrl('/api/authz/v1/roles/'));
  url.searchParams.append('scope', scope);
  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data.results);
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

export const getAllRoleAssignments = async (querySettings: QuerySettings)
: Promise<GetAllRoleAssignmentsResponse> => {
  const url = new URL(getApiUrl('/api/authz/v1/assignments/'));

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
