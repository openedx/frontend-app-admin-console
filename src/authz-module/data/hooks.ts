import {
  useMutation, useQuery, useQueryClient, useSuspenseQuery,
} from '@tanstack/react-query';
import { appId } from '@src/constants';
import { LibraryMetadata } from '@src/types';
import {
  assignTeamMembersRole, AssignTeamMembersRoleRequest, getLibrary, getPermissionsByRole, getTeamMembers, 
  GetTeamMembersResponse, PermissionsByRole, QuerySettings,
} from './api';

const authzQueryKeys = {
  all: [appId, 'authz'] as const,
  teamMembersAll: (scope: string) => [...authzQueryKeys.all, 'teamMembers', scope] as const,
  teamMembers: (scope: string, querySettings?: QuerySettings) => [
    ...authzQueryKeys.teamMembersAll(scope), querySettings] as const,
  permissionsByRole: (scope: string) => [...authzQueryKeys.all, 'permissionsByRole', scope] as const,
  library: (libraryId: string) => [...authzQueryKeys.all, 'library', libraryId] as const,
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
    onSettled: (_data, _error, { data: { scope } }) => {
      queryClient.invalidateQueries({ queryKey: authzQueryKeys.teamMembers(scope) });
    },
  });
};
