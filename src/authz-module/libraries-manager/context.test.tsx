import { screen } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { useValidateUserPermissions } from '@src/data/hooks';
import { renderWrapper } from '@src/setupTest';
import { usePermissionsByRole } from '@src/authz-module/data/hooks';
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
        permissions: [
          'view_library_team',
          'edit_library',
        ],
        user_count: 12,
      },
    ],
  }),
}));

const TestComponent = () => {
  const context = useLibraryAuthZ();
  return (
    <div>
      <div data-testid="username">{context.username}</div>
      <div data-testid="libraryId">{context.libraryId}</div>
      <div data-testid="canManageTeam">{context.canManageTeam ? 'true' : 'false'}</div>
      <div data-testid="roles">{Array.isArray(context.roles) ? context.roles.length : 'undefined'}</div>
      <div data-testid="permissions">{Array.isArray(context.permissions) ? context.permissions.length : 'undefined'}</div>
      <div data-testid="resources">{Array.isArray(context.resources) ? context.resources.length : 'undefined'}</div>
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

    expect(screen.getByTestId('username')).toHaveTextContent('testuser');
    expect(screen.getByTestId('libraryId')).toHaveTextContent('lib123');
    expect(screen.getByTestId('canManageTeam')).toHaveTextContent('true');
    expect(Number(screen.getByTestId('roles').textContent)).not.toBeNaN();
    expect(Number(screen.getByTestId('permissions').textContent)).not.toBeNaN();
    expect(Number(screen.getByTestId('resources').textContent)).not.toBeNaN();
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
    }).toThrow('NoAccess');
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

    expect(screen.getByTestId('canManageTeam')).toHaveTextContent('false');
  });

  it('throws error when libraryId is missing', () => {
    (useParams as jest.Mock).mockReturnValue({}); // No libraryId

    expect(() => {
      renderWrapper(
        <LibraryAuthZProvider>
          <TestComponent />
        </LibraryAuthZProvider>,
      );
    }).toThrow('MissingLibrary');
  });

  it('throws error when useLibraryAuthZ is used outside provider', () => {
    const BrokenComponent = () => {
      useLibraryAuthZ();
      return null;
    };

    expect(() => {
      renderWrapper(<BrokenComponent />);
    }).toThrow('useLibraryAuthZ must be used within an LibraryAuthZProvider');
  });
});
