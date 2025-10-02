import { useParams } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import LibrariesUserManager from './LibrariesUserManager';
import { useLibraryAuthZ } from './context';
import { useLibrary, useTeamMembers } from '../data/hooks';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('./context', () => ({
  useLibraryAuthZ: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  useLibrary: jest.fn(),
  useTeamMembers: jest.fn(),
}));
jest.mock('../components/RoleCard', () => ({
  __esModule: true,
  default: ({ title, description }: { title: string, description: string }) => (
    <div data-testid="role-card">
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

describe('LibrariesUserManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock route params
    (useParams as jest.Mock).mockReturnValue({ username: 'testuser' });

    // Mock library authz context
    (useLibraryAuthZ as jest.Mock).mockReturnValue({
      libraryId: 'lib:123',
      permissions: [{ key: 'view' }, { key: 'reuse' }],
      roles: [
        {
          role: 'admin',
          name: 'Admin',
          description: 'Administrator Role',
          permissions: ['view', 'reuse'],
        },
      ],
      resources: [
        { key: 'library', label: 'Library', description: '' },
      ],
    });

    // Mock library data
    (useLibrary as jest.Mock).mockReturnValue({
      data: {
        title: 'Test Library',
        org: 'Test Org',
      },
    });

    // Mock team members
    (useTeamMembers as jest.Mock).mockReturnValue({
      data: [
        {
          username: 'testuser',
          email: 'testuser@example.com',
          roles: ['admin'],
        },
      ],
    });
  });

  it('renders the user roles correctly', () => {
    renderWrapper(<LibrariesUserManager />);

    // Breadcrumb check
    expect(screen.getByText('Manage Access')).toBeInTheDocument();
    expect(screen.getByText('Library Team Management')).toBeInTheDocument();
    expect(screen.getByRole('listitem', { current: 'page' })).toHaveTextContent('testuser');
    // Page title and subtitle
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('testuser');
    expect(screen.getByRole('paragraph')).toHaveTextContent('testuser@example.com');

    // RoleCard rendering
    expect(screen.getByTestId('role-card')).toHaveTextContent('Admin');
    expect(screen.getByTestId('role-card')).toHaveTextContent('Administrator Role');
  });
});
