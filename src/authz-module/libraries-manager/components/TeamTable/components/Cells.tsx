import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Chip, Skeleton } from '@openedx/paragon';
import { Edit } from '@openedx/paragon/icons';
import { TableCellValue, TeamMember } from '@src/types';
import { useLibraryAuthZ } from '@src/authz-module/libraries-manager/context';
import { useNavigate } from 'react-router-dom';
import { useTeamMembers } from '@src/authz-module/data/hooks';
import { SKELETON_ROWS } from '@src/authz-module/libraries-manager/constants';
import { useQuerySettings } from '../hooks/useQuerySettings';
import messages from '../messages';

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

const ActionCell = ({ row }: CellProps) => {
  const intl = useIntl();
  const {
    libraryId, canManageTeam, username,
  } = useLibraryAuthZ();
  const navigate = useNavigate();
  const { querySettings } = useQuerySettings();
  const { isLoading } = useTeamMembers(libraryId, querySettings);
  return (
    canManageTeam && row.original.username !== username && !isLoading ? (
      <Button
        iconBefore={Edit}
        variant="link"
        size="sm"
        onClick={() => navigate(`/authz/libraries/${libraryId}/${row.original.username}`)}
      >
        {intl.formatMessage(messages['authz.libraries.team.table.edit.action'])}
      </Button>
    ) : null);
};

const RolesCell = ({ row }: CellProps) => {
  const { roles } = useLibraryAuthZ();
  const roleLabels = roles.reduce((acc, role) => ({ ...acc, [role.role]: role.name }), {} as Record<string, string>);
  return (row.original.username === SKELETON_ROWS[0].username ? (
    <Skeleton width="80px" />
  ) : (
    row.original.roles.map((role) => (
      <Chip key={`${row.original.username}-role-${role}`}>{roleLabels[role]}</Chip>
    ))
  ));
};

export {
  EmailCell, NameCell, ActionCell, RolesCell,
};
