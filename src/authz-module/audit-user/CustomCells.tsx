import { useIntl } from '@edx/frontend-platform/i18n';
import ViewMoreLink from '@src/authz-module/components/ViewMoreLink';
import { Delete, ExpandMore } from '@openedx/paragon/icons';
import { IconButton } from '@openedx/paragon';
import { TableCellValue, UserRole } from 'types';
import messages from './messages';
import { getPermissionsCountByRole } from './utils';

interface ExpandableTableRow<T> extends TableCellValue<T> {
  row: TableCellValue<T>['row'] & {
    isExpanded: boolean;
    toggleRowExpanded: () => void;
    values: T;
  };
}

type CellProps = ExpandableTableRow<UserRole>;

export const ViewAllPermissionsCell = ({ row }: CellProps) => {
  const { formatMessage } = useIntl();
  return (
    <ViewMoreLink
      label={formatMessage(
        row.isExpanded
          ? messages['authz.user.table.view_all_permissions.link.text.close']
          : messages['authz.user.table.view_all_permissions.link.text.open'],
      )}
      onClick={() => row.toggleRowExpanded()}
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
  if (row.original.permissions.length === 1) {
    return <span>{row.original.permissions[0]}</span>;
  }
  const count = getPermissionsCountByRole(row.original.role);
  return (
    <span>
      {formatMessage(messages['authz.user.table.permissions.available.count'], { count })}
    </span>
  );
};
