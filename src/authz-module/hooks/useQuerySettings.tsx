import { useCallback, useState } from 'react';
import { QuerySettings } from '../data/api';

interface DataTableFilters {
  pageSize: number;
  pageIndex: number;
  sortBy: Array<{ id: string; desc: boolean }>;
  filters: Array<{ id: string; value: any }>;
}

interface UseQuerySettingsReturn {
  querySettings: QuerySettings;
  handleTableFetch: (tableFilters: DataTableFilters) => void;
}

enum SortOrderKeys {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Custom hook to manage query settings for table data fetching
 * Converts DataTable filter/sort/pagination settings to API query parameters
 * and manages URL synchronization
 *
 * @param initialQuerySettings - Initial query settings
 * @returns Object containing querySettings and handleTableFetch function
 */
export const useQuerySettings = (
  initialQuerySettings: QuerySettings = {
    roles: null,
    scopes: null,
    organizations: null,
    search: null,
    pageSize: 10,
    pageIndex: 0,
    order: null,
    sortBy: null,
  },
): UseQuerySettingsReturn => {
  const [querySettings, setQuerySettings] = useState<QuerySettings>(initialQuerySettings);

  const handleTableFetch = useCallback((tableFilters: DataTableFilters) => {
    setQuerySettings((prevSettings) => {
      // Extract filters
      const rolesFilter = tableFilters.filters?.find((filter) => filter.id === 'role')?.value?.join(',') ?? '';
      const searchFilter = tableFilters.filters?.find((filter) => filter.id === 'name')?.value ?? '';
      const organizationsFilter = tableFilters.filters?.find((filter) => filter.id === 'org')?.value?.join(',') ?? '';
      const scopesFilter = tableFilters.filters?.find((filter) => filter.id === 'scope')?.value?.join(',') ?? '';

      // Extract pagination
      const { pageSize = 10, pageIndex = 0 } = tableFilters;

      // Extract and convert sorting
      let sortByOption = '';
      let sortByOrder = '';
      if (tableFilters.sortBy?.length) {
        sortByOption = tableFilters.sortBy[0]?.id.replace(/([A-Z])/g, '_$1').toLowerCase();
        sortByOrder = tableFilters.sortBy[0]?.desc ? SortOrderKeys.DESC : SortOrderKeys.ASC;
      }

      const newQuerySettings: QuerySettings = {
        roles: rolesFilter || null,
        scopes: scopesFilter || null,
        organizations: organizationsFilter || null,
        search: searchFilter || null,
        sortBy: sortByOption || null,
        order: sortByOrder || null,
        pageSize,
        pageIndex,
      };

      const hasChanged = (
        prevSettings.roles !== newQuerySettings.roles
        || prevSettings.scopes !== newQuerySettings.scopes
        || prevSettings.organizations !== newQuerySettings.organizations
        || prevSettings.search !== newQuerySettings.search
        || prevSettings.pageSize !== newQuerySettings.pageSize
        || prevSettings.pageIndex !== newQuerySettings.pageIndex
        || prevSettings.sortBy !== newQuerySettings.sortBy
        || prevSettings.order !== newQuerySettings.order
      );

      if (!hasChanged) {
        return prevSettings; // No change, prevent unnecessary update
      }

      return newQuerySettings;
    });
  }, []);

  return {
    querySettings,
    handleTableFetch,
  };
};
