import { useNavigate } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  DataTable, Button, Chip, Skeleton,
} from '@openedx/paragon';
import { Edit } from '@openedx/paragon/icons';
import { TableCellValue, TeamMember } from '@src/types';
import { useTeamMembers } from '@src/authz-module/data/hooks';
import { useLibraryAuthZ } from '../context';
import messages from './messages';

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

const RolesCell = ({ row }: CellProps) => (row.original.username === SKELETON_ROWS[0].username ? (
  <Skeleton width="80px" />
) : (
  row.original.roles.map((role) => (
    <Chip key={`${row.original.username}-role-${role}`}>{role}</Chip>
  ))
));

const TeamTable = () => {
  const intl = useIntl();
  const { libraryId, canManageTeam, username } = useLibraryAuthZ();

  // TODO: Display error in the notification system
  const {
    data: teamMembers, isLoading, isError,
  } = useTeamMembers(libraryId);

  const rows = isError ? [] : (teamMembers || SKELETON_ROWS);

  const navigate = useNavigate();

  return (
    <DataTable
      isPaginated
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
                // TODO: update the view with the team member view
                onClick={() => navigate(`/authz/libraries/${libraryId}/${row.original.username}`)}
              >
                {intl.formatMessage(messages['authz.libraries.team.table.edit.action'])}
              </Button>
            ) : null),
        },
      ]}
      initialState={{
        pageSize: 10,
      }}
      columns={
        [
          {
            Header: intl.formatMessage(messages['library.authz.team.table.username']),
            accessor: 'username',
            Cell: NameCell,
          },
          {
            Header: intl.formatMessage(messages['library.authz.team.table.email']),
            accessor: 'email',
            Cell: EmailCell,
          },
          {
            Header: intl.formatMessage(messages['library.authz.team.table.roles']),
            accessor: 'roles',
            Cell: RolesCell,
          },
        ]
      }
    />
  );
};

export default TeamTable;
