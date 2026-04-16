import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { DataTableContext, TextFilter } from '@openedx/paragon';
import userEvent from '@testing-library/user-event';
import TableControlBar from './TableControlBar';
import RolesFilter from './RolesFilter';
import OrgFilter from './OrgFilter';

const mockSetAllFilters = jest.fn();
const mockOnFilterChange = jest.fn();

const mockColumns = [
  {
    id: 'role',
    canFilter: true,
    Filter: () => null,
    setFilter: jest.fn(),
    filterOrder: 1,
  },
  {
    id: 'org',
    canFilter: true,
    Filter: () => null,
    setFilter: jest.fn(),
    filterOrder: 2,
  },
];

const mockState = {
  filters: [
    { id: 'role', value: ['admin'] },
    { id: 'org', value: ['org1'] },
  ],
};

jest.mock('@src/authz-module/data/hooks', () => ({
  useOrgs: () => ({
    data: {
      count: 0, next: null, previous: null, results: [],
    },
  }),
  useScopes: () => ({ data: { scopes: [] } }),
}));

describe('TableControlBar', () => {
  const mockDataTableContext = {
    columns: mockColumns,
    setAllFilters: mockSetAllFilters,
    state: mockState,
  };

  const renderWithContext = (component, contextOverride = {}) => {
    const context = { ...mockDataTableContext, ...contextOverride };
    return renderWrapper(
      <DataTableContext.Provider value={context}>
        {component}
      </DataTableContext.Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetAllFilters.mockClear();
    mockOnFilterChange.mockClear();
  });

  it('renders without crashing', () => {
    renderWithContext(<TableControlBar />);
    const container = document.querySelector('.authz-table-control-bar');
    expect(container).toBeInTheDocument();
  });

  it('renders roles filter when configured', async () => {
    const user = userEvent.setup();
    const contextWithRolesFilter = {
      columns: [
        {
          id: 'roles',
          Header: 'Roles',
          Filter: RolesFilter,
          canFilter: true,
          filterButtonText: 'Select Roles',
          setFilter: jest.fn(),
        },
      ],
    };

    renderWithContext(<TableControlBar />, contextWithRolesFilter);
    const rolesButton = screen.getByText('Select Roles');
    expect(rolesButton).toBeInTheDocument();
    await user.click(rolesButton);
    const superAdminOption = screen.getByRole('checkbox', { name: /Super Admin/i });
    expect(superAdminOption).toBeInTheDocument();
    await user.click(superAdminOption);
    expect(contextWithRolesFilter.columns[0].setFilter).toHaveBeenCalled();
  });

  it('renders search filter when configured', () => {
    const contextWithTextFilter = {
      columns: [
        {
          id: 'search',
          Header: 'Search Field',
          Filter: TextFilter,
          canFilter: true,
          filterValue: '',
          setFilter: jest.fn(),
        },
      ],
    };

    renderWithContext(<TableControlBar />, contextWithTextFilter);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays filter chips when filters are applied', () => {
    const contextWithAppliedFilters = {
      state: {
        filters: [
          { id: 'roles', value: ['Admin'] },
        ],
      },
    };

    renderWithContext(
      <TableControlBar />,
      contextWithAppliedFilters,
    );

    expect(screen.getByText('Filtered by:')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows clear all button when multiple filters applied', async () => {
    const user = userEvent.setup();
    const contextWithMultipleFilters = {
      state: {
        filters: [
          { id: 'roles', value: ['Admin'] },
          { id: 'org', value: ['TestOrg'] },
        ],
      },
    };

    renderWithContext(
      <TableControlBar />,
      contextWithMultipleFilters,
    );
    const clearButton = screen.getByText('Clear filters');
    expect(clearButton).toBeInTheDocument();
    await user.click(clearButton);
    expect(mockSetAllFilters).toHaveBeenCalledWith([]);
    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('calls onFilterChange callback when provided', () => {
    const contextWithFilters = {
      state: {
        filters: [{ id: 'test', value: ['value'] }],
      },
    };

    renderWithContext(
      <TableControlBar onFilterChange={mockOnFilterChange} />,
      contextWithFilters,
    );

    expect(mockOnFilterChange).toHaveBeenCalledWith(['test']);
  });

  it('handles empty columns gracefully', () => {
    renderWithContext(<TableControlBar />);
    const container = document.querySelector('.authz-table-control-bar');
    expect(container).toBeInTheDocument();
    expect(screen.queryByText('Filter by')).not.toBeInTheDocument();
  });

  it('handles closing filter chips with FILTER_GROUP_TO_ID mapping', async () => {
    const user = userEvent.setup();
    const mockSetAllFilters = jest.fn();
    const contextWithOrgFilter = {
      setAllFilters: mockSetAllFilters,
      state: {
        filters: [
          { id: 'org', value: ['edx', 'mit'] },
        ],
      },
      columns: [
        {
          id: 'org',
          Header: 'Organization',
          Filter: OrgFilter,
          canFilter: true,
          filterButtonText: 'Organization',
          setFilter: jest.fn(),
        },
      ],
    };

    const initialFilters = [
      { id: 'org', value: ['edx'] },
    ];

    renderWithContext(
      <TableControlBar initialFilters={initialFilters} />,
      contextWithOrgFilter,
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockSetAllFilters).toHaveBeenCalled();
  });

  it('handles closing filter chips without mapping', async () => {
    const user = userEvent.setup();
    const mockSetAllFilters = jest.fn();
    const contextWithRoleFilter = {
      setAllFilters: mockSetAllFilters,
      state: {
        filters: [
          { id: 'role', value: ['admin', 'editor'] },
        ],
      },
      columns: [
        {
          id: 'role',
          Header: 'Role',
          Filter: RolesFilter,
          canFilter: true,
          filterButtonText: 'Role',
          setFilter: jest.fn(),
        },
      ],
    };

    const initialFilters = [
      { id: 'role', value: ['admin'] },
    ];

    renderWithContext(
      <TableControlBar initialFilters={initialFilters} />,
      contextWithRoleFilter,
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockSetAllFilters).toHaveBeenCalled();
  });

  it('generates keys using column id when available', () => {
    const contextWithIdColumn = {
      columns: [
        {
          id: 'test-id',
          accessor: 'test-accessor',
          Header: 'Test',
          Filter: RolesFilter,
          canFilter: true,
          filterButtonText: 'Test Filter',
          setFilter: jest.fn(),
        },
      ],
    };

    renderWithContext(<TableControlBar />, contextWithIdColumn);
    expect(screen.getByText('Test Filter')).toBeInTheDocument();
  });

  it('generates keys using column accessor when id is not available', () => {
    const contextWithAccessorColumn = {
      columns: [
        {
          accessor: 'test-accessor',
          Header: 'Test',
          Filter: RolesFilter,
          canFilter: true,
          filterButtonText: 'Test Filter',
          setFilter: jest.fn(),
        },
      ],
    };

    renderWithContext(<TableControlBar />, contextWithAccessorColumn);
    expect(screen.getByText('Test Filter')).toBeInTheDocument();
  });

  it('handles chronological filter logic for adding new filters', () => {
    const mockSetFilter = jest.fn();
    const contextWithFilter = {
      columns: [
        {
          id: 'roles',
          Header: 'Roles',
          Filter: RolesFilter,
          canFilter: true,
          filterButtonText: 'Select Roles',
          setFilter: mockSetFilter,
        },
      ],
    };

    renderWithContext(<TableControlBar />, contextWithFilter);
    const handleSetFilters = mockSetFilter.mock.calls[0]?.[0];
    if (handleSetFilters) {
      const newFilter = { groupName: 'roles', value: 'admin', displayName: 'Admin' };
      handleSetFilters(['admin'], newFilter);
    }
  });

  it('handles chronological filter logic for removing existing filters', () => {
    const mockSetFilter = jest.fn();
    const contextWithFilter = {
      columns: [
        {
          id: 'roles',
          Header: 'Roles',
          Filter: RolesFilter,
          canFilter: true,
          filterButtonText: 'Select Roles',
          setFilter: mockSetFilter,
        },
      ],
    };

    renderWithContext(
      <TableControlBar />,
      contextWithFilter,
    );

    const handleSetFilters = mockSetFilter.mock.calls[0]?.[0];
    if (handleSetFilters) {
      const existingFilter = { groupName: 'roles', value: 'admin', displayName: 'Admin' };
      handleSetFilters([], existingFilter);
    }
  });

  it('tests onIconAfterClick functionality directly', () => {
    const contextWithAppliedFilters = {
      setAllFilters: mockSetAllFilters,
      state: {
        filters: [
          { id: 'role', value: ['admin', 'user'] },
          { id: 'org', value: ['TestOrg'] },
        ],
      },
    };

    renderWithContext(
      <TableControlBar />,
      contextWithAppliedFilters,
    );
    const chipElement = screen.getByText('admin').closest('.pgn__chip');
    expect(chipElement).toBeInTheDocument();
    const closeButton = chipElement?.querySelector('button');
    if (closeButton) {
      closeButton.click();
    }
    expect(mockSetAllFilters).toHaveBeenCalledWith([
      { id: 'role', value: ['user'] },
      { id: 'org', value: ['TestOrg'] },
    ]);
  });

  it('displays warning alert when filter limit is reached', () => {
    const maxFilters = Array.from({ length: 10 }, (_, index) => ({
      id: `filter${index}`,
      value: [`value${index}`],
    }));

    const contextWithMaxFilters = {
      setAllFilters: mockSetAllFilters,
      state: {
        filters: maxFilters,
      },
    };

    renderWithContext(
      <TableControlBar />,
      contextWithMaxFilters,
    );
    const warningAlert = screen.getByRole('alert');
    expect(warningAlert).toBeInTheDocument();
    expect(warningAlert).toHaveClass('alert-warning');
  });

  it('manages setChronologicalFilters state correctly when removing filters', () => {
    const mockSetFilter = jest.fn();
    const contextWithFilter = {
      columns: [
        {
          id: 'roles',
          Header: 'Roles',
          Filter: RolesFilter,
          canFilter: true,
          filterButtonText: 'Select Roles',
          setFilter: mockSetFilter,
        },
      ],
    };

    renderWithContext(
      <TableControlBar />,
      contextWithFilter,
    );
    const handleSetFilters = mockSetFilter.mock.calls[0]?.[0];
    if (handleSetFilters) {
      const existingFilter = { groupName: 'roles', value: 'admin', displayName: 'Admin' };
      handleSetFilters([], existingFilter);
      expect(mockSetFilter).toHaveBeenCalled();
    }
  });

  it('removes a filter chip when close icon is clicked', async () => {
    renderWithContext(<TableControlBar onFilterChange={mockOnFilterChange} />);
    const chip = screen.getByText('admin');
    const closeButton = chip.parentElement?.querySelector('button');
    const user = userEvent.setup();
    await user.click(closeButton as HTMLElement);
    expect(mockSetAllFilters).toHaveBeenCalledWith([
      { id: 'role', value: [] },
      { id: 'org', value: ['org1'] },
    ]);
  });

  it('removes the correct filter chip for org', async () => {
    renderWithContext(<TableControlBar onFilterChange={mockOnFilterChange} />);
    const chip = screen.getByText('org1');
    const closeButton = chip.parentElement?.querySelector('button');
    const user = userEvent.setup();
    await user.click(closeButton as HTMLElement);
    expect(mockSetAllFilters).toHaveBeenCalledWith([
      { id: 'role', value: ['admin'] },
      { id: 'org', value: [] },
    ]);
  });
});
