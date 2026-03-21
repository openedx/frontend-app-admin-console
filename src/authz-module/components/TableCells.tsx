import { TableCellValue, TeamMember } from '@src/types';

type CellProps = TableCellValue<TeamMember>;
type ExtendedCellProps = CellProps & {
  value: string;
  cell: {
    getCellProps: (props?: Record<string, string>) => Record<string, string>;
  };
};

const RoleCell = ({ value, cell }: ExtendedCellProps) => (
  <td {...cell.getCellProps({ 'data-role': value })}>
    {value}
  </td>
);

export {
  RoleCell,
};
