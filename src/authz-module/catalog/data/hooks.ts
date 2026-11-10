import { useCallback, useMemo } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { usePermissions } from '@openedx/frontend-base';
import { appId } from '@src/constants';
import { SCOPE_TYPES, VIEW_TEAM_ACTIONS } from '@src/authz-module/constants';
import { getAuthzCatalog } from './api';
import type { AuthzCatalog, ScopeCatalog } from '../types';
import { getScopeCatalog } from '../utils';

const catalogQueryKeys = {
  all: [appId, 'authz', 'catalog'] as const,
  byScopeTypes: (scopeTypes: string[]) => [...catalogQueryKeys.all, scopeTypes] as const,
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

const NO_SCOPE_TYPES: string[] = [];

const VIEW_TEAM_PERMISSIONS = Object.fromEntries(
  Object.entries(VIEW_TEAM_ACTIONS).map(([scopeType, action]) => [scopeType, { action }]),
);

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
 *
 * @example
 * ```tsx
 * const { scopeTypes, getScopeCatalog, isLoading } = useAuthzCatalog();
 * const libraryCatalog = getScopeCatalog(SCOPE_TYPES.LIBRARY);
 * ```
 */
export const useAuthzCatalog = () => {
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

  return {
    ...query,
    isLoading: permissions.isLoading || query.isLoading,
    isError: permissions.isError || query.isError,
    error: permissions.error ?? query.error,
    scopeTypes: catalog?.scopeTypes ?? NO_SCOPE_TYPES,
    getScopeCatalog: getLoadedScopeCatalog,
  };
};
