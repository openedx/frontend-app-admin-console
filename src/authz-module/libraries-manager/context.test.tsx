import { Component, ReactNode } from 'react';
import { screen, renderHook } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { useValidateUserPermissions } from '@src/data/hooks';
import { renderWrapper } from '@src/setupTest';
import { usePermissionsByRole } from '@src/authz-module/data/hooks';
import { CustomErrors } from '@src/constants';
import { LibraryAuthZProvider, useLibraryAuthZ } from './context';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('@src/data/hooks', () => ({
  useValidateUserPermissions: jest.fn(),
}));
jest.mock('@src/authz-module/data/hooks', () => ({
  usePermissionsByRole: jest.fn().mockReturnValue({
    data: [
      {
        role: 'library_author',
        permissions: ['view_library_team', 'edit_library'],
        user_count: 12,
      },
    ],
  }),
}));

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      throw this.state.error;
    }
    return this.props.children;
  }
}

const TestComponent = () => {
  const context = useLibraryAuthZ();
  return (
    <div>
      <div>Username: {context.username}</div>
      <div>Library ID: {context.libraryId}</div>
      <div>Can manage team: {context.canManageTeam ? 'Yes' : 'No'}</div>
      <div>Roles count: {Array.isArray(context.roles) ? context.roles.length : 'undefined'}</div>
      <div>Permissions count: {Array.isArray(context.permissions) ? context.permissions.length : 'undefined'}</div>
      <div>Resources count: {Array.isArray(context.resources) ? context.resources.length : 'undefined'}</div>
    </div>
  );
};

describe('LibraryAuthZProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ libraryId: 'lib123' });
    (usePermissionsByRole as jest.Mock).mockReturnValue({
      data: [
        {
          role: 'instructor',
          description: 'Can create and edit content',
          userCount: 3,
          objects: [
            {
              object: 'library',
              description: 'Library permissions',
              actions: ['view', 'edit', 'delete'],
            },
          ],
        },
        {
          role: 'admin',
          description: 'Full access to the library',
          userCount: 1,
          objects: [
            {
              object: 'library',
              description: 'Library permissions',
              actions: ['view', 'edit', 'delete', 'manage'],
            },
          ],
        },
      ],
    });
  });

  it('provides the correct context values to consumers', () => {
    (useValidateUserPermissions as jest.Mock).mockReturnValue({
      data: [
        { allowed: true }, // canViewTeam
        { allowed: true }, // canManageTeam
      ],
    });

    renderWrapper(
      <LibraryAuthZProvider>
        <TestComponent />
      </LibraryAuthZProvider>,
    );

    expect(screen.getByText(/Username: testuser/)).toBeInTheDocument();
    expect(screen.getByText(/Library ID: lib123/)).toBeInTheDocument();
    expect(screen.getByText(/Can manage team: Yes/)).toBeInTheDocument();
    expect(screen.getByText(/Roles count: \d+/)).toBeInTheDocument();
    expect(screen.getByText(/Permissions count: \d+/)).toBeInTheDocument();
    expect(screen.getByText(/Resources count: \d+/)).toBeInTheDocument();
  });

  it('throws error when user lacks both view and manage permissions', () => {
    (useValidateUserPermissions as jest.Mock).mockReturnValue({
      data: [
        { allowed: false }, // canViewTeam
        { allowed: false }, // canManageTeam
      ],
    });

    expect(() => {
      renderWrapper(
        <LibraryAuthZProvider>
          <TestComponent />
        </LibraryAuthZProvider>,
      );
    }).toThrow(CustomErrors.NO_ACCESS);
  });

  it('provides context when user can view but not manage team', () => {
    (useValidateUserPermissions as jest.Mock).mockReturnValue({
      data: [
        { allowed: true }, // canViewTeam
        { allowed: false }, // canManageTeam
      ],
    });

    renderWrapper(
      <LibraryAuthZProvider>
        <TestComponent />
      </LibraryAuthZProvider>,
    );

    expect(screen.getByText(/Can manage team: No/)).toBeInTheDocument();
  });

  it('throws error when libraryId is missing', () => {
    (useParams as jest.Mock).mockReturnValue({}); // No libraryId

    expect(() => {
      renderWrapper(
        <ErrorBoundary>
          <LibraryAuthZProvider>
            <TestComponent />
          </LibraryAuthZProvider>
        </ErrorBoundary>,
      );
    }).toThrow(CustomErrors.NOT_FOUND);
  });

  it('throws error when useLibraryAuthZ is used outside provider', () => {
    expect(() => {
      renderHook(() => useLibraryAuthZ());
    }).toThrow('useLibraryAuthZ must be used within an LibraryAuthZProvider');
  });
});
