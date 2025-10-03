import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { appId } from '@src/constants';
import { LibraryMetadata, TeamMember } from '@src/types';
import {
  getLibrary, getPermissionsByRole, getTeamMembers, PermissionsByRole, QuerySettings,
} from './api';

const authzQueryKeys = {
  all: [appId, 'authz'] as const,
  teamMembers: (object: string, querySettings: QuerySettings) => [
    ...authzQueryKeys.all,
    'teamMembers',
    object,
    querySettings.roles,
    querySettings.search,
    querySettings.ordering,
    querySettings.pageSize,
    querySettings.pageIndex,
  ] as const,
  permissionsByRole: (scope: string) => [...authzQueryKeys.all, 'permissionsByRole', scope] as const,
  library: (libraryId: string) => [...authzQueryKeys.all, 'library', libraryId] as const,
};

/**
 * React Query hook to fetch all team members for a specific object/scope.
 * It retrieves the full list of members who have access to the given scope.
 *
 * @param object - The unique identifier of the object/scope
 * @param querySettings - Optional query parameters for filtering, sorting, and pagination
 *
 * @example
 * ```tsx
 * const { data: teamMembers, isLoading, isError } = useTeamMembers('lib:123', querySettings);
 * ```
 */
export const useTeamMembers = (object: string, querySettings: QuerySettings) => {
  const queryKey = authzQueryKeys.teamMembers(object, querySettings);

  return useQuery<TeamMember[], Error>({
    queryKey,
    queryFn: () => getTeamMembers(object, querySettings),
    staleTime: 1000 * 60 * 5,
    enabled: !!object,
    refetchOnWindowFocus: false,
  });
};

/**
 * React Query hook to fetch all the roles for the specific object/scope.
 * It retrieves the full list of roles with the corresponding permissions.
 *
 * @param scope - The unique identifier of the object/scope
 *
 * @example
 * ```tsx
 * const { data: roles, isLoading, isError } = useTeamMembers('lib:123');
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
