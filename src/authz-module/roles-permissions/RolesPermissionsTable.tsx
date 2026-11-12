import { useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { useIntl } from '@openedx/frontend-base';
import { DataTable, TextFilter } from '@openedx/paragon';

import { useToastManager } from '@src/components/ToastManager/ToastManagerContext';
import { SCOPE_TYPES, TABLE_DEFAULT_PAGE_SIZE } from '../constants';
import { useCatalogRoles } from '../catalog';
import type { GetAuthzCatalogResponse, Role } from '../catalog';
import { useViewTeamPermissions } from '../hooks/useViewTeamPermissions';
import MultipleChoiceFilter from '../components/TableControlBar/MultipleChoiceFilter';
import TableFooter from '../components/TableFooter/TableFooter';
import LastUpdatedCell from './components/LastUpdatedCell';
import MembersCell from './components/MembersCell';
import PermissionsGrantedCell from './components/PermissionsGrantedCell';
import ResourceTypeCell from './components/ResourceTypeCell';
import RoleActionsCell from './components/RoleActionsCell';
import RoleNameCell from './components/RoleNameCell';
import RolesTableControlBar from './components/RolesTableControlBar';
import { ROLES_TABLE_COLUMNS } from './constants';
import useRolesQuerySettings from './hooks/useRolesQuerySettings';
import messages from './messages';
import type { RoleRow } from './types';

const toastedErrors = new WeakSet<Error>();

/**
 * Stable stand-in for a page that has not resolved. A fresh object literal here would hand
 * `DataTable` a new `data` array on every render, and react-table resets its state whenever
 * `data` changes identity.
 */
const EMPTY_ROLES: GetAuthzCatalogResponse = {
  count: 0, next: null, previous: null, scopeTypes: [], categories: [], permissions: [], results: [],
};

const toRoleRow = (role: Role): RoleRow => ({
  id: role.role,
  name: role.displayName,
  resourceTypes: role.scopeTypes,
  members: role.userCount,
  permissionCount: role.permissions.length,
  lastUpdated: role.updatedAt,
  isCustom: role.definitionKind === 'user_defined',
});

/**
 * Lists the roles of the scope types the user can view, one page at a time from
 * `GET /api/authz/v1/roles/` (ADR 0028), so no role copy lives in the client. Search, the
 * resource type filter, sorting and pagination all run on the server, following the team
 * members table: the table runs in manual mode, and `useRolesQuerySettings` turns its state into
 * the request. The complete catalog that other screens rely on stays in `useAuthzCatalog`.
 */
const RolesPermissionsTable = () => {
  const { formatMessage } = useIntl();
  const { showErrorToast } = useToastManager();

  const {
    isCourseViewAllowed, isLibraryViewAllowed, isLoading: isLoadingPermissions,
  } = useViewTeamPermissions();
  const viewableScopeTypes = useMemo(() => [
    ...(isCourseViewAllowed ? [SCOPE_TYPES.COURSE] : []),
    ...(isLibraryViewAllowed ? [SCOPE_TYPES.LIBRARY] : []),
  ], [isCourseViewAllowed, isLibraryViewAllowed]);

  const { querySettings, handleTableFetch } = useRolesQuerySettings(viewableScopeTypes);
  // `scope_types` is required, so nothing is fetched until the viewable scope types are known.
  const isQueryReady = !isLoadingPermissions && viewableScopeTypes.length > 0;

  const {
    data,
    isLoading: isLoadingFirstPage,
    isPlaceholderData,
    error,
    refetch,
  } = useCatalogRoles(querySettings, isQueryReady);
  const isLoadingRoles = isLoadingFirstPage || isPlaceholderData;
  const { results, count } = data ?? EMPTY_ROLES;
  // With no page to show, the empty table says the roles failed to load, not that none matched.
  const hasFailedToLoad = !!error && !data;

  const roleRows = useMemo(() => results.map(toRoleRow), [results]);

  // Only transient failures reach here; each one is reported once, with a retry.
  useEffect(() => {
    if (error && !toastedErrors.has(error)) {
      toastedErrors.add(error);
      showErrorToast(error, refetch);
    }
  }, [error, showErrorToast, refetch]);

  const pageCount = Math.ceil(count / TABLE_DEFAULT_PAGE_SIZE);

  const fetchData = useMemo(() => debounce(handleTableFetch, 500), [handleTableFetch]);

  useEffect(() => () => fetchData.cancel(), [fetchData]);

  return (
    <DataTable
      className="roles-permissions-table"
      isFilterable
      isPaginated
      isSortable
      manualFilters
      manualPagination
      manualSortBy
      fetchData={fetchData}
      data={roleRows}
      itemCount={count}
      pageCount={pageCount}
      initialState={{ pageSize: TABLE_DEFAULT_PAGE_SIZE }}
      isLoading={isLoadingPermissions || isLoadingRoles}
      additionalColumns={[
        {
          id: 'actions',
          Header: formatMessage(messages['authz.roles.table.column.actions.title']),
          Cell: RoleActionsCell,
          headerClassName: 'justify-content-center',
        },
      ]}
      columns={[
        {
          id: ROLES_TABLE_COLUMNS.NAME,
          Header: formatMessage(messages['authz.roles.table.column.role.title']),
          accessor: 'name',
          Cell: RoleNameCell,
          Filter: TextFilter,
        },
        {
          id: ROLES_TABLE_COLUMNS.RESOURCE_TYPE,
          Header: formatMessage(messages['authz.roles.table.column.resource.type.title']),
          accessor: 'resourceTypes',
          Cell: ResourceTypeCell,
          Filter: MultipleChoiceFilter,
        },
        {
          id: ROLES_TABLE_COLUMNS.MEMBERS,
          Header: formatMessage(messages['authz.roles.table.column.members.title']),
          accessor: 'members',
          Cell: MembersCell,
          disableFilters: true,
        },
        {
          id: 'permissions',
          Header: formatMessage(messages['authz.roles.table.column.permissions.title']),
          accessor: 'permissionCount',
          Cell: PermissionsGrantedCell,
          disableFilters: true,
          disableSortBy: true,
        },
        {
          id: ROLES_TABLE_COLUMNS.LAST_UPDATED,
          Header: formatMessage(messages['authz.roles.table.column.last.updated.title']),
          accessor: 'lastUpdated',
          Cell: LastUpdatedCell,
          disableFilters: true,
        },
      ]}
    >
      <RolesTableControlBar scopeTypes={viewableScopeTypes} />
      <DataTable.Table />
      <DataTable.EmptyTable
        content={formatMessage(messages[hasFailedToLoad ? 'authz.tabs.permissionsRoles.error' : 'authz.roles.table.empty'])}
      />
      <TableFooter showingMessage={messages['authz.roles.table.showing.roles.text']} />
    </DataTable>
  );
};

export default RolesPermissionsTable;
