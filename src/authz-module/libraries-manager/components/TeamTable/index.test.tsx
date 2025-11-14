import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { useTeamMembers } from '@src/authz-module/data/hooks';
import { useLibraryAuthZ } from '@src/authz-module/libraries-manager/context';
import { ToastManagerProvider } from '@src/authz-module/libraries-manager/ToastManagerContext';
import TeamTable from './index';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@src/authz-module/data/hooks', () => ({
  useTeamMembers: jest.fn(),
}));

jest.mock('@src/authz-module/libraries-manager/context', () => ({
  useLibraryAuthZ: jest.fn(),
}));

describe('TeamTable', () => {
  const mockTeamMembers = {
    count: 2,
    results: [
      {
        email: 'alice@example.com',
        roles: ['admin', 'editor'],
        username: 'alice',
      },
      {
        email: 'bob@example.com',
        roles: ['viewer'],
        username: 'bob',
      },
    ],
  };

  const mockAuthZ = {
    libraryId: 'lib:123',
    canManageTeam: true,
    username: 'alice',
    roles: [
      {
        role: 'admin',
        permissions: [
          'content_libraries.delete_library',
          'content_libraries.publish_library_content',
          'content_libraries.manage_library_team',
        ],
        userCount: 3,
        name: 'Admin',
        description: 'The Admin role',
      },
      {
        role: 'editor',
        permissions: [
          'content_libraries.edit_library_content',
          'content_libraries.publish_library_content',
        ],
        userCount: 3,
        name: 'Editor',
        description: 'The Editor role',
      },
      {
        role: 'viewer',
        permissions: [
          'content_libraries.view_library',
        ],
        userCount: 3,
        name: 'Viewer',
        description: 'The Viewer role',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows skeletons while loading', () => {
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });
    (useLibraryAuthZ as jest.Mock).mockReturnValue(mockAuthZ);

    renderWrapper(<ToastManagerProvider><TeamTable /></ToastManagerProvider>);

    const skeletons = screen.getAllByText('', { selector: '[aria-busy="true"]' });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders team member data after loading', () => {
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: mockTeamMembers,
      isLoading: false,
    });
    (useLibraryAuthZ as jest.Mock).mockReturnValue(mockAuthZ);

    renderWrapper(<ToastManagerProvider><TeamTable /></ToastManagerProvider>);

    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();

    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('renders Edit button only for users with than can manage team members (current user can not edit themselves)', async () => {
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: mockTeamMembers,
      isLoading: false,
    });
    (useLibraryAuthZ as jest.Mock).mockReturnValue(mockAuthZ);

    renderWrapper(<ToastManagerProvider><TeamTable /></ToastManagerProvider>);

    const editButtons = screen.queryAllByText('Edit');
    // Should not find Edit button for current user
    expect(editButtons).toHaveLength(1);

    await userEvent.click(editButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/authz/libraries/${mockAuthZ.libraryId}/bob`,
    );
  });

  it('does not render Edit button if canManageTeam is false', () => {
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: mockTeamMembers,
      isLoading: false,
    });
    (useLibraryAuthZ as jest.Mock).mockReturnValue({
      ...mockAuthZ,
      canManageTeam: false,
    });

    renderWrapper(<ToastManagerProvider><TeamTable /></ToastManagerProvider>);

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('does not render Edit button while loading', () => {
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });
    (useLibraryAuthZ as jest.Mock).mockReturnValue(mockAuthZ);

    renderWrapper(<ToastManagerProvider><TeamTable /></ToastManagerProvider>);

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });
});
