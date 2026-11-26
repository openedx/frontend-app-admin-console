import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders } from '@src/testUtils';
import { useRoleAssignments } from '@src/authz-module/data/hooks';
import { mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import type { RoleAssignment } from '@src/types';
import messages from '../messages';
import RoleMembersTable from './RoleMembersTable';

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
}));

jest.mock('@src/authz-module/data/hooks', () => ({
  ...jest.requireActual('@src/authz-module/data/hooks'),
  useRoleAssignments: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ roleId: 'custom-role-123' }),
  useNavigate: jest.fn(() => jest.fn()),
}));

const mockUseRoleAssignments = useRoleAssignments as jest.Mock;

const instructor1 = {
  username: 'instructor1', fullName: 'Instructor One', email: 'instructor1@example.com',
};
const instructor2 = {
  username: 'instructor2', fullName: 'Instructor Two', email: 'instructor2@example.com',
};

const buildAssignment = (user: typeof instructor1, fields: Partial<RoleAssignment>): RoleAssignment => ({
  ...user,
  role: 'custom-role-123',
  org: 'OpenedX',
  orgDisplayName: 'OpenedX',
  scope: 'course-v1:OpenedX+DemoX+Demo',
  scopeDisplayName: 'Demo Course',
  permissionCount: 5,
  ...fields,
});

// As `/api/authz/v1/assignments/` returns them: one entry per assignment, so instructor1,
// who holds the role in two scopes, comes twice. `count` totals assignments across pages.
const mockAssignmentsData = {
  data: {
    results: [
      buildAssignment(instructor1, {}),
      buildAssignment(instructor1, {
        org: 'WGU', scope: 'course-v1:WGU+Math+101', scopeDisplayName: 'Math 101', permissionCount: 3,
      }),
      buildAssignment(instructor2, {
        scope: 'lib:OpenedX:CONTENT', scopeDisplayName: 'Content Library', permissionCount: 7,
      }),
    ],
    count: 12,
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
  <ToastManagerProvider><RoleMembersTable scopeTypes={[]} onDelete={jest.fn()} {...props} /></ToastManagerProvider>,
);

describe('RoleMembersTable', () => {
  beforeEach(() => {
    mockAuthzCatalog();
    mockUseRoleAssignments.mockReturnValue(mockAssignmentsData);
  });

  it('renders table with column headers', () => {
    renderMembersTable();
    // Look specifically for headers inside the table
    expect(screen.getByRole('columnheader', { name: messages['authz.custom.role.members.table.column.header.username'].defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: messages['authz.custom.role.members.table.column.header.email'].defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: messages['authz.custom.role.members.table.column.header.scope'].defaultMessage })).toBeInTheDocument();
  });

  it('renders one row per assignment, so a user with the role in two scopes appears twice', async () => {
    renderMembersTable();

    await waitFor(() => {
      expect(screen.getAllByText('instructor1')).toHaveLength(2);
      expect(screen.getByText('instructor2')).toBeInTheDocument();
    });
  });

  it('lists every scope of a user, not only a preview of them', () => {
    // The user-grouped endpoint sent at most three assignments per user; this one sends them all.
    const scopes = ['A', 'B', 'C', 'D', 'E'].map((run) => buildAssignment(instructor1, {
      scope: `course-v1:OpenedX+DemoX+${run}`, scopeDisplayName: `Demo Course ${run}`,
    }));
    mockUseRoleAssignments.mockReturnValue({
      ...mockAssignmentsData,
      data: { ...mockAssignmentsData.data, results: scopes, count: scopes.length },
    });
    renderMembersTable();

    expect(screen.getAllByText('instructor1')).toHaveLength(5);
    scopes.forEach(({ scopeDisplayName }) => expect(screen.getByText(scopeDisplayName)).toBeInTheDocument());
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
    // Screen readers get the resource type and organization the icons show.
    expect(screen.getByRole('group', { name: 'Course Demo Course in the organization OpenedX' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Library Content Library in the organization OpenedX' })).toBeInTheDocument();
  });

  it('summarises an organization-wide scope as just the organization', () => {
    mockUseRoleAssignments.mockReturnValue({
      ...mockAssignmentsData,
      data: {
        ...mockAssignmentsData.data,
        results: [buildAssignment(instructor2, { org: 'MathDept', scope: 'lib:MathDept:*', scopeDisplayName: '' })],
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
      // One view and one delete button per assignment row (3 rows)
      expect(screen.getAllByRole('button', { name: viewButtonName })).toHaveLength(3);
      expect(screen.getAllByRole('button', { name: deleteButtonName })).toHaveLength(3);
    });

    // Each row's buttons are labeled with that row's username
    expect(screen.getAllByRole('button', { name: 'Remove instructor1 from role' })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Remove instructor2 from role' })).toBeInTheDocument();
  });

  it('counts assignments: the rows shown out of the API total', () => {
    renderMembersTable();

    // Both the rows and the total are assignments, so the two numbers share a unit.
    // Once in the control bar and once in the footer.
    expect(screen.getAllByText('Showing 3 assignments of 12')).toHaveLength(2);
  });

  it('paginates by assignment', () => {
    renderMembersTable();

    // 12 assignments at 10 per page.
    expect(screen.getByRole('button', { name: /Next, Page 2/ })).toBeEnabled();
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
    mockUseRoleAssignments.mockReturnValue({
      ...mockAssignmentsData,
      isLoading: true,
    });
    renderMembersTable();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
  });

  it('renders empty state when no members returned', () => {
    mockUseRoleAssignments.mockReturnValue({
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

  it('uses EMPTY_ROLE_ASSIGNMENTS when data is undefined', () => {
    mockUseRoleAssignments.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    });
    renderMembersTable();
    // Should still render headers with the EMPTY_ROLE_ASSIGNMENTS default
    expect(screen.getByRole('columnheader', { name: /Username/i })).toBeInTheDocument();
    // Should show the empty state message
    expect(screen.getByText(messages['authz.custom.role.members.table.empty'].defaultMessage)).toBeInTheDocument();
  });

  it('requests the assignments of the role in the URL only', () => {
    renderMembersTable();

    expect(mockUseRoleAssignments).toHaveBeenCalled();
    mockUseRoleAssignments.mock.calls.forEach(([role]) => expect(role).toBe('custom-role-123'));
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
      const searchedTerms = () => mockUseRoleAssignments.mock.calls
        .map(([, settings]) => settings.search)
        .filter(Boolean);

      await user.type(screen.getByPlaceholderText('Search by Username or Email'), 'inst');
      // Nothing is requested while the user is still typing.
      expect(searchedTerms()).toEqual([]);

      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      // Only the full term reaches the request, never the partial keystrokes.
      expect(new Set(searchedTerms())).toEqual(new Set(['inst']));
      expect(mockUseRoleAssignments).toHaveBeenLastCalledWith(
        'custom-role-123',
        expect.objectContaining({ search: 'inst' }),
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
      mockUseRoleAssignments.mockReturnValue({
        ...mockAssignmentsData, data: undefined, error: serverError(),
      });
      renderMembersTable();

      expect(screen.getAllByText(/We're experiencing technical difficulties./)).toHaveLength(1);
    });

    it('retries the request from the toast', async () => {
      const user = userEvent.setup();
      const refetch = jest.fn();
      mockUseRoleAssignments.mockReturnValue({
        ...mockAssignmentsData, data: undefined, error: serverError(), refetch,
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
