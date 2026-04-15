import {
  useMutation, useQuery, useQueryClient, useSuspenseQuery,
} from '@tanstack/react-query';
import { appId } from '@src/constants';
import { LibraryMetadata } from '@src/types';
import {
  assignTeamMembersRole, AssignTeamMembersRoleRequest, getAllRoleAssignments,
  GetAllRoleAssignmentsResponse, getLibrary, getOrgs, GetOrgsResponse,
  getPermissionsByRole, getScopes, GetScopesResponse, getTeamMembers,
  GetTeamMembersResponse, PermissionsByRole, QuerySettings, revokeUserRoles,
  RevokeUserRolesRequest,
} from './api';

const authzQueryKeys = {
  all: [appId, 'authz'] as const,
  teamMembersAll: (scope: string) => [...authzQueryKeys.all, 'teamMembers', scope] as const,
  teamMembers: (scope: string, querySettings?: QuerySettings) => [
    ...authzQueryKeys.teamMembersAll(scope), querySettings] as const,
  permissionsByRole: (scope: string) => [...authzQueryKeys.all, 'permissionsByRole', scope] as const,
  library: (libraryId: string) => [...authzQueryKeys.all, 'library', libraryId] as const,
  allRoleAssignments: (querySettings?: QuerySettings) => [...authzQueryKeys.all, 'allRoleAssignments', querySettings] as const,
  orgs: (search?: string, page?: number, pageSize?: number) => [...authzQueryKeys.all, 'organizations', search, page, pageSize] as const,
  scopes: (search?: string, page?: number, pageSize?: number) => [...authzQueryKeys.all, 'scopes', search, page, pageSize] as const,
};

/**
 * React Query hook to fetch all team members for a specific object/scope.
 * It retrieves the full list of members who have access to the given scope.
 *
 * @param scope - The unique identifier of the object/scope
 * @param querySettings - Optional query parameters for filtering, sorting, and pagination
 *
 * @example
 * ```tsx
 * const { data: teamMembers, isLoading, isError } = useTeamMembers('lib:123', querySettings);
 * ```
 */
export const useTeamMembers = (scope: string, querySettings: QuerySettings) => useQuery<GetTeamMembersResponse, Error>({
  queryKey: authzQueryKeys.teamMembers(scope, querySettings),
  queryFn: () => getTeamMembers(scope, querySettings),
  staleTime: 1000 * 60 * 30, // refetch after 30 minutes
  refetchOnWindowFocus: false,
});

/**
 * React Query hook to fetch all the roles for the specific object/scope.
 * It retrieves the full list of roles with the corresponding permissions.
 *
 * @param scope - The unique identifier of the object/scope
 *
 * @example
 * ```tsx
 * const { data: roles } = usePermissionsByRole('lib:123');
 * ```
 */
export const usePermissionsByRole = (scope: string) => useSuspenseQuery<PermissionsByRole[], Error>({
  queryKey: authzQueryKeys.permissionsByRole(scope),
  queryFn: () => getPermissionsByRole(scope),
  retry: false,
});

/**
 * React Query hook to retrieve the information of the current library.
 *
 * @param libraryId - The unique ID of the library.
 *
 * @example
 * const { data } = useLibrary('lib:123',);
 *
 */
export const useLibrary = (libraryId: string) => useSuspenseQuery<LibraryMetadata, Error>({
  queryKey: authzQueryKeys.library(libraryId),
  queryFn: () => getLibrary(libraryId),
  retry: false,
});

/**
 * React Query hook to add new team members to a specific scope or manage the corresponding roles.
 * It provides a mutation function to add users with specified roles to the team or assign new roles.
 *
 * @example
 * const { mutate: assignTeamMembersRole } = useAssignTeamMembersRole();
 * assignTeamMembersRole({ data: { libraryId: 'lib:123', users: ['jdoe'], role: 'editor' } });
 */
export const useAssignTeamMembersRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: {
      data: AssignTeamMembersRoleRequest
    }) => assignTeamMembersRole(data),
    onSettled: (_data, error, { data: { scope } }) => {
      if (!error) {
        queryClient.invalidateQueries({ queryKey: authzQueryKeys.teamMembersAll(scope) });
        queryClient.invalidateQueries({ queryKey: authzQueryKeys.permissionsByRole(scope) });
      }
    },
  });
};

/**
 * React Query hook to remove roles for a specific team member within a scope.
 *
 * @example
 * const { mutate: revokeUserRoles } = useRevokeUserRoles();
 * revokeUserRoles({ data: { libraryId: 'lib:123', users: ['jdoe'], role: 'editor' } });
 */
export const useRevokeUserRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: {
      data: RevokeUserRolesRequest
    }) => revokeUserRoles(data),
    onSettled: (_data, _error, { data: { scope } }) => {
      queryClient.invalidateQueries({ queryKey: authzQueryKeys.teamMembersAll(scope) });
      queryClient.invalidateQueries({ queryKey: authzQueryKeys.permissionsByRole(scope) });
    },
  });
};

/**
 * React Query hook to fetch all role assignments across scopes and roles,
 * with support for filtering, sorting, and pagination.
 * It retrieves a comprehensive list of user-role assignments based
 * on the provided query settings.
 *
 * @param querySettings - Optional parameters for filtering by roles, scopes,
 * organizations, search term, sorting, and pagination.
 *
 * @example
 * const { data: roleAssignments } = useAllRoleAssignments({ roles: 'editor', pageSize: 20 });
 */
export const useAllRoleAssignments = (querySettings: QuerySettings) => {
  const result = useQuery<GetAllRoleAssignmentsResponse, Error>({
    queryKey: authzQueryKeys.allRoleAssignments(querySettings),
    queryFn: () => getAllRoleAssignments(querySettings),
    staleTime: 1000 * 60 * 30, // refetch after 30 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });
  return result;
};

/**
 * React query hook to fetch the list of organizations for the organization filter component.
 * @param search - The search term to filter organizations.
 * @returns The list of organizations matching the search term.
 */
export const useOrgs = (search?: string, page?: number, pageSize?: number) => {
  const result = useQuery<GetOrgsResponse, Error>({
    queryKey: authzQueryKeys.orgs(search, page, pageSize),
    queryFn: () => getOrgs(search, page, pageSize),
    refetchOnWindowFocus: false,
  });
  return result;
};

/*
  * React query hook to fetch the list of scopes for the scope filter component.
  * @param search - The search term to filter scopes.
  * @returns The list of scopes matching the search term.
  */
export const useScopes = (search?: string, page?: number, pageSize?: number) => {
  const result = useQuery<GetScopesResponse, Error>({
    queryKey: authzQueryKeys.scopes(search, page, pageSize),
    queryFn: () => getScopes(search, page, pageSize),
    refetchOnWindowFocus: false,
  });
  return result;
};
