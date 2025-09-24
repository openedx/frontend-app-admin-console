import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { LibraryMetadata, TeamMember } from '@src/authz-module/constants';
import { getLibrary, getTeamMembers } from './api';

/**
 * React Query hook to fetch all team members for a specific library.
 * It retrieves the full list of members who have access to the given library.
 *
 * @param libraryId - The unique identifier of the library
 *
 * @example
 * ```tsx
 * const { data: teamMembers, isLoading, isError } = useTeamMembers('lib:123');
 * ```
 */
export const useTeamMembers = (libraryId: string) => useQuery<TeamMember[], Error>({
  queryKey: ['team-members', libraryId],
  queryFn: () => getTeamMembers(libraryId),
  staleTime: 1000 * 60 * 30, // refetch after 30 minutes
});

/**
 * React Query hook to retrive the inforation of the current library.
 *
 * @param libraryId - The unique ID of the library.
 *
 * @example
 * const { data, isLoading, isError } = useLibrary('lib:123',);
 *
 */
export function useLibrary(libraryId: string) {
  return useSuspenseQuery<LibraryMetadata, Error>({
    queryKey: ['library-metadata', libraryId],
    queryFn: () => getLibrary(libraryId),
    retry: false,
  });
}
