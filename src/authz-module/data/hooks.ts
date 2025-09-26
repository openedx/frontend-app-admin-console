import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { appId } from "@src/constants";
import { LibraryMetadata, TeamMember } from '@src/types';
import { getLibrary, getTeamMembers } from './api';


const authzQueryKeys = {
  all: [appId, 'authz'] as const,
  teamMembers: (object: string) => [...authzQueryKeys.all, 'teamMembers', object] as const,
  library: (libraryId: string) => [...authzQueryKeys.all, 'library', libraryId] as const,
};

/**
 * React Query hook to fetch all team members for a specific object/scope.
 * It retrieves the full list of members who have access to the given scope.
 *
 * @param object - The unique identifier of the object/scope
 *
 * @example
 * ```tsx
 * const { data: teamMembers, isLoading, isError } = useTeamMembers('lib:123');
 * ```
 */
export const useTeamMembers = (object: string) => useQuery<TeamMember[], Error>({
  queryKey: authzQueryKeys.teamMembers(object),
  queryFn: () => getTeamMembers(object),
  staleTime: 1000 * 60 * 30, // refetch after 30 minutes
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
export const useLibrary = (libraryId: string) => {
  return useSuspenseQuery<LibraryMetadata, Error>({
    queryKey: authzQueryKeys.library(libraryId),
    queryFn: () => getLibrary(libraryId),
    retry: false,
  });
}
