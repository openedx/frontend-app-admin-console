import LastUpdatedTime from '@src/authz-module/components/LastUpdatedTime';
import type { RoleCellProps } from '@src/authz-module/roles-permissions/types';

const LastUpdatedCell = ({ row }: RoleCellProps) => (
  <LastUpdatedTime updatedAt={row.original.updatedAt} />
);

export default LastUpdatedCell;
