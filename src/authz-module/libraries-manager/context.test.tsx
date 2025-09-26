import { screen } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { useValidateUserPermissions } from '@src/data/hooks';
import { renderWrapper } from '@src/setupTest';
import { LibraryAuthZProvider, useLibraryAuthZ } from './context';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('@src/data/hooks', () => ({
  useValidateUserPermissions: jest.fn(),
}));

const TestComponent = () => {
  const context = useLibraryAuthZ();
  return (
    <div>
      <div data-testid="username">{context.username}</div>
      <div data-testid="libraryId">{context.libraryId}</div>
      <div data-testid="canManageTeam">{context.canManageTeam ? 'true' : 'false'}</div>
    </div>
  );
};

describe('LibraryAuthZProvider', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ libraryId: 'lib123' });
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
      </LibraryAuthZProvider>
    );

    expect(screen.getByTestId('username')).toHaveTextContent('testuser');
    expect(screen.getByTestId('libraryId')).toHaveTextContent('lib123');
    expect(screen.getByTestId('canManageTeam')).toHaveTextContent('true');
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
        </LibraryAuthZProvider>
      );
    }).toThrow('NoAccess');
  });

  it('provides context when user can view but not manage team', () => {
    (useValidateUserPermissions as jest.Mock).mockReturnValue({
      data: [
        { allowed: true },  // canViewTeam
        { allowed: false }, // canManageTeam
      ],
    });

    renderWrapper(
      <LibraryAuthZProvider>
        <TestComponent />
      </LibraryAuthZProvider>
    );

    expect(screen.getByTestId('canManageTeam')).toHaveTextContent('false');
  });

  it('throws error when libraryId is missing', () => {
    (useParams as jest.Mock).mockReturnValue({}); // No libraryId

    expect(() => {
      renderWrapper(
        <LibraryAuthZProvider>
          <TestComponent />
        </LibraryAuthZProvider>
      );;
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
