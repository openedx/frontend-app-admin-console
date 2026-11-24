import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders } from '@src/testUtils';
import { useTeamMembersAssignments } from '@src/authz-module/data/hooks';
import { mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import messages from '../messages';
import RoleMembersTable from './RoleMembersTable';

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

// The action buttons' accessible names include the member's username.
const actionButtonName = (messageKey: keyof typeof messages) => new RegExp(
  messages[messageKey].defaultMessage.replace('{username}', '.+'),
);
const viewButtonName = actionButtonName('authz.role.members.table.action.view.alt');
const deleteButtonName = actionButtonName('authz.role.members.table.action.delete.alt');

const renderMembersTable = (props = {}) => renderWithAllProviders(
  <ToastManagerProvider><RoleMembersTable onDelete={jest.fn()} {...props} /></ToastManagerProvider>,
);

describe('RoleMembersTable', () => {
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

  it('shows each scope with its organization, as the Team Members table does', () => {
    renderMembersTable();

    // Demo Course and Content Library belong to OpenedX, Math 101 to WGU.
    expect(screen.getAllByText('OpenedX')).toHaveLength(2);
    expect(screen.getByText('WGU')).toBeInTheDocument();
  });

  it('summarises an organization-wide scope as just the organization', () => {
    mockUseTeamMembersAssignments.mockReturnValue({
      ...mockMembersData,
      data: {
        ...mockMembersData.data,
        results: [{
          ...mockMembersData.data.results[1],
          assignments: [{
            ...mockMembersData.data.results[1].assignments[0],
            org: 'MathDept',
            scope: 'lib:MathDept:*',
            scopeDisplayName: '',
          }],
        }],
        count: 1,
      },
    });
    renderMembersTable();

    // Named once, on the scope line, rather than repeated on an organization line below.
    expect(screen.getAllByText('MathDept')).toHaveLength(1);
  });

  it('renders action buttons for each member row', async () => {
    renderMembersTable();

    await waitFor(() => {
      // One view and one delete button per flattened row (3 rows)
      expect(screen.getAllByRole('button', { name: viewButtonName })).toHaveLength(3);
      expect(screen.getAllByRole('button', { name: deleteButtonName })).toHaveLength(3);
    });

    // Each row's buttons are labeled with that row's username
    expect(screen.getAllByRole('button', { name: 'Remove instructor1 from role' })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Remove instructor2 from role' })).toBeInTheDocument();
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

    const deleteButton = await screen.findByRole('button', { name: 'Remove instructor2 from role' });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(expect.objectContaining({
      username: 'instructor2',
      scope: 'lib:OpenedX:CONTENT',
    }));
  });

  it('renders with loading state initially', () => {
    // Not `mockReturnValueOnce`: the table re-renders after fetching, and must stay loading.
    mockUseTeamMembersAssignments.mockReturnValue({
      ...mockMembersData,
      isLoading: true,
    });
    renderMembersTable();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
  });

  it('renders empty state when no members returned', () => {
    mockUseTeamMembersAssignments.mockReturnValue({
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
    // Should show the empty state message
    expect(screen.getByText(messages['authz.custom.role.members.table.empty'].defaultMessage)).toBeInTheDocument();
  });

  it('uses EMPTY_ASSIGNMENTS when data is undefined', () => {
    mockUseTeamMembersAssignments.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    });
    renderMembersTable();
    // Should still render headers with EMPTY_ASSIGNMENTS default
    expect(screen.getByRole('columnheader', { name: /Username/i })).toBeInTheDocument();
    // Should show the empty state message
    expect(screen.getByText(messages['authz.custom.role.members.table.empty'].defaultMessage)).toBeInTheDocument();
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

  it('renders a single search box that names both searchable fields', () => {
    renderMembersTable();

    // Username and email share one search box, so both appear in its placeholder.
    expect(screen.getByPlaceholderText('Search by Username or Email')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  it('debounces the search so typing sends a single request', async () => {
    jest.useFakeTimers();
    try {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderMembersTable();
      const searchedTerms = () => mockUseTeamMembersAssignments.mock.calls
        .map(([settings]) => settings.search)
        .filter(Boolean);

      await user.type(screen.getByPlaceholderText('Search by Username or Email'), 'inst');
      // Nothing is requested while the user is still typing.
      expect(searchedTerms()).toEqual([]);

      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      // Only the full term reaches the request, never the partial keystrokes.
      expect(new Set(searchedTerms())).toEqual(new Set(['inst']));
      expect(mockUseTeamMembersAssignments).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'inst', roles: 'custom-role-123' }),
        true,
      );
    } finally {
      jest.useRealTimers();
    }
  });

  describe('when the members request fails', () => {
    const serverError = () => Object.assign(new Error('Boom'), {
      customAttributes: { httpErrorStatus: 500 },
    });

    it('shows an error toast once, not once per effect pass', () => {
      mockUseTeamMembersAssignments.mockReturnValue({
        ...mockMembersData, data: undefined, error: serverError(),
      });
      renderMembersTable();

      expect(screen.getAllByText(/We're experiencing technical difficulties./)).toHaveLength(1);
    });

    it('retries the request from the toast', async () => {
      const user = userEvent.setup();
      const refetch = jest.fn();
      mockUseTeamMembersAssignments.mockReturnValue({
        ...mockMembersData, data: undefined, error: serverError(), refetch,
      });
      renderMembersTable();

      await user.click(screen.getByRole('button', { name: 'Retry' }));

      expect(refetch).toHaveBeenCalledTimes(1);
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
