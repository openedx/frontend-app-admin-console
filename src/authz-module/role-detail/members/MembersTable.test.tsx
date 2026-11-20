import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders } from '@src/testUtils';
import { useTeamMembersAssignments } from '@src/authz-module/data/hooks';
import { mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import messages from '../messages';
import MembersTable from './MembersTable';

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
}));

jest.mock('@src/authz-module/data/hooks', () => ({
  ...jest.requireActual('@src/authz-module/data/hooks'),
  useTeamMembersAssignments: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ roleId: 'custom-role-123' }),
  useNavigate: jest.fn(() => jest.fn()),
}));

const mockUseTeamMembersAssignments = useTeamMembersAssignments as jest.Mock;

const mockMembersData = {
  data: {
    results: [
      {
        username: 'instructor1',
        fullName: 'Instructor One',
        email: 'instructor1@example.com',
        assignmentCount: 2,
        assignments: [
          {
            role: 'custom-role-123',
            org: 'OpenedX',
            scope: 'course-v1:OpenedX+DemoX+Demo',
            scopeDisplayName: 'Demo Course',
            permissionCount: 5,
          },
          {
            role: 'custom-role-123',
            org: 'WGU',
            scope: 'course-v1:WGU+Math+101',
            scopeDisplayName: 'Math 101',
            permissionCount: 3,
          },
        ],
      },
      {
        username: 'instructor2',
        fullName: 'Instructor Two',
        email: 'instructor2@example.com',
        assignmentCount: 1,
        assignments: [
          {
            role: 'custom-role-123',
            org: 'OpenedX',
            scope: 'lib:OpenedX:CONTENT',
            scopeDisplayName: 'Content Library',
            permissionCount: 7,
          },
        ],
      },
    ],
    count: 3,
    next: null,
    previous: null,
  },
  error: null,
  isLoading: false,
  refetch: jest.fn(),
};

const renderMembersTable = (props = {}) => renderWithAllProviders(
  <ToastManagerProvider><MembersTable onDelete={jest.fn()} {...props} /></ToastManagerProvider>,
);

describe('MembersTable', () => {
  beforeEach(() => {
    mockAuthzCatalog();
    mockUseTeamMembersAssignments.mockReturnValue(mockMembersData);
  });

  it('renders table with column headers', () => {
    renderMembersTable();
    // Look specifically for headers inside the table
    expect(screen.getByRole('columnheader', { name: messages['authz.custom.role.members.table.column.header.username'].defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: messages['authz.custom.role.members.table.column.header.email'].defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: messages['authz.custom.role.members.table.column.header.scope'].defaultMessage })).toBeInTheDocument();
  });

  it('renders flattened members (one row per assignment)', async () => {
    renderMembersTable();

    await waitFor(() => {
      // instructor1 has 2 assignments, instructor2 has 1 = 3 total rows
      expect(screen.getAllByText('instructor1')).toHaveLength(2);
      expect(screen.getByText('instructor2')).toBeInTheDocument();
    });
  });

  it('renders member usernames correctly', async () => {
    renderMembersTable();

    await waitFor(() => {
      const usernames = screen.getAllByText('instructor1');
      expect(usernames.length).toBeGreaterThan(0);
      expect(screen.getByText('instructor2')).toBeInTheDocument();
    });
  });

  it('renders member emails correctly', async () => {
    renderMembersTable();

    await waitFor(() => {
      const emails = screen.queryAllByText('instructor1@example.com');
      expect(emails.length).toBeGreaterThan(0);
      const emails2 = screen.queryAllByText('instructor2@example.com');
      expect(emails2.length).toBeGreaterThan(0);
    });
  });

  it('renders scope display names correctly', async () => {
    renderMembersTable();

    await waitFor(() => {
      expect(screen.getByText('Demo Course')).toBeInTheDocument();
      expect(screen.getByText('Math 101')).toBeInTheDocument();
      expect(screen.getByText('Content Library')).toBeInTheDocument();
    });
  });

  it('renders action buttons for each member row', async () => {
    renderMembersTable();

    await waitFor(() => {
      // Should have 3 view buttons (one per flattened row)
      const viewButtons = screen.getAllByRole('button', { name: messages['authz.role.members.table.action.view.alt'].defaultMessage });
      expect(viewButtons).toHaveLength(3);

      // Should have 3 delete buttons (one per flattened row)
      const deleteButtons = screen.getAllByRole('button', { name: messages['authz.role.members.table.action.delete.alt'].defaultMessage });
      expect(deleteButtons).toHaveLength(3);
    });
  });

  it('displays showing message with correct member count', async () => {
    renderMembersTable();

    await waitFor(() => {
      // Should show "Showing 3 users of 3" (3 flattened assignments)
      const footers = screen.queryAllByText(/Showing 3 users of 3/);
      expect(footers.length).toBeGreaterThan(0);
    });
  });

  it('calls onDelete when delete button is clicked', async () => {
    const mockOnDelete = jest.fn();
    const user = userEvent.setup();

    renderMembersTable({ onDelete: mockOnDelete });

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: messages['authz.role.members.table.action.delete.alt'].defaultMessage });
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const firstDeleteButton = screen.getAllByRole('button', { name: messages['authz.role.members.table.action.delete.alt'].defaultMessage })[0];
    await user.click(firstDeleteButton);

    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('renders with loading state initially', () => {
    mockUseTeamMembersAssignments.mockReturnValueOnce({
      ...mockMembersData,
      isLoading: true,
    });
    renderMembersTable();
    // Component should render, possibly with loading indicator
  });

  it('renders empty state when no members returned', () => {
    mockUseTeamMembersAssignments.mockReturnValueOnce({
      data: {
        results: [],
        count: 0,
        next: null,
        previous: null,
      },
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    });
    renderMembersTable();
    // Should still render headers even with no data
    expect(screen.getByRole('columnheader', { name: /Username/i })).toBeInTheDocument();
  });

  it('filters by roleId from URL params', () => {
    renderMembersTable();

    // Verify the hook was called with the correct roleId
    expect(mockUseTeamMembersAssignments).toHaveBeenCalledWith(
      expect.objectContaining({
        roles: 'custom-role-123',
      }),
      true,
    );
  });

  it('renders search filter for username column', async () => {
    renderMembersTable();

    await waitFor(() => {
      // Look for search input - should be present for filtering
      const searchInput = screen.getByPlaceholderText(/Search/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('renders scope filter control', async () => {
    renderMembersTable();

    await waitFor(() => {
      // Look for scope filter dropdown button/control
      const scopeFilterButton = screen.getByRole('button', { name: /scope|filter/i });
      expect(scopeFilterButton).toBeInTheDocument();
    });
  });
});
