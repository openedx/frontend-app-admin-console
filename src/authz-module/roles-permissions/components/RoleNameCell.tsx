import { useIntl } from '@openedx/frontend-base';

import messages from '../messages';
import type { RoleCellProps } from '../types';

/** Role name, with a "Custom Role" sub-label for user-defined roles. */
const RoleNameCell = ({ row }: RoleCellProps) => {
  const { formatMessage } = useIntl();
  const { name, isCustom } = row.original;
  return (
    <div className="d-flex flex-column">
      <span>{name}</span>
      {isCustom && (
        <span className="x-small text-info-500">
          {formatMessage(messages['authz.roles.table.custom.role.label'])}
        </span>
      )}
    </div>
  );
};

export default RoleNameCell;
