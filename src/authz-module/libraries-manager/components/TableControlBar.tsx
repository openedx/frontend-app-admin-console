import { useContext } from 'react';
import {
  DataTable, DataTableContext,
  CheckboxFilter,
  Stack,
  TextFilter,
  Button,
} from '@openedx/paragon';

import MultipleChoiceFilter from './MultipleChoiceFilter';
import SortDropdown from './SortDropdown';
import SearchFilter from './SearchFilter';

const TableControlBar = () => {
  const {
    columns,
    setAllFilters,
    state,
  } = useContext<DataTableContext>(DataTableContext);

  const availableFilters = columns.filter((column) => column.canFilter);

  const columnTextFilterHeaders = columns
    .filter((column) => column.Filter === TextFilter)
    .map((column) => column.Header);

  return (
    <Stack className="pgn__data-table-status-bar mb-3 flex-wrap" gap={2} direction="horizontal">

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

      {state.filters.length > 0 && (
      <Button
        variant="link"
        onClick={() => setAllFilters([])}
      >
        Clear filters
      </Button>
      )}

      <DataTable.RowStatus className="ml-auto" />
    </Stack>
  );
};

export default TableControlBar;
