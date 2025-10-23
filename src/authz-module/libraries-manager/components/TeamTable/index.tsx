import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  DataTable, Button, Chip, Skeleton,
  TextFilter,
  CheckboxFilter,
  TableFooter,
} from '@openedx/paragon';
import { Edit } from '@openedx/paragon/icons';
import { TableCellValue, TeamMember } from '@src/types';
import { useTeamMembers } from '@src/authz-module/data/hooks';
import { useLibraryAuthZ } from '@src/authz-module/libraries-manager/context';
import { useQuerySettings } from './hooks/useQuerySettings';
import TableControlBar from './components/TableControlBar';
import messages from './messages';

const SKELETON_ROWS = Array.from({ length: 10 }).map(() => ({
  username: 'skeleton',
  name: '',
  email: '',
  roles: [],
}));

const DEFAULT_PAGE_SIZE = 10;

type CellProps = TableCellValue<TeamMember>;

const EmailCell = ({ row }: CellProps) => (row.original?.username === SKELETON_ROWS[0].username ? (
  <Skeleton width="180px" />
) : (
  row.original.email
));

const NameCell = ({ row }: CellProps) => {
  const intl = useIntl();
  const { username } = useLibraryAuthZ();

  if (row.original.username === SKELETON_ROWS[0].username) {
    return <Skeleton width="180px" />;
  }

  if (row.original.username === username) {
    return (
      <span>
        {username}
        <span className="text-gray-500">{intl.formatMessage(messages['library.authz.team.table.username.current'])}</span>
      </span>
    );
  }
  return row.original.username;
};

const TeamTable = () => {
  const intl = useIntl();
  const {
    libraryId, canManageTeam, username, roles,
  } = useLibraryAuthZ();
  const roleLabels = roles.reduce((acc, role) => ({ ...acc, [role.role]: role.name }), {} as Record<string, string>);

  const { querySettings, handleTableFetch } = useQuerySettings();

  // TODO: Display error in the notification system
  const {
    data: teamMembers, isLoading, isError,
  } = useTeamMembers(libraryId, querySettings);

  const rows = isError ? [] : (teamMembers?.results || SKELETON_ROWS);
  const pageCount = teamMembers?.count ? Math.ceil(teamMembers.count / DEFAULT_PAGE_SIZE) : 1;

  const navigate = useNavigate();

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
          // eslint-disable-next-line react/no-unstable-nested-components
          Cell: ({ row }: CellProps) => (
            canManageTeam && row.original.username !== username && !isLoading ? (
              <Button
                iconBefore={Edit}
                variant="link"
                size="sm"
                onClick={() => navigate(`/authz/libraries/${libraryId}/${row.original.username}`)}
              >
                {intl.formatMessage(messages['authz.libraries.team.table.edit.action'])}
              </Button>
            ) : null),
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
            // eslint-disable-next-line react/no-unstable-nested-components
            Cell: ({ row }: CellProps) => (row.original.username === SKELETON_ROWS[0].username ? (
              <Skeleton width="80px" />
            ) : (
              row.original.roles.map((role) => (
                <Chip key={`${row.original.username}-role-${role}`}>{roleLabels[role]}</Chip>
              ))
            )),
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
