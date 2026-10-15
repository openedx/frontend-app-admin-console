import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePermissions } from '@openedx/frontend-base';
import { appId } from '@src/constants';
import { SCOPE_TYPES, VIEW_TEAM_ACTIONS } from '@src/authz-module/constants';
import { getAuthzCatalog } from './api';
import type { AuthzCatalog, Role, ScopeCatalog } from '../types';
import { getScopeCatalog } from '../utils';

const catalogQueryKeys = {
  all: [appId, 'authz', 'catalog'] as const,
  byScopeTypes: (scopeTypes: string[]) => [...catalogQueryKeys.all, scopeTypes] as const,
};

const NO_SCOPE_TYPES: string[] = [];

const VIEW_TEAM_PERMISSIONS = Object.fromEntries(
  Object.entries(VIEW_TEAM_ACTIONS).map(([scopeType, action]) => [scopeType, { action }]),
);

/**
 * React Query hook to fetch the roles, permissions and categories catalog of the scope types the
 * user can view, in a single request.
 *
 * The scope types come from the user's view-team permissions (validate/me), so the query waits
 * for them and is skipped when the user can't view any scope type. `isLoading` covers both.
 * The catalog comes from the authz schema and doesn't change while the app runs, so it never
 * goes stale.
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
  const permissions = usePermissions(VIEW_TEAM_PERMISSIONS, true);

  const viewableScopeTypes: string[] = [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY].filter((scopeType) => (
    permissions[scopeType] === true
  ));

  const query = useQuery<AuthzCatalog, Error>({
    queryKey: catalogQueryKeys.byScopeTypes(viewableScopeTypes),
    queryFn: () => getAuthzCatalog(viewableScopeTypes),
    enabled: viewableScopeTypes.length > 0,
    staleTime: Infinity,
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
