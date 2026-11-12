import { useIntl } from '@openedx/frontend-base';

import type { RoleCellProps } from '../types';

/**
 * Number of users holding the role, counted by the server in the scopes the user can view.
 * Localized, so large counts get the user's digit grouping (e.g. "1,234").
 */
const MembersCell = ({ row }: RoleCellProps) => {
  const { formatNumber } = useIntl();
  return <span>{formatNumber(row.original.members)}</span>;
};

export default MembersCell;
