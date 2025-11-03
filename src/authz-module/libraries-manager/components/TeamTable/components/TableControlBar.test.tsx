import { screen } from '@testing-library/react';
import {
  DataTableContext, CheckboxFilter, TextFilter,
} from '@openedx/paragon';
import { renderWrapper } from '@src/setupTest';
import userEvent from '@testing-library/user-event';
import TableControlBar from './TableControlBar';

jest.mock('./MultipleChoiceFilter', () => {
  const MockMultipleChoiceFilter = (props: { id?: string; accessor?: string }) => (
    <div role="group" aria-label={`Filter by ${props.id || props.accessor}`}>
      Multiple Choice Filter
    </div>
  );
  MockMultipleChoiceFilter.displayName = 'MultipleChoiceFilter';
  return MockMultipleChoiceFilter;
});

jest.mock('./SortDropdown', () => {
  const MockSortDropdown = () => (
    <div role="group" aria-label="Sort options">
      Sort Dropdown
    </div>
  );
  MockSortDropdown.displayName = 'SortDropdown';
  return MockSortDropdown;
});

jest.mock('./SearchFilter', () => {
  // eslint-disable-next-line react/prop-types
  const MockSearchFilter = (props) => (
    <div role="search" aria-label="Search filter">
      <input
        // eslint-disable-next-line react/prop-types
        placeholder={props.placeholder}
        // eslint-disable-next-line react/prop-types
        value={props.filterValue || ''}
        // eslint-disable-next-line react/prop-types
        onChange={(e) => props.setFilter(e.target.value)}
        aria-label="Search input"
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

    expect(screen.getByRole('group', { name: 'Sort options' })).toBeInTheDocument();
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

    const multipleChoiceFilter = screen.getByRole('group', { name: 'Filter by roles' });
    expect(multipleChoiceFilter).toBeInTheDocument();
    expect(screen.getByText('Multiple Choice Filter')).toBeInTheDocument();
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

    expect(screen.getByRole('search', { name: 'Search filter' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search input' })).toBeInTheDocument();
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
    expect(screen.getByRole('group', { name: 'Sort options' })).toBeInTheDocument();
    expect(screen.queryByRole('search', { name: 'Search filter' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /Filter by/ })).not.toBeInTheDocument();
  });
});
