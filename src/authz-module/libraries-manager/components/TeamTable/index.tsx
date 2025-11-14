import { useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
  TableFooter,
} from '@openedx/paragon';

import { useTeamMembers } from '@src/authz-module/data/hooks';
import { useLibraryAuthZ } from '@src/authz-module/libraries-manager/context';
import { useToastManager } from '@src/authz-module/libraries-manager/ToastManagerContext';
import { SKELETON_ROWS } from '@src/authz-module/libraries-manager/constants';
import { useQuerySettings } from './hooks/useQuerySettings';
import TableControlBar from './components/TableControlBar';
import messages from './messages';
import {
  ActionCell, EmailCell, NameCell, RolesCell,
} from './components/Cells';

const DEFAULT_PAGE_SIZE = 10;

const TeamTable = () => {
  const intl = useIntl();
  const {
    libraryId, roles,
  } = useLibraryAuthZ();
  const { showErrorToast } = useToastManager();

  const { querySettings, handleTableFetch } = useQuerySettings();

  const {
    data: teamMembers, isError, error, refetch,
  } = useTeamMembers(libraryId, querySettings);

  if (error) {
    showErrorToast(error, refetch);
  }

  const rows = isError ? [] : (teamMembers?.results || SKELETON_ROWS);
  const pageCount = teamMembers?.count ? Math.ceil(teamMembers.count / DEFAULT_PAGE_SIZE) : 1;

  const adaptedFilterChoices = useMemo(
    () => roles.map((role) => ({
      name: role.name,
      number: role.userCount,
      value: role.role,
    })),
    [roles],
  );

  const fetchData = useMemo(() => debounce(handleTableFetch, 500), [handleTableFetch]);

  useEffect(() => () => fetchData.cancel(), [fetchData]);

  return (
    <DataTable
      isFilterable
      isPaginated
      isSortable
      manualFilters
      manualPagination
      manualSortBy
      defaultColumnValues={{ Filter: TextFilter }}
      numBreakoutFilters={3}
      fetchData={fetchData}
      data={rows}
      itemCount={teamMembers?.count || 0}
      pageCount={pageCount}
      initialState={{ pageSize: DEFAULT_PAGE_SIZE }}
      additionalColumns={[
        {
          id: 'action',
          Header: intl.formatMessage(messages['library.authz.team.table.action']),
          Cell: ActionCell,
        },
      ]}
      columns={
        [
          {
            Header: intl.formatMessage(messages['library.authz.team.table.username']),
            accessor: 'username',
            Cell: NameCell,
            disableSortBy: true,
          },
          {
            Header: intl.formatMessage(messages['library.authz.team.table.email']),
            accessor: 'email',
            Cell: EmailCell,
            disableFilters: true,
            disableSortBy: true,
          },
          {
            Header: intl.formatMessage(messages['library.authz.team.table.roles']),
            accessor: 'roles',
            Cell: RolesCell,
            Filter: CheckboxFilter,
            filter: 'includesValue',
            filterChoices: Object.values(adaptedFilterChoices),
            disableSortBy: true,
          },
        ]
      }
    >
      <TableControlBar />
      <DataTable.Table />
      <TableFooter />
    </DataTable>
  );
};

export default TeamTable;
