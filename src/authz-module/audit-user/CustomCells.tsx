import { useIntl } from '@edx/frontend-platform/i18n';
import ViewMoreLink from '@src/authz-module/components/ViewMoreLink';
import {
  Delete, ExpandMore, Info,
} from '@openedx/paragon/icons';
import {
  Icon,
  IconButton, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { Role, TableCellValue, UserRole } from 'types';
import { ADMIN_ROLES, DJANGO_ROLES } from 'authz-module/constants';
import messages from './messages';
import { getPermissionsCountByRole } from './utils';

type CellProps = TableCellValue<UserRole>;
type ActionsCellProps = CellProps & {
  onClickDeleteButton: (role: Role) => void;
};

export const ViewAllPermissionsCell = ({ row }: CellProps) => {
  const { formatMessage } = useIntl();
  return (
    <ViewMoreLink
      label={formatMessage(messages['authz.user.table.view_all_permissions.link.text'])}
      // TODO: Implement view more functionality
      onClick={() => console.log('View more clicked for row:', row)}
      iconSrc={ExpandMore}
    />
  );
};

export const ActionsCell = ({ row, onClickDeleteButton }: ActionsCellProps) => {
  const { formatMessage } = useIntl();
  const { role } = row.original;
  const handleDelete = () => {
    const roleToDelete = {
      name: role,
      scope: row.original.scope,
    } as Role;
    onClickDeleteButton(roleToDelete);
  };

  if (DJANGO_ROLES.includes(role)) {
    return (
      <OverlayTrigger
        placement="left"
        overlay={(
          <Tooltip variant="light" id="tooltip-left">
            {formatMessage(messages['authz.user.table.delete.action.djangorole.tooltip'])}
          </Tooltip>
      )}
      >
        <Icon
          className="mx-2 pl-1"
          src={Info}
        />
      </OverlayTrigger>
    );
  }

  if (ADMIN_ROLES.includes(role)) {
    return (
      <IconButton
        // @ts-ignore
        disabled
        isActive={false}
        variant="light"
        alt={formatMessage(messages['authz.user.table.delete.action.alt'])}
        src={Delete}
      />
    );
  }

  return (
    <IconButton variant="danger" onClick={handleDelete} alt={formatMessage(messages['authz.user.table.delete.action.alt'])} src={Delete} />
  );
};

export const PermissionsCell = ({ row }: CellProps) => {
  const { formatMessage } = useIntl();
  // TODO handle permissions length per role
  const count = getPermissionsCountByRole(row.original.role);
  return (
    <span>
      {formatMessage(messages['authz.user.table.permissions.available.count'], { count })}
    </span>
  );
};
