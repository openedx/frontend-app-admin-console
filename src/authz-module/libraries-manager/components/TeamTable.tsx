import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  DataTable, Button, Chip, Skeleton,
  TextFilter,
  CheckboxFilter,
} from '@openedx/paragon';
import { Edit } from '@openedx/paragon/icons';
import { TableCellValue, TeamMember } from '@src/types';
import { useTeamMembers } from '@src/authz-module/data/hooks';
import {
  useMemo,
} from 'react';
import { useLibraryAuthZ } from '../context';
import { useQuerySettings } from '../hooks';
import messages from './messages';
import TableControlBar from './TableControlBar';

const SKELETON_ROWS = Array.from({ length: 10 }).map(() => ({
  username: 'skeleton',
  name: '',
  email: '',
  roles: [],
}));

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

  const rows = isError ? [] : (teamMembers || SKELETON_ROWS);

  const navigate = useNavigate();

  const adaptedFilterChoices = useMemo(
    () => roles.map((role) => ({
      name: role.name,
      number: role.userCount,
      value: role.role,
    })),
    [roles],
  );

  return (
    <DataTable
      isPaginated
      isFilterable
      defaultColumnValues={{ Filter: TextFilter }}
      numBreakoutFilters={3}
      manualFilters
      manualPagination
      isSortable
      manualSortBy
      fetchData={debounce(handleTableFetch, 1000)}
      data={rows}
      itemCount={rows?.length}
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
      initialState={{
        pageSize: 10,
        hiddenColumns: ['createdAt'],
      }}
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
          {
            accessor: 'createdAt',
            Filter: false,
            disableFilters: true,
            disableSortBy: true,
          },
        ]
      }
    >
      <TableControlBar />
      <DataTable.Table />
    </DataTable>
  );
};

export default TeamTable;
