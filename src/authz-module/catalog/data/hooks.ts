import { useCallback, useMemo } from 'react';
import { keepPreviousData, QueryClient, useQuery } from '@tanstack/react-query';
import { usePermissions } from '@openedx/frontend-base';
import { appId } from '@src/constants';
import { SCOPE_TYPES, VIEW_TEAM_PERMISSIONS } from '@src/authz-module/constants';
import { getAuthzCatalog, getAuthzCatalogPage } from './api';
import type { GetAuthzCatalogResponse, RolesQueryParams } from './api';
import type { AuthzCatalog, Role, ScopeCatalog } from '../types';
import { getScopeCatalog } from '../utils';

const catalogQueryKeys = {
  all: [appId, 'authz', 'catalog'] as const,
  byScopeTypes: (scopeTypes: string[]) => [...catalogQueryKeys.all, scopeTypes] as const,
  allRoles: [appId, 'authz', 'catalog', 'roles'] as const,
  roles: (params: RolesQueryParams) => [...catalogQueryKeys.allRoles, params] as const,
};

/**
 * Invalidate the catalog of every scope combination after a successful role-definition change.
 *
 * @example
 * ```tsx
 * import { useMutation, useQueryClient } from '@tanstack/react-query';
 * import { invalidateAuthzCatalog } from '@src/authz-module/catalog';
 *
 * // Inside a hook that updates role definitions:
 * const queryClient = useQueryClient();
 * const mutation = useMutation({
 *   mutationFn: updateRoleDefinition,
 *   onSuccess: () => invalidateAuthzCatalog(queryClient),
 * });
 * ```
 */
export const invalidateAuthzCatalog = (queryClient: QueryClient) => queryClient.invalidateQueries({
  queryKey: catalogQueryKeys.all,
});

/**
 * Invalidate every cached page of the roles table after role assignments change, so its
 * member counts follow. Leaves the complete catalog alone: assignments don't change it, and
 * refreshing it would refetch every one of its pages.
 *
 * @example
 * ```tsx
 * const queryClient = useQueryClient();
 * const mutation = useMutation({
 *   mutationFn: assignTeamMembersRole,
 *   onSuccess: () => invalidateCatalogRoles(queryClient),
 * });
 * ```
 */
export const invalidateCatalogRoles = (queryClient: QueryClient) => queryClient.invalidateQueries({
  queryKey: catalogQueryKeys.allRoles,
});

const NO_SCOPE_TYPES: string[] = [];

/**
 * Loads the shared roles, permissions and categories catalog for the scope types the user can view.
 *
 * The scope types come from the user's view-team permissions (validate/me), so the query waits
 * for them and is skipped when the user can't view any scope type. `isLoading` covers both.
 * The catalog stays fresh for thirty minutes.
 *
 * Besides the query result, it returns:
 * - `scopeTypes`: the scope types of the loaded catalog, courses first; empty until it loads.
 * - `getScopeCatalog(scopeType)`: the catalog of one scope type (see `getScopeCatalog` in utils),
 *   or `undefined` if it isn't loaded. Each scope type's catalog keeps its identity between
 *   renders, so what is memoized from it isn't rebuilt on every render.
 * - `getRole(roleId)`: the role with that id, with its permissions in every scope type, or
 *   `undefined` if the catalog isn't loaded or doesn't describe it.
 *
 * @example
 * ```tsx
 * const { scopeTypes, getScopeCatalog, isLoading } = useAuthzCatalog();
 * const libraryCatalog = getScopeCatalog(SCOPE_TYPES.LIBRARY);
 * ```
 */
export const useAuthzCatalog = () => {
  // Authz checks are always enabled in the admin console.
  const permissions = usePermissions(VIEW_TEAM_PERMISSIONS, true);

  const viewableScopeTypes: string[] = [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY].filter((scopeType) => (
    permissions[scopeType] === true
  ));

  const query = useQuery<AuthzCatalog, Error>({
    queryKey: catalogQueryKeys.byScopeTypes(viewableScopeTypes),
    queryFn: () => getAuthzCatalog(viewableScopeTypes),
    enabled: viewableScopeTypes.length > 0,
    staleTime: 30 * 60 * 1000,
  });

  const { data: catalog } = query;

  const scopeCatalogs = useMemo(() => new Map<string, ScopeCatalog>(
    (catalog?.scopeTypes ?? []).map((scopeType) => [scopeType, getScopeCatalog(catalog!, scopeType)]),
  ), [catalog]);

  const getLoadedScopeCatalog = useCallback(
    (scopeType: string) => scopeCatalogs.get(scopeType),
    [scopeCatalogs],
  );

  const rolesById = useMemo(
    () => new Map<string, Role>((catalog?.roles ?? []).map((role) => [role.role, role])),
    [catalog],
  );

  const getRole = useCallback((roleId: string) => rolesById.get(roleId), [rolesById]);

  return {
    ...query,
    isLoading: permissions.isLoading || query.isLoading,
    isError: permissions.isError || query.isError,
    error: permissions.error ?? query.error,
    scopeTypes: catalog?.scopeTypes ?? NO_SCOPE_TYPES,
    getScopeCatalog: getLoadedScopeCatalog,
    getRole,
  };
};

/**
 * Loads one page of roles for the roles table, searched, sorted and paginated by the server.
 *
 * Separate from `useAuthzCatalog`, which keeps the complete catalog that the assignment wizard,
 * the role filters and the role names rely on; a search or page here never narrows it. The
 * page stays fresh for thirty minutes, and `invalidateAuthzCatalog` refreshes it too. While a
 * new page loads, the previous one is returned with `isPlaceholderData` set.
 *
 * @param params - The scope types, search, sort and page to ask for.
 * @param enabled - Whether to fetch; false until the scope types the user can view are known.
 *
 * @example
 * ```tsx
 * const { data } = useCatalogRoles({
 *   scopeTypes: [SCOPE_TYPES.LIBRARY], search: 'admin', sortBy: 'user_count', order: 'desc',
 *   pageIndex: 0, pageSize: 10,
 * });
 * ```
 */
export const useCatalogRoles = (params: RolesQueryParams, enabled = true) => useQuery<GetAuthzCatalogResponse, Error>({
  queryKey: catalogQueryKeys.roles(params),
  queryFn: () => getAuthzCatalogPage(params),
  enabled,
  staleTime: 30 * 60 * 1000,
  placeholderData: keepPreviousData,
});
