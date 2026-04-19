import { useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  DataTable,
  TextFilter,
} from '@openedx/paragon';

import { useToastManager } from '@src/authz-module/data/context/ToastManagerContext';
import { useQuerySettings } from '@src/authz-module/hooks/useQuerySettings';
import OrgFilter from '@src/authz-module/components/TableControlBar/OrgFilter';
import RolesFilter from '@src/authz-module/components/TableControlBar/RolesFilter';
import ScopesFilter from '@src/authz-module/components/TableControlBar/ScopesFilter';
import TableControlBar from '@src/authz-module/components/TableControlBar/TableControlBar';
import { getCellHeader } from '@src/authz-module/components/utils';
import {
  ViewActionCell, NameCell, OrgCell, RoleCell, ScopeCell,
} from '@src/authz-module/components/TableCells';
import { useAllRoleAssignments } from '@src/authz-module/data/hooks';
import { TABLE_DEFAULT_PAGE_SIZE } from '@src/authz-module/constants';
import messages from './messages';
import TableFooter from '../components/TableFooter/TableFooter';

interface TeamMembersTableProps {
  presetScope?: string;
}

const TeamMembersTable = ({ presetScope }: TeamMembersTableProps) => {
  const intl = useIntl();
  const { showErrorToast } = useToastManager();
  const [columnsWithFiltersApplied, setColumnsWithFiltersApplied] = useState<string[]>([]);

  const initialQuerySettings = presetScope ? {
    scopes: presetScope,
    pageSize: TABLE_DEFAULT_PAGE_SIZE,
    pageIndex: 0,
    roles: null,
    organizations: null,
    search: null,
    order: null,
    sortBy: null,
  } : undefined;

  const { querySettings, handleTableFetch } = useQuerySettings(initialQuerySettings);

  const {
    data: { results: roleAssignments, count } = { results: [], count: 0 },
    isLoading: isLoadingAllRoleAssignments,
    error,
    refetch,
  } = useAllRoleAssignments(querySettings);

  const initialFilters = presetScope ? [{ id: 'scope', value: [presetScope] }] : [];

  useEffect(() => {
    if (error) {
      showErrorToast(error, refetch);
    }
  }, [error, showErrorToast, refetch]);

  const pageCount = Math.ceil(count / TABLE_DEFAULT_PAGE_SIZE);

  const fetchData = useMemo(() => debounce(handleTableFetch, 500), [handleTableFetch]);

  useEffect(() => () => fetchData.cancel(), [fetchData]);

  return (
    <div className="authz-module">
      <DataTable
        isFilterable
        isPaginated
        isSortable
        manualFilters
        manualPagination
        manualSortBy
        numBreakoutFilters={4}
        fetchData={fetchData}
        data={roleAssignments}
        itemCount={count}
        pageCount={pageCount}
        initialState={{ pageSize: TABLE_DEFAULT_PAGE_SIZE, filters: initialFilters }}
        isLoading={isLoadingAllRoleAssignments}
        additionalColumns={[
          {
            id: 'action',
            Header: intl.formatMessage(messages['authz.team.members.table.column.actions.title']),
            Cell: ViewActionCell,
          },
        ]}
        columns={
            [
              {
                Header: intl.formatMessage(messages['authz.team.members.table.column.name.title']),
                accessor: 'name',
                Cell: NameCell,
                filter: 'text',
                Filter: TextFilter,
                filterOrder: 1,
              },
              {
                Header: intl.formatMessage(messages['authz.team.members.table.column.email.title']),
                accessor: 'email',
                disableFilters: true,
                filter: 'text',
                Filter: TextFilter,
              },
              {
                Header: getCellHeader('org', intl.formatMessage(messages['authz.team.members.table.column.organization.title']), columnsWithFiltersApplied),
                accessor: 'org',
                Cell: OrgCell,
                filter: 'includesValue',
                Filter: OrgFilter,
                filterButtonText: intl.formatMessage(messages['authz.team.members.table.column.organization.title']),
                filterOrder: 2,
              },
              {
                Header: getCellHeader('scope', intl.formatMessage(messages['authz.team.members.table.column.scope.title']), columnsWithFiltersApplied),
                accessor: 'scope',
                Cell: ScopeCell,
                filter: 'includesValue',
                Filter: ScopesFilter,
                filterButtonText: intl.formatMessage(messages['authz.team.members.table.column.scope.title']),
                filterOrder: 4,
              },
              {
                Header: getCellHeader('role', intl.formatMessage(messages['authz.team.members.table.column.role.title']), columnsWithFiltersApplied),
                accessor: 'role',
                filter: 'includesValue',
                Cell: RoleCell,
                Filter: RolesFilter,
                filterButtonText: intl.formatMessage(messages['authz.team.members.table.column.role.title']),
                filterOrder: 3,
              },
            ]
        }
      >
        <TableControlBar onFilterChange={setColumnsWithFiltersApplied} />
        <DataTable.Table />
        <TableFooter />
      </DataTable>
    </div>
  );
};

export default TeamMembersTable;
