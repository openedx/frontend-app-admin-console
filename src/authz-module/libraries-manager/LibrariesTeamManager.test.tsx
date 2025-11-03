import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { useLibrary, useUpdateLibrary } from '@src/authz-module/data/hooks';
import { useLibraryAuthZ } from './context';
import LibrariesTeamManager from './LibrariesTeamManager';
import { ToastManagerProvider } from './ToastManagerContext';

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
  useUpdateLibrary: jest.fn(),
}));

jest.mock('./components/TeamTable', () => ({
  __esModule: true,
  default: () => <div role="table" aria-label="Team Members Table">Team member list</div>,
}));

jest.mock('./components/AddNewTeamMemberModal', () => ({
  __esModule: true,
  AddNewTeamMemberTrigger: () => <button type="button">Add Team Member</button>,
}));

jest.mock('../components/RoleCard', () => ({
  __esModule: true,
  default: ({ title, description, permissionsByResource }: {
    title: string,
    description: string,
    permissionsByResource: any[]
  }) => (
    <div role="article" aria-label={`Role: ${title}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      <span>{permissionsByResource.length} permissions</span>
    </div>
  ),
}));

const renderTeamManager = () => renderWrapper(<ToastManagerProvider><LibrariesTeamManager /></ToastManagerProvider>);
describe('LibrariesTeamManager', () => {
  const libraryData = {
    id: 'lib-001',
    title: 'Test Library',
    org: 'Test Org',
    allowPublicRead: false,
  };
  const mutate = jest.fn();
  const libraryAuthZContext = {
    libraryId: libraryData.id,
    libraryName: libraryData.title,
    libraryOrg: libraryData.org,
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
      { key: 'edit_library', label: 'edit', resource: 'library' },
    ],
    resources: [{ key: 'library', label: 'Library' }],
    canManageTeam: true,
  };

  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        username: 'admin',
      },
    });
    jest.resetAllMocks();
    mockedUseLibraryAuthZ.mockReturnValue(libraryAuthZContext);

    (useLibrary as jest.Mock).mockReturnValue({
      data: libraryData,
    });
    (useUpdateLibrary as jest.Mock).mockReturnValue({
      mutate,
      isPending: false,
    });
  });

  it('renders tabs and layout content correctly', () => {
    renderTeamManager();
    // Tabs
    expect(screen.getByRole('tab', { name: /Team Members/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Roles/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Permissions/i })).toBeInTheDocument();

    // Breadcrumb/page title
    expect(screen.getByText('Manage Access')).toBeInTheDocument(); // from intl.formatMessage
    expect(screen.getByText('lib-001')).toBeInTheDocument(); // subtitle

    // TeamTable is rendered
    expect(screen.getByRole('table', { name: 'Team Members Table' })).toBeInTheDocument();

    // AddNewTeamMemberTrigger is rendered
    expect(screen.getByRole('button', { name: 'Add Team Member' })).toBeInTheDocument();
  });

  it('renders role cards when "Roles" tab is selected', async () => {
    const user = userEvent.setup();

    renderTeamManager();

    // Click on "Roles" tab
    const rolesTab = await screen.findByRole('tab', { name: /roles/i });
    await user.click(rolesTab);

    const roleCards = await screen.findAllByRole('article', { name: /Role:/ });
    const rolesScope = within(roleCards[0]);
    expect(roleCards.length).toBe(1);
    expect(rolesScope.getByRole('heading', { name: 'Instructor' })).toBeInTheDocument();
    expect(screen.getByText(/Can manage content/i)).toBeInTheDocument();
    expect(screen.getByText(/1 permissions/i)).toBeInTheDocument();
  });

  it('renders role matrix when "Permissions" tab is selected', async () => {
    const user = userEvent.setup();

    renderTeamManager();

    // Click on "Permissions" tab
    const permissionsTab = await screen.findByRole('tab', { name: /permissions/i });
    await user.click(permissionsTab);

    const tablePermissionMatrix = await screen.getByRole('table');
    const matrixScope = within(tablePermissionMatrix);

    expect(matrixScope.getByText('Library')).toBeInTheDocument();
    expect(matrixScope.getByText('Instructor')).toBeInTheDocument();
    expect(matrixScope.getByText('edit')).toBeInTheDocument();
    expect(matrixScope.getByText('view')).toBeInTheDocument();
  });

  it('renders allow public library read toggle and change the value by user interaction', async () => {
    const user = userEvent.setup();

    renderTeamManager();

    const readPublicToggle = await screen.findByRole('switch', { name: /Allow public read/i });

    await user.click(readPublicToggle);
    expect(mutate).toHaveBeenCalledWith(
      {
        libraryId: 'lib-001',
        updatedData: { allowPublicRead: !libraryData.allowPublicRead },
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
    const { onSuccess } = (mutate as jest.Mock).mock.calls[0][1];
    onSuccess?.();

    expect(await screen.findByText(/updated successfully/i)).toBeInTheDocument();
  });

  it('should not render the toggle if the user can not manage team and the Library Public Read is disabled', () => {
    (useLibrary as jest.Mock).mockReturnValue({ data: { ...libraryData, allowPublicRead: false } });
    (useLibraryAuthZ as jest.Mock).mockReturnValue({ ...libraryAuthZContext, canManageTeam: false });

    renderTeamManager();
    expect(screen.queryByRole('switch', { name: /Allow public read/i })).not.toBeInTheDocument();
  });

  it('should render the toggle as disabled if the user can not manage team but the Library Public Read is enabled', async () => {
    (useLibrary as jest.Mock).mockReturnValue({ data: { ...libraryData, allowPublicRead: true } });
    (useLibraryAuthZ as jest.Mock).mockReturnValue({ ...libraryAuthZContext, canManageTeam: false });

    renderTeamManager();

    const readPublicToggle = await screen.findByRole('switch', { name: /Allow public read/i });

    expect(readPublicToggle).toBeInTheDocument();
    expect(readPublicToggle).toBeDisabled();
  });

  it('renders correct navigation link label and URL on breadcrumb', () => {
    renderTeamManager();
    const navLink = screen.getByRole('link', { name: 'Manage Access' });
    expect(navLink).toBeInTheDocument();
    // TODO: Update expected URL when dedicated Manage Access page is created
    expect(navLink).toHaveAttribute('href', '/authz/libraries/lib-001');
  });
});
