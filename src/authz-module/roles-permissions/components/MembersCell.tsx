import type { RoleCellProps } from '../types';

/** Member count, or "-" while the catalog does not provide one. */
const MembersCell = ({ row }: RoleCellProps) => <span>{row.original.members ?? '-'}</span>;

export default MembersCell;
