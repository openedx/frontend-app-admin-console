import { useContext } from 'react';
import {
  breakpoints,
  DataTable, DataTableContext,
  CheckboxFilter,
  Stack,
  TextFilter,
  useWindowSize,
} from '@openedx/paragon';

import MultipleChoiceFilter from './MultipleChoiceFilter';
import SortDropdown from './SortDropdown';
import SearchFilter from './SearchFilter';

const TableControlBar = () => {
  const {
    columns,
  } = useContext<DataTableContext>(DataTableContext);

  const availableFilters = columns.filter((column) => column.canFilter);

  const columnTextFilterHeaders = columns
    .filter((column) => column.Filter === TextFilter)
    .map((column) => column.Header);

  const isSmallScreen = useWindowSize().width! < breakpoints.medium.minWidth!;

  return (
    <div className="pgn__data-table-status-bar">
      <Stack className="mb-3" direction={isSmallScreen ? 'vertical' : 'horizontal'} gap={3}>

        {availableFilters.map((column) => {
          if (column.Filter === CheckboxFilter) {
            return <MultipleChoiceFilter {...column} />;
          }

          if (column.Filter === TextFilter) {
            return (
              <SearchFilter
                filterValue={column.filterValue}
                setFilter={column.setFilter}
                placeholder={`Search by ${columnTextFilterHeaders.map((header) => header).join(' or ')}`}
              />
            );
          }

          return null;
        })}

        <SortDropdown />
      </Stack>

      <DataTable.RowStatus />
      <DataTable.BulkActions />
    </div>
  );
};

export default TableControlBar;
