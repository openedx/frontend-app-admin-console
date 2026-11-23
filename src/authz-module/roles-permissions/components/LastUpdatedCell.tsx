import { useIntl } from '@openedx/frontend-base';

import type { RoleCellProps } from '@src/authz-module/roles-permissions/types';

/** Localized update time, or "-" when the role has none. */
const LastUpdatedCell = ({ row }: RoleCellProps) => {
  const { formatDate } = useIntl();
  const { updatedAt } = row.original;
  if (!updatedAt) return <span>-</span>;
  return (
    <time dateTime={updatedAt}>
      {formatDate(updatedAt, {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
      })}
    </time>
  );
};

export default LastUpdatedCell;
