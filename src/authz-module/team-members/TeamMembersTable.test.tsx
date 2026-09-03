import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders } from '@src/setupTest';
import { useTeamMembersAssignments, useOrgs, useScopes } from '@src/authz-module/data/hooks';
import type { GetTeamMembersAssignmentsResponse } from '@src/authz-module/data/api';
import { useViewTeamPermissions } from '@src/authz-module/hooks/useViewTeamPermissions';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import { LIBRARY_ROLE_KEYS } from '@src/authz-module/roles-permissions';
import { MAX_INLINE_ASSIGNMENTS } from '@src/authz-module/constants';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import TeamMembersTable from './TeamMembersTable';

jest.mock('@src/authz-module/hooks/useViewTeamPermissions', () => ({
  useViewTeamPermissions: jest.fn(),
}));

const mockUseViewTeamPermissions = useViewTeamPermissions as jest.Mock;

const courseAssignment = {
  isSuperadmin: false,
  role: 'course_staff',
  org: 'OpenedX',
  scope: 'course-v1:OpenedX+DemoX+DemoCourse',
  scopeName: 'Open edX Demo Course',
  permissionCount: 27,
};

const mockedTeamMembers: {
  data: GetTeamMembersAssignmentsResponse | undefined;
  error: Error | null;
  isLoading: boolean;
  refetch: jest.Mock;
} = {
  data: {
    results: [
      {
        username: 'johndoe',
        fullName: 'John Doe',
        email: 'johndoe@example.com',
        // More roles than the three returned, so the row advertises the remainder.
        assignmentCount: 10,
        assignments: [
          courseAssignment,
          {
            isSuperadmin: false,
            role: 'library_admin',
            org: 'WGU',
            scope: 'lib:WGU:CSPROB',
            scopeName: 'Computer Science Problems',
            permissionCount: 11,
          },
          {
            isSuperadmin: false,
            role: 'library_user',
            org: 'WGU',
            scope: 'lib:WGU:MATH',
            scopeName: 'Mathematics Problems',
            permissionCount: 4,
          },
        ],
      },
      {
        username: 'janeadmin',
        fullName: 'Jane Admin',
        email: 'jane@example.com',
        // A single role: nothing further to reveal.
        assignmentCount: 1,
        assignments: [
          {
            isSuperadmin: false,
            role: 'course_auditor',
            org: 'OpenedX',
            scope: 'course-v1:OpenedX+Other+Course',
            permissionCount: 3,
          },
        ],
      },
    ],
    count: 2,
    next: null,
    previous: null,
  },
  error: null,
  isLoading: false,
  refetch: jest.fn(),
};

const mockedOrgs = {
  data: {
    count: 2,
    next: null,
    previous: null,
    results: [
      { id: 'org1', name: 'Organization 1' },
      { id: 'org2', name: 'Organization 2' },
    ],
  },
  error: null,
  isLoading: false,
  refetch: jest.fn(),
};

const mockedScopes = {
  data: {
    pages: [
      {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            externalKey: 'course-v1:OpenedX+DemoX+DemoCourse',
            displayName: 'Open edX Demo Course',
            org: {
              id: 1,
              created: '2026-04-02T19:30:36.779095Z',
              modified: '2026-04-02T19:30:36.779095Z',
              name: 'OpenedX',
              shortName: 'OpenedX',
              description: '',
              logo: null,
              active: true,
            },
          },
          {
            externalKey: 'lib:WGU:CSPROB',
            displayName: 'Computer Science Problems',
            org: {
              id: 2,
              created: '2026-04-02T19:31:21.196446Z',
              modified: '2026-04-02T19:31:21.196446Z',
              name: 'WGU',
              shortName: 'WGU',
              description: '',
              logo: null,
              active: true,
            },
          },
        ],
      },
    ],
  },
  error: null,
  isLoading: false,
  refetch: jest.fn(),
};

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('@src/authz-module/hooks/useCourseAuthoringFlag', () => ({
  useCourseAuthoringFlag: jest.fn(),
}));

const mockUseCourseAuthoringFlag = useCourseAuthoringFlag as jest.Mock;

jest.mock('@src/authz-module/data/hooks', () => ({
  useTeamMembersAssignments: jest.fn(),
  useOrgs: jest.fn(),
  useScopes: jest.fn(),
}));

const mockApiResponses = (
  teamMembersResponse = mockedTeamMembers,
  orgResponse = mockedOrgs,
  scopesResponse = mockedScopes,
) => {
  (useTeamMembersAssignments as jest.Mock).mockReturnValue(teamMembersResponse);
  (useOrgs as jest.Mock).mockReturnValue(orgResponse);
  (useScopes as jest.Mock).mockReturnValue(scopesResponse);
};

const renderTable = (props = {}) => renderWithAllProviders(
  <ToastManagerProvider><TeamMembersTable {...props} /></ToastManagerProvider>,
);

describe('TeamMembersTable', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseViewTeamPermissions.mockReturnValue({
      isCourseViewAllowed: true,
      isLibraryViewAllowed: true,
      isLoading: false,
    });
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: true,
      isCourseEnabled: () => true,
      isLoading: false,
    });
  });

  it('renders one row per user', async () => {
    mockApiResponses();
    renderTable({ presetScope: 'course-v1:OpenedX+DemoX+DemoCourse' });
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Admin')).toBeInTheDocument();
      expect(screen.getByText('johndoe@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('requests the nested assignments capped at MAX_INLINE_ASSIGNMENTS', async () => {
    mockApiResponses();
    renderTable();
    await waitFor(() => {
      expect(useTeamMembersAssignments).toHaveBeenCalledWith(
        expect.any(Object),
        MAX_INLINE_ASSIGNMENTS,
      );
    });
  });

  it('shows loading state initially', () => {
    mockApiResponses({ ...mockedTeamMembers, isLoading: true });
    renderTable();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error toast message', () => {
    mockApiResponses({
      ...mockedTeamMembers,
      isLoading: false,
      error: new Error('Failed to fetch'),
      // @ts-ignore - deliberately partial payload alongside the error
      data: { results: [] },
    });
    renderTable();
    expect(screen.getByText(/Something went wrong on our end./)).toBeInTheDocument();
  });

  it('renders the user-grouped headers, keeping org, scope and role as filters only', async () => {
    mockApiResponses();
    renderTable();
    await waitFor(() => {
      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Assigned roles')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
    // Only the filter buttons remain — these are no longer column headers.
    expect(screen.getAllByText('Organization')).toHaveLength(1);
    expect(screen.getAllByText('Scope')).toHaveLength(1);
    expect(screen.getAllByText('Role')).toHaveLength(1);
  });

  it('renders the first assignment in the collapsed row, showing the scope name not its id', async () => {
    mockApiResponses();
    renderTable();
    await waitFor(() => {
      expect(screen.getByText('Course Staff')).toBeInTheDocument();
      expect(screen.getByText('Open edX Demo Course')).toBeInTheDocument();
    });
    expect(screen.queryByText('course-v1:OpenedX+DemoX+DemoCourse')).not.toBeInTheDocument();
  });

  it('falls back to the scope id when the API sends no name', async () => {
    mockApiResponses({
      ...mockedTeamMembers,
      data: {
        ...mockedTeamMembers.data!,
        results: [{
          ...mockedTeamMembers.data!.results[0],
          assignments: [{ ...courseAssignment, scopeName: undefined }],
          assignmentCount: 1,
        }],
        count: 1,
      },
    });
    renderTable();
    await waitFor(() => {
      expect(screen.getByText('course-v1:OpenedX+DemoX+DemoCourse')).toBeInTheDocument();
    });
  });

  it('counts the roles beyond the one already shown', async () => {
    mockApiResponses();
    renderTable();
    // 10 total roles, one of them already on the row.
    await waitFor(() => {
      expect(screen.getByText('+9 more roles')).toBeInTheDocument();
    });
  });

  it('omits the toggle for a user with a single role', async () => {
    mockApiResponses();
    renderTable();
    await waitFor(() => {
      expect(screen.getByText('Jane Admin')).toBeInTheDocument();
    });
    expect(screen.queryByText('+0 more roles')).not.toBeInTheDocument();
    // Only John Doe's row offers an expansion.
    expect(screen.getAllByText(/more roles?$/)).toHaveLength(1);
  });

  it('expands into a breakdown whose first row matches the collapsed badge', async () => {
    const user = userEvent.setup();
    mockApiResponses();
    renderTable();
    await waitFor(() => {
      expect(screen.getByText('+9 more roles')).toBeInTheDocument();
    });

    await user.click(screen.getByText('+9 more roles'));

    await waitFor(() => {
      expect(screen.getByText('Hide roles')).toBeInTheDocument();
    });
    // The badge stays put, so the role now appears both on the row and in the breakdown.
    expect(screen.getAllByText('Course Staff')).toHaveLength(2);
    expect(screen.getByText('Library Admin')).toBeInTheDocument();
    expect(screen.getByText('Library User')).toBeInTheDocument();
  });

  it('reports the absolute role total in the breakdown footer', async () => {
    const user = userEvent.setup();
    mockApiResponses();
    renderTable();
    await waitFor(() => {
      expect(screen.getByText('+9 more roles')).toBeInTheDocument();
    });

    await user.click(screen.getByText('+9 more roles'));

    // Three assignments returned out of the user's ten.
    await waitFor(() => {
      expect(screen.getByText('Showing 03 of 10')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /View all roles/ })).toHaveAttribute(
      'href',
      '/authz/user/johndoe',
    );
  });

  it('hides "View all roles" when nothing is truncated', async () => {
    const user = userEvent.setup();
    mockApiResponses({
      ...mockedTeamMembers,
      data: {
        ...mockedTeamMembers.data!,
        results: [{
          ...mockedTeamMembers.data!.results[0],
          assignmentCount: 3,
        }],
        count: 1,
      },
    });
    renderTable();
    await waitFor(() => {
      expect(screen.getByText('+2 more roles')).toBeInTheDocument();
    });

    await user.click(screen.getByText('+2 more roles'));

    await waitFor(() => {
      expect(screen.getByText('Showing 03 of 03')).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: /View all roles/ })).not.toBeInTheDocument();
  });

  it('collapses expanded rows when a filter is applied', async () => {
    const user = userEvent.setup();
    mockApiResponses();
    renderTable();
    await waitFor(() => {
      expect(screen.getByText('+9 more roles')).toBeInTheDocument();
    });

    await user.click(screen.getByText('+9 more roles'));
    await waitFor(() => {
      expect(screen.getByText('Hide roles')).toBeInTheDocument();
    });

    const orgFilter = screen.getByRole('button', { name: /Organization/ });
    await user.click(orgFilter);
    const option = await screen.findByText('Organization 1');
    await user.click(option);

    await waitFor(() => {
      expect(screen.queryByText('Hide roles')).not.toBeInTheDocument();
    });
  });

  it('renders view action buttons for each user', async () => {
    mockApiResponses();
    renderTable();
    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      expect(viewButtons).toHaveLength(2);
    });
  });

  it('navigates to user profile when view button is clicked', async () => {
    const user = userEvent.setup();
    mockApiResponses();
    renderTable();
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    await user.click(viewButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/authz/user/johndoe');
  });

  it('keeps the view action enabled while any assignment is viewable', async () => {
    // John Doe's course is disabled but his library roles are not; Jane Admin is library-only.
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: true,
      isCourseEnabled: (scope: string) => scope !== 'course-v1:OpenedX+DemoX+DemoCourse',
      isLoading: false,
    });
    mockApiResponses();
    renderTable();
    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      expect(viewButtons[0]).not.toBeDisabled();
      expect(viewButtons[1]).not.toBeDisabled();
    });
  });

  it('disables the view action when every assignment sits in a disabled course', async () => {
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: true,
      isCourseEnabled: () => false,
      isLoading: false,
    });
    mockApiResponses({
      ...mockedTeamMembers,
      data: {
        ...mockedTeamMembers.data!,
        results: [{
          username: 'johndoe',
          fullName: 'John Doe',
          email: 'johndoe@example.com',
          assignmentCount: 1,
          assignments: [courseAssignment],
        }],
        count: 1,
      },
    });
    renderTable();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /view/i })).toBeDisabled();
    });
  });

  it('reports the count in users', async () => {
    mockApiResponses();
    const { container } = renderTable();
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    // Once on the control bar, once in the footer.
    expect(within(container).getAllByText('Showing 2 users of 2.')).toHaveLength(2);
  });

  it('renders safely when team members data is undefined', () => {
    mockApiResponses({ ...mockedTeamMembers, data: undefined });
    renderTable();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('filters to library roles only when course view is not allowed', async () => {
    mockUseViewTeamPermissions.mockReturnValue({
      isCourseViewAllowed: false,
      isLibraryViewAllowed: true,
      isLoading: false,
    });
    mockApiResponses();
    renderTable();
    await waitFor(() => {
      expect(useTeamMembersAssignments).toHaveBeenCalledWith(
        expect.objectContaining({ roles: LIBRARY_ROLE_KEYS }),
        MAX_INLINE_ASSIGNMENTS,
      );
    });
  });

  it('handles empty data gracefully', async () => {
    mockApiResponses({
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
    renderTable();
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });
});
