import { screen } from '@testing-library/react';
import LibrariesTeamManager from './LibrariesTeamManager';
import { useLibraryAuthZ } from './context';
import { renderWrapper } from '@src/setupTest';
import { initializeMockApp } from '@edx/frontend-platform/testing';

jest.mock('./context', () => {
  const actual = jest.requireActual('./context');
  return {
    ...actual,
    useLibraryAuthZ: jest.fn(),
    LibraryAuthZProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});
const mockedUseLibraryAuthZ = useLibraryAuthZ as jest.Mock;

jest.mock('./components/TeamTable', () => ({
  __esModule: true,
  default: () => <div data-testid="team-table">MockTeamTable</div>,
}));

describe('LibrariesTeamManager', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        username: 'admin'
      }
    })
    mockedUseLibraryAuthZ.mockReturnValue({
      libraryId: 'lib-001',
      libraryName: 'Mock Library',
      libraryOrg: 'MockOrg',
      username: 'mockuser',
      roles: ['admin'],
      permissions: [],
      canManageTeam: true,
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
  });
});
