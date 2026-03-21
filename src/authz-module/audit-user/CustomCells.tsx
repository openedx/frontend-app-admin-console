import { useIntl } from '@edx/frontend-platform/i18n';
import ViewMoreLink from '@src/authz-module/components/ViewMoreLink';
import { Delete, ExpandMore } from '@openedx/paragon/icons';
import { IconButton } from '@openedx/paragon';
import { TableCellValue, UserRole } from 'types';
import messages from './messages';
import { getPermissionsCountByRole } from './utils';

type CellProps = TableCellValue<UserRole>;

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

export const ActionsCell = ({ row }: CellProps) => {
  const { formatMessage } = useIntl();
  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete clicked for row:', row);
  };

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
