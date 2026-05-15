import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders } from '@src/setupTest';
import { useAllRoleAssignments, useOrgs, useScopes } from '@src/authz-module/data/hooks';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import TeamMembersTable from './TeamMembersTable';

const mockedAllRoleAssignments = {
  data: {
    results: [
      {
        isSuperadmin: false,
        role: 'course_staff',
        org: 'OpenedX',
        scope: 'course-v1:OpenedX+DemoX+DemoCourse',
        permissionCount: 27,
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'johndoe@example.com',
      },
      {
        isSuperadmin: true,
        role: 'super_admin',
        org: 'Global',
        scope: 'system',
        permissionCount: 100,
        fullName: 'Jane Admin',
        username: 'janeadmin',
        email: 'jane@example.com',
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

jest.mock('@src/authz-module/data/hooks', () => ({
  useAllRoleAssignments: jest.fn(),
  useOrgs: jest.fn(),
  useScopes: jest.fn(),
}));

const mockApiResponses = (
  allAsignmentsResponse = mockedAllRoleAssignments,
  orgResponse = mockedOrgs,
  scopesResponse = mockedScopes,
) => {
  (useAllRoleAssignments as jest.Mock).mockReturnValue(allAsignmentsResponse);
  (useOrgs as jest.Mock).mockReturnValue(orgResponse);
  (useScopes as jest.Mock).mockReturnValue(scopesResponse);
};

describe('TeamMembersTable', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders table with role assignments data', async () => {
    const presetScope = 'course-v1:OpenedX+DemoX+DemoCourse';
    mockApiResponses();
    renderWithAllProviders(<ToastManagerProvider><TeamMembersTable presetScope={presetScope} /></ToastManagerProvider>);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Admin')).toBeInTheDocument();
      expect(screen.getByText('johndoe@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    const allAsignmentsResponse = { ...mockedAllRoleAssignments, isLoading: true };
    mockApiResponses(allAsignmentsResponse);
    renderWithAllProviders(<ToastManagerProvider><TeamMembersTable /></ToastManagerProvider>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error toast message', () => {
    const allAsignmentsResponse = {
      ...mockedAllRoleAssignments,
      isLoading: false,
      error: new Error('Failed to fetch'),
      data: { results: [] },
    };
    // @ts-ignore
    mockApiResponses(allAsignmentsResponse);
    renderWithAllProviders(<ToastManagerProvider><TeamMembersTable /></ToastManagerProvider>);
    expect(screen.getByText(/Something went wrong on our end./)).toBeInTheDocument();
  });
  it('renders table headers correctly', async () => {
    mockApiResponses();
    renderWithAllProviders(<ToastManagerProvider><TeamMembersTable /></ToastManagerProvider>);
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getAllByText('Organization').length).toBe(2); // Header and org filter;
      expect(screen.getAllByText('Scope').length).toBe(2); // Header and scope filter;
      expect(screen.getAllByText('Role').length).toBe(2); // Header and role filter;
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('renders view action buttons for each user', async () => {
    mockApiResponses();
    renderWithAllProviders(<ToastManagerProvider><TeamMembersTable /></ToastManagerProvider>);
    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      expect(viewButtons).toHaveLength(2);
    });
  });

  it('navigates to user profile when view button is clicked', async () => {
    const user = userEvent.setup();
    mockApiResponses();
    renderWithAllProviders(<ToastManagerProvider><TeamMembersTable /></ToastManagerProvider>);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    await user.click(viewButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/authz/user/johndoe');
  });

  it('handles empty data gracefully', async () => {
    const allAsignmentsResponse = {
      data: {
        results: [],
        count: 0,
        next: null,
        previous: null,
      },
      error: null,
      isLoading: false,
      refetch: jest.fn(),
    };
    mockApiResponses(allAsignmentsResponse);
    renderWithAllProviders(<ToastManagerProvider><TeamMembersTable /></ToastManagerProvider>);
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });
});
