import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
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
import messages from './messages';

const TableControlBar = () => {
  const intl = useIntl();
  const {
    columns,
    setAllFilters,
    state,
  } = useContext<DataTableContext>(DataTableContext);

  const availableFilters = columns.filter((column) => column.canFilter);

  const columnTextFilterHeaders = columns
    .filter((column) => column.Filter === TextFilter)
    .map((column) => column.Header);

  const getSearchPlaceholder = () => intl.formatMessage(messages['authz.libraries.team.table.search'], {
    firstField: columnTextFilterHeaders[0] || 'field',
    secondField: columnTextFilterHeaders[1] || 'field',
  });

  return (
    <Stack className="pgn__data-table-status-bar mb-3 flex-wrap" gap={2} direction="horizontal">

      {availableFilters.map((column) => {
        if (column.Filter === CheckboxFilter) {
          return <MultipleChoiceFilter {...column} />;
        }

        if (column.Filter === TextFilter) {
          return (
            <SearchFilter
              key={column.id || column.accessor}
              filterValue={column.filterValue}
              setFilter={column.setFilter}
              placeholder={getSearchPlaceholder()}
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
