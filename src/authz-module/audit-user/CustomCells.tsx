import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import ViewMoreLink from '@src/authz-module/components/ViewMoreLink';
import { Delete, ExpandMore } from '@openedx/paragon/icons';
import { IconButton, DataTableContext } from '@openedx/paragon';
import { TableCellValue, UserRole } from 'types';
import messages from './messages';

interface ExpandableTableRow<T> extends TableCellValue<T> {
  row: TableCellValue<T>['row'] & {
    id: string;
    isExpanded: boolean;
    toggleRowExpanded: () => void;
    values: T;
  };
}

type CellProps = ExpandableTableRow<UserRole>;

export const ViewAllPermissionsCell = ({ row }: CellProps) => {
  const { formatMessage } = useIntl();
  const instance = useContext(DataTableContext);
  const handleToggleExpanded = () => {
    if (!row.isExpanded && instance) {
      // Close all other expanded rows first
      const expanded = (instance as any)?.state?.expanded || {};
      Object.keys(expanded).forEach(rowId => {
        if (rowId !== row.id && expanded[rowId]) {
          (instance as any).toggleRowExpanded?.(rowId, false);
        }
      });
    }
    // Toggle the current row
    row.toggleRowExpanded();
  };

  return (
    <ViewMoreLink
      label={formatMessage(
        row.isExpanded
          ? messages['authz.user.table.view_all_permissions.link.text.close']
          : messages['authz.user.table.view_all_permissions.link.text.open'],
      )}
      onClick={handleToggleExpanded}
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
  const permissionCount = row.original.permissionCount || 0;
  return (
    <span>
      {formatMessage(messages['authz.user.table.permissions.available.count'], { count: permissionCount })}
    </span>
  );
};
