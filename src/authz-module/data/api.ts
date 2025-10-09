import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { LibraryMetadata, TeamMember } from '@src/types';
import { camelCaseObject } from '@edx/frontend-platform';
import { getApiUrl, getStudioApiUrl } from '@src/data/utils';

export interface GetTeamMembersResponse {
  members: TeamMember[];
  totalCount: number;
}

export type PermissionsByRole = {
  role: string;
  permissions: string[];
  userCount: number;
};

// TODO: replece api path once is created
export const getTeamMembers = async (object: string): Promise<TeamMember[]> => {
  const { data } = await getAuthenticatedHttpClient().get(getApiUrl(`/api/authz/v1/roles/users/?scope=${object}`));
  return camelCaseObject(data.results);
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
