import { useContext, useEffect, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  DataTableContext,
  Stack,
  TextFilter,
  Button,
  Chip,
  Alert,
  Icon,
} from '@openedx/paragon';
import {
  Business, Close, LocationOn, Person,
  Warning,
} from '@openedx/paragon/icons';

import { MAX_TABLE_FILTERS_APPLIED } from '@src/authz-module/constants';
import MultipleChoiceFilter from './MultipleChoiceFilter';
import SearchFilter from './SearchFilter';
import messages from '../messages';
import RolesFilter from './RolesFilter';
import OrgFilter from './OrgFilter';
import ScopesFilter from './ScopesFilter';
import { FilterChoice } from './types';

const FILTER_CHIPS_ICONS = {
  role: Person,
  organization: Business,
  scope: LocationOn,
};

const FILTER_GROUP_TO_ID = {
  role: 'role',
  organization: 'org',
  scope: 'scope',
};

interface TableControlBarProps {
  onFilterChange?: (filters: string[]) => void;
}

const TableControlBar = ({ onFilterChange }: TableControlBarProps) => {
  const intl = useIntl();
  // applied filters in the order they were selected by the user, to display on the control bar as chips
  const [chronologicalFilters, setChronologicalFilters] = useState<FilterChoice[]>([]);
  const [filtersLimitReached, setFiltersLimitReached] = useState(false);
  const {
    columns,
    setAllFilters,
    state,
  // @ts-ignore-next-line - Paragon's DataTableContext is not typed
  } = useContext<DataTableContext>(DataTableContext);

  useEffect(() => {
    if (state.filters.length > 0) {
      const formattedInitialFilters = state.filters.map((filter) => ({
        groupName: filter.id,
        value: filter.value[0] || '',
        displayName: filter.value[0] || '',
      }));
      setChronologicalFilters(formattedInitialFilters);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFiltersLimitReached(chronologicalFilters.length >= MAX_TABLE_FILTERS_APPLIED);
    if (onFilterChange) {
      onFilterChange(state.filters.map((filter) => filter.id) || []);
    }
  }, [chronologicalFilters, onFilterChange, state.filters]);

  const availableFilters = columns.filter((column) => column.canFilter)
    .sort((a, b) => (a.filterOrder || 0) - (b.filterOrder || 0));

  const columnTextFilterHeaders = columns
    .filter((column) => column.Filter === TextFilter)
    .map((column) => column.Header);

  const getSearchPlaceholder = () => intl.formatMessage(messages['authz.table.controlbar.search.by.fields'], {
    firstField: columnTextFilterHeaders[0] || '',
    secondField: columnTextFilterHeaders[1] || '',
  });

  const handleCloseFilter = (filterName, filterValue) => {
    const actualFilterId = FILTER_GROUP_TO_ID[filterName] || filterName;
    const filterGroup = state.filters.find((filter) => filter.id === actualFilterId);
    const newFilterValue = filterGroup?.value.filter(item => item !== filterValue) || [];
    setAllFilters(state.filters.map(item => (
      item.id !== actualFilterId ? item : { id: item.id, value: newFilterValue })));
    setChronologicalFilters((prevFilters) => prevFilters.filter((filter) => filter.value !== filterValue));
  };

  const handleSetFilters = (setFilter) => (allFilters: string[], newFilter: FilterChoice) => {
    setFilter(allFilters);
    setChronologicalFilters((prevFilters) => {
      if (!prevFilters.find((filter) => filter.value === newFilter.value)) {
        return [...prevFilters, newFilter];
      }
      return prevFilters.filter((filter) => filter.value !== newFilter.value);
    });
  };

  const clearAllFilters = () => {
    setAllFilters([]);
    setChronologicalFilters([]);
  };
  return (
    <div className="authz-table-control-bar pgn__data-table-status-bar">
      <Stack className="mb-2 flex-wrap" gap={2} direction="horizontal">
        {availableFilters.map((column) => {
          const { Filter } = column;
          if (Filter === RolesFilter) {
            return (
              <RolesFilter
                {...column}
                setFilter={handleSetFilters(column.setFilter)}
                disabled={filtersLimitReached}
              />
            );
          }
          if (Filter === OrgFilter) {
            return (
              <OrgFilter
                {...column}
                setFilter={handleSetFilters(column.setFilter)}
                disabled={filtersLimitReached}
              />
            );
          }
          if (Filter === MultipleChoiceFilter) {
            return (
              <MultipleChoiceFilter
                {...column}
                setFilter={handleSetFilters(column.setFilter)}
                disabled={filtersLimitReached}
              />
            );
          }
          if (Filter === ScopesFilter) {
            return (
              <ScopesFilter
                {...column}
                setFilter={handleSetFilters(column.setFilter)}
                disabled={filtersLimitReached}
                filterValue={state.filters.find(filter => filter.id === 'scope')?.value || null}
              />
            );
          }

          if (Filter === TextFilter) {
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
      </Stack>

      {chronologicalFilters.length > 0 && (
        <Stack gap={1} direction="horizontal" className="flex-wrap mb-2">
          <span>{intl.formatMessage(messages['authz.table.controlbar.filterby.label'])}</span>

            {chronologicalFilters.map((filter) => (
              <Chip
                key={filter.value}
                iconBefore={FILTER_CHIPS_ICONS[filter.groupName || '']}
                iconAfter={Close}
                onIconAfterClick={() => handleCloseFilter(filter.groupName, filter.value)}
              >
                {filter.displayName}
              </Chip>
            ))}
            {chronologicalFilters.length > 1 && (
              <Button className="py-0" variant="link" onClick={clearAllFilters}>
                {intl.formatMessage(messages['authz.table.controlbar.clearFilters'])}
              </Button>
            )}
        </Stack>
      )}
      { filtersLimitReached && (
      <Alert variant="warning" className="mb-2">
        <span className="d-flex flex-row">
          <Icon src={Warning} className="text-warning-400 mr-2" />
          {intl.formatMessage(messages['authz.table.controlbar.filters.limit.reached'])}
        </span>
      </Alert>
      )}

    </div>
  );
};

export default TableControlBar;
