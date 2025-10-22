import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { useLibrary } from '@src/authz-module/data/hooks';
import { useLibraryAuthZ } from './context';
import LibrariesTeamManager from './LibrariesTeamManager';

jest.mock('./context', () => {
  const actual = jest.requireActual('./context');
  return {
    ...actual,
    useLibraryAuthZ: jest.fn(),
    LibraryAuthZProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});
const mockedUseLibraryAuthZ = useLibraryAuthZ as jest.Mock;

jest.mock('@src/authz-module/data/hooks', () => ({
  useLibrary: jest.fn(),
}));

jest.mock('./components/TeamTable', () => ({
  __esModule: true,
  default: () => <div data-testid="team-table">MockTeamTable</div>,
}));

jest.mock('./components/AddNewTeamMemberModal', () => ({
  __esModule: true,
  AddNewTeamMemberTrigger: () => <div data-testid="add-team-member-trigger">MockAddNewTeamMemberTrigger</div>,
}));

jest.mock('../components/RoleCard', () => ({
  __esModule: true,
  default: ({ title, description, permissions }: { title: string, description: string, permissions: any[] }) => (
    <div data-testid="role-card">
      <div>{title}</div>
      <div>{description}</div>
      <div>{permissions.length} permissions</div>
    </div>
  ),
}));

describe('LibrariesTeamManager', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        username: 'admin',
      },
    });
    mockedUseLibraryAuthZ.mockReturnValue({
      libraryId: 'lib-001',
      libraryName: 'Mock Library',
      libraryOrg: 'MockOrg',
      username: 'mockuser',
      roles: [
        {
          name: 'Instructor',
          description: 'Can manage content.',
          userCount: 3,
          permissions: ['view', 'edit'],
        },
      ],
      permissions: [
        { key: 'view_library', label: 'view', resource: 'library' },
        { key: 'edit_library', name: 'edit', resource: 'library' },
      ],
      resources: [{ key: 'library', displayName: 'Library' }],
      canManageTeam: true,
    });

    (useLibrary as jest.Mock).mockReturnValue({
      data: {
        title: 'Test Library',
        org: 'Test Org',
      },
    });
  });

  it('renders tabs and layout content correctly', () => {
    renderWrapper(<LibrariesTeamManager />);

    // Tabs
    expect(screen.getByRole('tab', { name: /Team Members/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Roles/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Permissions/i })).toBeInTheDocument();

    // Breadcrumb/page title
    expect(screen.getByText('Manage Access')).toBeInTheDocument(); // from intl.formatMessage
    expect(screen.getByText('lib-001')).toBeInTheDocument(); // subtitle

    // TeamTable is rendered
    expect(screen.getByTestId('team-table')).toBeInTheDocument();

    // AddNewTeamMemberTrigger is rendered
    expect(screen.getByTestId('add-team-member-trigger')).toBeInTheDocument();
  });

  it('renders role cards when "Roles" tab is selected', async () => {
    const user = userEvent.setup();

    renderWrapper(<LibrariesTeamManager />);

    // Click on "Roles" tab
    const rolesTab = await screen.findByRole('tab', { name: /roles/i });
    await user.click(rolesTab);

    const roleCards = await screen.findAllByTestId('role-card');

    expect(roleCards.length).toBeGreaterThan(0);
    expect(screen.getByText('Instructor')).toBeInTheDocument();
    expect(screen.getByText(/Can manage content/i)).toBeInTheDocument();
    expect(screen.getByText(/1 permissions/i)).toBeInTheDocument();
  });
});
