import { useCallback, useMemo, useState } from 'react';

import { TABLE_DEFAULT_PAGE_SIZE } from '../../constants';
import type { RolesQueryParams, RolesSortBy, RolesSortOrder } from '../../catalog';
import { ROLES_SORT_BY, ROLES_TABLE_COLUMNS } from '../constants';

// The state Paragon's DataTable hands to `fetchData` in manual mode.
export interface RolesTableState {
  pageSize?: number;
  pageIndex?: number;
  sortBy?: { id: string; desc?: boolean }[];
  filters?: { id: string; value: unknown }[];
}

// What the table chose, before it is combined with the scope types the user can view.
interface TableSettings {
  search: string | null;
  resourceTypes: string;
  sortBy: RolesSortBy | null;
  order: RolesSortOrder | null;
  pageIndex: number;
  pageSize: number;
}

const INITIAL_SETTINGS: TableSettings = {
  search: null,
  resourceTypes: '',
  sortBy: null,
  order: null,
  pageIndex: 0,
  pageSize: TABLE_DEFAULT_PAGE_SIZE,
};

const getFilterValue = (state: RolesTableState, columnId: string) => (
  state.filters?.find(({ id }) => id === columnId)?.value
);

const toTableSettings = (state: RolesTableState): TableSettings => {
  const search = getFilterValue(state, ROLES_TABLE_COLUMNS.NAME);
  const resourceTypes = getFilterValue(state, ROLES_TABLE_COLUMNS.RESOURCE_TYPE);
  const [sort] = state.sortBy ?? [];
  const sortBy = (sort && ROLES_SORT_BY[sort.id]) ?? null;

  return {
    search: typeof search === 'string' ? search.trim() || null : null,
    resourceTypes: Array.isArray(resourceTypes) ? [...resourceTypes].sort().join(',') : '',
    sortBy,
    order: sortBy ? (sort.desc ? 'desc' : 'asc') : null,
    pageIndex: state.pageIndex ?? 0,
    pageSize: state.pageSize ?? TABLE_DEFAULT_PAGE_SIZE,
  };
};

/**
 * Turns the roles table's state into the parameters of `useCatalogRoles`, following
 * `useQuerySettings` (the team tables' counterpart) with the roles endpoint's names:
 * the role column's filter becomes `search`, the resource type filter becomes `scopeTypes`,
 * and the sorted column maps to its `sort_by` through `ROLES_SORT_BY`.
 *
 * Any change to the search, the resource types or the sort goes back to the first page, since
 * the page the user was on may no longer exist. A table state that changes nothing keeps the
 * same settings object, so the query isn't fetched again.
 *
 * @param viewableScopeTypes - The scope types the user can view. They are sent when no resource
 *   type is chosen, since the endpoint requires `scope_types`, and they bound the chosen ones.
 */
export const useRolesQuerySettings = (viewableScopeTypes: string[]) => {
  const [settings, setSettings] = useState<TableSettings>(INITIAL_SETTINGS);

  const handleTableFetch = useCallback((state: RolesTableState) => {
    setSettings((prev) => {
      const next = toTableSettings(state);
      const isNewResult = next.search !== prev.search
        || next.resourceTypes !== prev.resourceTypes
        || next.sortBy !== prev.sortBy
        || next.order !== prev.order;
      const pageIndex = isNewResult ? 0 : next.pageIndex;

      if (!isNewResult && pageIndex === prev.pageIndex && next.pageSize === prev.pageSize) {
        return prev;
      }
      return { ...next, pageIndex };
    });
  }, []);

  // Joined so a new array with the same scope types keeps the settings object.
  const viewableKey = viewableScopeTypes.join(',');

  const querySettings: RolesQueryParams = useMemo(() => {
    const viewable = viewableKey ? viewableKey.split(',') : [];
    const chosen = settings.resourceTypes ? settings.resourceTypes.split(',') : [];
    const chosenViewable = viewable.filter((scopeType) => chosen.includes(scopeType));
    return {
      scopeTypes: chosenViewable.length > 0 ? chosenViewable : viewable,
      search: settings.search,
      sortBy: settings.sortBy,
      order: settings.order,
      pageIndex: settings.pageIndex,
      pageSize: settings.pageSize,
    };
  }, [settings, viewableKey]);

  return { querySettings, handleTableFetch };
};

export default useRolesQuerySettings;
