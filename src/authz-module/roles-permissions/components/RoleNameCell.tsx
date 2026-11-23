import { useIntl } from '@openedx/frontend-base';

import { isCustomRole } from '@src/authz-module/catalog';
import messages from '@src/authz-module/roles-permissions/messages';
import type { RoleCellProps } from '@src/authz-module/roles-permissions/types';

/** Role name, with a "Custom Role" sub-label for user-defined roles. */
const RoleNameCell = ({ row }: RoleCellProps) => {
  const { formatMessage } = useIntl();
  return (
    <div className="d-flex flex-column">
      <span>{row.original.displayName}</span>
      {isCustomRole(row.original) && (
        <span className="x-small text-info-500">
          {formatMessage(messages['authz.roles.table.custom.role.label'])}
        </span>
      )}
    </div>
  );
};

export default RoleNameCell;
