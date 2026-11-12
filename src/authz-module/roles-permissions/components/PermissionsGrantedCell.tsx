import { useIntl } from '@openedx/frontend-base';

import messages from '@src/authz-module/roles-permissions/messages';
import type { RoleCellProps } from '@src/authz-module/roles-permissions/types';

/** Number of permissions the role grants in its resource type, e.g. "14 Granted". */
const PermissionsGrantedCell = ({ row }: RoleCellProps) => {
  const { formatMessage } = useIntl();
  return (
    <span>
      {formatMessage(messages['authz.roles.table.permissions.granted'], { count: row.original.permissionCount })}
    </span>
  );
};

export default PermissionsGrantedCell;
