import {
  render, screen, fireEvent, act,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { DataTableContext } from '@openedx/paragon';
import SortDropdown from './SortDropdown';

jest.mock('@edx/frontend-platform/i18n', () => jest.requireActual('@edx/frontend-platform/i18n'));

describe('SortDropdown', () => {
  const mockToggleSortBy = jest.fn();

  const defaultDataTableState = {
    sortBy: [],
    filters: [],
    pageSize: 10,
    pageIndex: 0,
  };

  const mockDataTableContext = {
    state: defaultDataTableState,
    toggleSortBy: mockToggleSortBy,
  };

  const renderSortDropdown = (contextOverrides = {}) => {
    const contextValue = {
      ...mockDataTableContext,
      ...contextOverrides,
    };

    return render(
      <IntlProvider locale="en">
        <DataTableContext.Provider value={contextValue}>
          <SortDropdown />
        </DataTableContext.Provider>
      </IntlProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the sort dropdown with default label', () => {
    renderSortDropdown();

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });

  it('should render all sort options when dropdown is opened', () => {
    renderSortDropdown();

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Name A-Z')).toBeInTheDocument();
    expect(screen.getByText('Name Z-A')).toBeInTheDocument();
    expect(screen.getByText('Newest')).toBeInTheDocument();
    expect(screen.getByText('Oldest')).toBeInTheDocument();
  });

  it('should display current sort when a sort is active', () => {
    const contextWithSort = {
      state: {
        ...defaultDataTableState,
        sortBy: [{ id: 'username', desc: false }],
      },
    };

    renderSortDropdown(contextWithSort);

    expect(screen.getByText('Name A-Z')).toBeInTheDocument();
  });

  it('should display descending sort correctly', () => {
    const contextWithSort = {
      state: {
        ...defaultDataTableState,
        sortBy: [{ id: 'username', desc: true }],
      },
    };

    renderSortDropdown(contextWithSort);

    expect(screen.getByText('Name Z-A')).toBeInTheDocument();
  });

  it('should display newest sort correctly', () => {
    const contextWithSort = {
      state: {
        ...defaultDataTableState,
        sortBy: [{ id: 'createdAt', desc: true }],
      },
    };

    renderSortDropdown(contextWithSort);

    expect(screen.getByText('Newest')).toBeInTheDocument();
  });

  it('should display oldest sort correctly', () => {
    const contextWithSort = {
      state: {
        ...defaultDataTableState,
        sortBy: [{ id: 'createdAt', desc: false }],
      },
    };

    renderSortDropdown(contextWithSort);

    expect(screen.getByText('Oldest')).toBeInTheDocument();
  });

  it('should handle sort selection and call toggleSortBy', () => {
    renderSortDropdown();

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    const nameAZOption = screen.getByText('Name A-Z');

    act(() => {
      fireEvent.click(nameAZOption);
    });

    expect(mockToggleSortBy).toHaveBeenCalledWith('username', false);

    const nameZAOption = screen.getByText('Name Z-A');

    act(() => {
      fireEvent.click(nameZAOption);
    });

    expect(mockToggleSortBy).toHaveBeenCalledWith('username', true);

    const newestOption = screen.getByText('Newest');

    act(() => {
      fireEvent.click(newestOption);
    });

    expect(mockToggleSortBy).toHaveBeenCalledWith('createdAt', true);
  });

  it('should mark the active sort option as active', () => {
    const contextWithSort = {
      state: {
        ...defaultDataTableState,
        sortBy: [{ id: 'username', desc: false }],
      },
    };

    renderSortDropdown(contextWithSort);

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    // Get all elements with "Name A-Z" text and find the dropdown item
    const nameAZOptions = screen.getAllByText('Name A-Z');
    const dropdownItem = nameAZOptions.find(element => element.closest('.dropdown-item'));
    expect(dropdownItem?.closest('.dropdown-item')).toHaveClass('active');
  });

  it('should handle undefined sortBy', () => {
    const contextWithUndefinedSort = {
      state: {
        ...defaultDataTableState,
        sortBy: undefined,
      },
    };

    renderSortDropdown(contextWithUndefinedSort);

    expect(screen.getByText('Sort')).toBeInTheDocument();
  });
});
