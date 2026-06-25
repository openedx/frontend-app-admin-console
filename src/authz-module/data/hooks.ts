import {
  useInfiniteQuery, useMutation, useQuery, useQueryClient,
} from '@tanstack/react-query';
import { appId } from '@src/constants';
import {
  assignTeamMembersRole, AssignTeamMembersRoleRequest, getAllRoleAssignments,
  GetAllRoleAssignmentsResponse, getOrgs, GetOrgsResponse,
  getScopes, GetScopesResponse, QuerySettings, revokeUserRoles,
  RevokeUserRolesRequest, getUserAssignedRoles, GetUserAssignmentsResponse,
  validateUsers, ValidateUsersRequest, GetScopesParams,
} from './api';

const authzQueryKeys = {
  all: [appId, 'authz'] as const,
  allRoleAssignments: (querySettings?: QuerySettings) => [...authzQueryKeys.all, 'allRoleAssignments', querySettings] as const,
  orgs: (search?: string, page?: number, pageSize?: number) => [...authzQueryKeys.all, 'organizations', search, page, pageSize] as const,
  scopes: (params?: Omit<GetScopesParams, 'page'>) => [...authzQueryKeys.all, 'scopes', params] as const,
  userRoles: (username?: string, querySettings?: QuerySettings) => [...authzQueryKeys.all, 'userRoles', username, querySettings] as const,
};

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
    onSettled: (_data, error) => {
      if (!error) {
        queryClient.invalidateQueries({ queryKey: [...authzQueryKeys.all, 'userRoles'] });
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.includes('allRoleAssignments'),
        });
      }
    },
  });
};

/**
 * React Query hook to validate users exist without assigning roles.
 * It checks if the provided usernames/email addresses are valid.
 *
 * @example
 * const { mutate: validateUsers } = useValidateUsers();
 * validateUsers({ data: { users: ['jdoe', 'jane@example.com'] } });
 */
export const useValidateUsers = () => useMutation({
  mutationFn: async ({ data }: {
    data: ValidateUsersRequest
  }) => validateUsers(data),
});

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
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes('userRoles'),
      });
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes('allRoleAssignments'),
      });
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
 * React Query hook to fetch a paginated, searchable list of organizations.
 * Results are cached for 30 minutes — suitable for both filter dropdowns and full listings.
 *
 * @param search - Optional text filter applied to organization names.
 * @param page - 1-based page number; defaults to the first page when omitted.
 * @param pageSize - Items per page; defaults to the API default when omitted.
 * @returns A `QueryResult<GetOrgsResponse>` with `results`, `count`, `next`, and `previous`.
 *
 * @example
 * ```tsx
 * const { data } = useOrgs('edX');
 * const orgs = data?.results ?? [];
 * ```
 */
export const useOrgs = (search?: string, page?: number, pageSize?: number) => useQuery<GetOrgsResponse, Error>({
  queryKey: authzQueryKeys.orgs(search, page, pageSize),
  queryFn: () => getOrgs(search, page, pageSize),
  staleTime: 1000 * 60 * 30,
  refetchOnWindowFocus: false,
});

/**
 * React Query hook to fetch a paginated, filterable list of scopes (courses or libraries).
 * Uses infinite query to support infinite scroll — call `fetchNextPage` to load more results.
 *
 * @param params - Filter parameters (all optional):
 *   - `search` — text filter applied to scope names
 *   - `scopeType` — filter by scope type (e.g. course, library)
 *   - `org` — filter by organization
 *   - `pageSize` — number of items per page
 *   - `managementPermissionOnly` — when true, returns only scopes the requester can manage
 * @returns An `InfiniteQueryResult` whose `data.pages` contains the accumulated `GetScopesResponse` pages.
 *
 * @example
 * ```tsx
 * const { data, fetchNextPage, hasNextPage } = useScopes({ search: 'intro', orgs: ['edX'] });
 * const scopes = data?.pages.flatMap((p) => p.results) ?? [];
 * ```
 */
export const useScopes = (params: Omit<GetScopesParams, 'page'> = {}) => useInfiniteQuery<GetScopesResponse, Error>({
  queryKey: authzQueryKeys.scopes(params),
  queryFn: ({ pageParam }) => getScopes({ ...params, page: pageParam as number }),
  getNextPageParam: (lastPage) => {
    if (!lastPage.next) { return undefined; }
    try {
      const nextUrl = new URL(lastPage.next);
      const page = nextUrl.searchParams.get('page');
      return page ? parseInt(page, 10) : undefined;
    } catch {
      return undefined;
    }
  },
  initialPageParam: 1,
  staleTime: 1000 * 60 * 5,
  refetchOnWindowFocus: false,
});

/*
  * React Query hook to fetch all the roles assigned to a specific user.
  * It retrieves the full list of roles with the corresponding permissions.
  * @param username - The username of the user
  * @param querySettings - Optional query parameters for filtering, sorting, and pagination
  *
  * @example
  * ```tsx
  * const { data: userRoles } = useUserAssignedRoles('jdoe', querySettings);
  * ```
*/
export const useUserAssignedRoles = (
  username?: string,
  querySettings?: QuerySettings,
) => useQuery<GetUserAssignmentsResponse, Error>({
  queryKey: authzQueryKeys.userRoles(username, querySettings),
  queryFn: () => getUserAssignedRoles(username, querySettings),
  staleTime: 1000 * 60 * 30, // refetch after 30 minutes
  enabled: !!username,
  refetchOnWindowFocus: false,
});
