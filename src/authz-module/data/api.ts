import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { LibraryMetadata, TeamMember } from '@src/types';
import { camelCaseObject } from '@edx/frontend-platform';
import { getApiUrl, getStudioApiUrl } from '@src/data/utils';

export interface QuerySettings {
  roles: string | null;
  search: string | null;
  ordering: string | null;
  pageSize: number;
  pageIndex: number;
}

export interface GetTeamMembersResponse {
  members: TeamMember[];
  totalCount: number;
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

// TODO: replece api path once is created
export const getTeamMembers = async (object: string, querySettings: QuerySettings): Promise<TeamMember[]> => {
  const url = new URL(getApiUrl(`/api/authz/v1/roles/users/?scope=${object}`));

  if (querySettings.roles) {
    url.searchParams.set('roles', querySettings.roles);
  }
  if (querySettings.search) {
    url.searchParams.set('search', querySettings.search);
  }
  if (querySettings.ordering) {
    url.searchParams.set('ordering', querySettings.ordering);
  }
  url.searchParams.set('page_size', querySettings.pageSize.toString());
  url.searchParams.set('page', (querySettings.pageIndex + 1).toString());

  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data.results);
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
  };
};

export const getPermissionsByRole = async (scope: string): Promise<PermissionsByRole[]> => {
  const url = new URL(getApiUrl('/api/authz/v1/roles/'));
  url.searchParams.append('scope', scope);
  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data.results);
};
