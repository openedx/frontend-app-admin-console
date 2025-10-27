import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { LibraryMetadata, TeamMember } from '@src/types';
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform';
import { getApiUrl, getStudioApiUrl } from '@src/data/utils';

export interface QuerySettings {
  roles: string | null;
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

export type RevokeUserRolesRequest = {
  users: string;
  role: string;
  scope: string;
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
  completed: { user: string; status: string }[];
  errors: { userIdentifier: string; error: string }[];
}

export interface AssignTeamMembersRoleRequest {
  users: string[];
  role: string;
  scope: string;
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

export const updateLibrary = async (libraryId, updatedData): Promise<LibraryMetadata> => {
  const { data } = await getAuthenticatedHttpClient().patch(
    getStudioApiUrl(`/api/libraries/v2/${libraryId}/`),
    snakeCaseObject(updatedData),
  );
  return {
    id: data.id,
    org: data.org,
    title: data.title,
    slug: data.slug,
    allowPublicRead: data.allow_public_read,
  };
};
