import { useIntl } from '@openedx/frontend-base';

import type { RoleCellProps } from '../types';

/** Localized update time, or "-" when the role has none. */
const LastUpdatedCell = ({ row }: RoleCellProps) => {
  const { formatDate } = useIntl();
  const { lastUpdated } = row.original;
  if (!lastUpdated) return <span>-</span>;
  return (
    <span>
      {formatDate(lastUpdated, {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
      })}
    </span>
  );
};

export default LastUpdatedCell;
