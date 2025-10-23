import { screen } from '@testing-library/react';
import {
  DataTableContext, CheckboxFilter, TextFilter,
} from '@openedx/paragon';
import { renderWrapper } from '@src/setupTest';
import userEvent from '@testing-library/user-event';
import TableControlBar from './TableControlBar';

jest.mock('./MultipleChoiceFilter', () => {
  // eslint-disable-next-line react/prop-types
  const MockMultipleChoiceFilter = (props) => (
    // eslint-disable-next-line react/prop-types
    <div data-testid="multiple-choice-filter" data-column-id={props.id || props.accessor}>
      Multiple Choice Filter
    </div>
  );
  MockMultipleChoiceFilter.displayName = 'MultipleChoiceFilter';
  return MockMultipleChoiceFilter;
});

jest.mock('./SortDropdown', () => {
  const MockSortDropdown = () => (
    <div data-testid="sort-dropdown">
      Sort Dropdown
    </div>
  );
  MockSortDropdown.displayName = 'SortDropdown';
  return MockSortDropdown;
});

jest.mock('./SearchFilter', () => {
  // eslint-disable-next-line react/prop-types
  const MockSearchFilter = (props) => (
    <div data-testid="search-filter">
      <input
        // eslint-disable-next-line react/prop-types
        placeholder={props.placeholder}
        // eslint-disable-next-line react/prop-types
        value={props.filterValue || ''}
        // eslint-disable-next-line react/prop-types
        onChange={(e) => props.setFilter(e.target.value)}
        data-testid="search-input"
      />
    </div>
  );
  MockSearchFilter.displayName = 'SearchFilter';
  return MockSearchFilter;
});

describe('TableControlBar', () => {
  const mockSetAllFilters = jest.fn();
  const mockSetFilter = jest.fn();

  const defaultContextValue = {
    columns: [] as any[],
    setAllFilters: mockSetAllFilters,
    state: {
      filters: [] as any[],
    },
  };

  const renderWithContext = (contextValue = defaultContextValue) => (
    renderWrapper(
      <DataTableContext.Provider value={contextValue}>
        <TableControlBar />
      </DataTableContext.Provider>,
    )
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render basic structure with SortDropdown and RowStatus', () => {
    renderWithContext();

    expect(screen.getByTestId('sort-dropdown')).toBeInTheDocument();
    const container = screen.getByText('Sort Dropdown').closest('.pgn__data-table-status-bar');
    expect(container).toHaveClass('pgn__data-table-status-bar', 'mb-3', 'flex-wrap');
  });

  it('should not render Clear filters button when no filters are active', () => {
    renderWithContext();

    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('should render Clear filters button when filters are active', () => {
    const contextWithFilters = {
      ...defaultContextValue,
      state: {
        filters: [{ id: 'username', value: 'test' }],
      },
    };

    renderWithContext(contextWithFilters);

    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('should call setAllFilters with empty array when Clear filters is clicked', async () => {
    const user = userEvent.setup();
    const contextWithFilters = {
      ...defaultContextValue,
      state: {
        filters: [{ id: 'username', value: 'test' }],
      },
    };

    renderWithContext(contextWithFilters);

    const clearButton = screen.getByText('Clear filters');
    await user.click(clearButton);

    expect(mockSetAllFilters).toHaveBeenCalledWith([]);
  });

  it('should render MultipleChoiceFilter for columns with CheckboxFilter', () => {
    const contextWithCheckboxColumn = {
      ...defaultContextValue,
      columns: [
        {
          id: 'roles',
          Header: 'Roles',
          Filter: CheckboxFilter,
          canFilter: true,
          accessor: 'roles',
        },
      ],
    };

    renderWithContext(contextWithCheckboxColumn);

    const multipleChoiceFilter = screen.getByTestId('multiple-choice-filter');
    expect(multipleChoiceFilter).toBeInTheDocument();
    expect(multipleChoiceFilter).toHaveAttribute('data-column-id', 'roles');
  });

  it('should render SearchFilter for columns with TextFilter', () => {
    const contextWithTextColumn = {
      ...defaultContextValue,
      columns: [
        {
          id: 'username',
          Header: 'Username',
          Filter: TextFilter,
          canFilter: true,
          filterValue: '',
          setFilter: mockSetFilter,
          accessor: 'username',
        },
      ],
    };

    renderWithContext(contextWithTextColumn);

    expect(screen.getByTestId('search-filter')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('should not render any filter for unsupported Filter types', () => {
    const CustomFilter = () => <div>Custom Filter</div>;

    const contextWithCustomFilter = {
      ...defaultContextValue,
      columns: [
        {
          id: 'custom',
          Header: 'Custom',
          Filter: CustomFilter,
          canFilter: true,
        },
      ],
    };

    renderWithContext(contextWithCustomFilter);

    // Only SortDropdown should be present, no filter components
    expect(screen.getByTestId('sort-dropdown')).toBeInTheDocument();
    expect(screen.queryByTestId('search-filter')).not.toBeInTheDocument();
    expect(screen.queryByTestId('multiple-choice-filter')).not.toBeInTheDocument();
  });
});
