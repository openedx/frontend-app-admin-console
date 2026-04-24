import { screen } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWrapper } from '@src/setupTest';
import userEvent from '@testing-library/user-event';
import { DataTableContext } from '@openedx/paragon';
import {
  NameCell,
  ViewActionCell,
  RoleCell,
  OrgCell,
  ScopeCell,
  PermissionsCell,
  ViewAllPermissionsCell,
  createActionsCell,
} from './TableCells';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('TableCells Components', () => {
  beforeAll(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('NameCell', () => {
    const mockUserRole = {
      isSuperadmin: false,
      role: 'course_staff',
      org: 'OpenedX',
      scope: 'course-v1:OpenedX+DemoX+DemoCourse',
      permissionCount: 27,
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
    };
    const mockCellProps = {
      row: {
        original: mockUserRole,
      },
    };
    beforeEach(() => {
      initializeMockApp({
        authenticatedUser: {
          userId: 1,
          username: 'testuser',
          email: 'testuser@example.com',
        },
      });
    });

    it('displays the full name when available', () => {
      renderWrapper(<NameCell {...mockCellProps} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays username when full name is not available', () => {
      const propsWithoutFullName = {
        row: {
          original: {
            ...mockUserRole,
            fullName: undefined,
          },
        },
      };

      renderWrapper(<NameCell {...propsWithoutFullName} />);
      expect(screen.getByText('johndoe')).toBeInTheDocument();
    });

    it('displays username when full name is empty string', () => {
      const propsWithEmptyFullName = {
        row: {
          original: {
            ...mockUserRole,
            fullName: '',
          },
        },
      };

      renderWrapper(<NameCell {...propsWithEmptyFullName} />);
      expect(screen.getByText('johndoe')).toBeInTheDocument();
    });

    it('shows current user indicator when username matches authenticated user', () => {
      const currentUserProps = {
        row: {
          original: {
            ...mockUserRole,
            username: 'testuser',
            fullName: 'Test User',
          },
        },
      };

      renderWrapper(<NameCell {...currentUserProps} />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText(/\(Me\)/)).toBeInTheDocument();
    });

    it('does not show current user indicator when username does not match authenticated user', () => {
      renderWrapper(<NameCell {...mockCellProps} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText(/\(Me\)/)).not.toBeInTheDocument();
    });

    it('shows current user indicator with username fallback when no full name is provided', () => {
      const currentUserPropsNoFullName = {
        row: {
          original: {
            ...mockUserRole,
            username: 'testuser',
            fullName: undefined,
          },
        },
      };

      renderWrapper(<NameCell {...currentUserPropsNoFullName} />);
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText(/\(Me\)/)).toBeInTheDocument();
    });

    it('handles missing username in authenticated user gracefully', () => {
      const contextWithoutUsername = {
        authenticatedUser: {
          username: undefined,
          email: 'testuser@example.com',
        },
      };

      renderWrapper(<NameCell {...mockCellProps} />, contextWithoutUsername);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText(/\(Me\)/)).not.toBeInTheDocument();
    });
  });

  describe('ViewActionCell', () => {
    const mockUserRole = {
      isSuperadmin: false,
      role: 'course_staff',
      org: 'OpenedX',
      scope: 'course-v1:OpenedX+DemoX+DemoCourse',
      permissionCount: 27,
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
    };

    const mockCellProps = {
      row: {
        original: mockUserRole,
      },
    };
    beforeEach(() => {
      initializeMockApp({
        authenticatedUser: {
          userId: 1,
          username: 'testuser',
          email: 'testuser@example.com',
        },
      });
      mockNavigate.mockClear();
    });

    it('renders view action button', () => {
      renderWrapper(<ViewActionCell {...mockCellProps} />);
      const viewButton = screen.getByRole('button', { name: /view/i });
      expect(viewButton).toBeInTheDocument();
    });

    it('has correct accessibility attributes', () => {
      renderWrapper(<ViewActionCell {...mockCellProps} />);
      const viewButton = screen.getByRole('button', { name: /view/i });
      expect(viewButton).toHaveAttribute('aria-label');
    });

    it('navigates to user profile when clicked', async () => {
      const user = userEvent.setup();
      renderWrapper(<ViewActionCell {...mockCellProps} />);

      const viewButton = screen.getByRole('button', { name: /view/i });
      await user.click(viewButton);

      expect(mockNavigate).toHaveBeenCalledWith('/authz/user/johndoe');
    });

    it('navigates with correct username for different user', async () => {
      const user = userEvent.setup();
      const differentUserProps = {
        row: {
          original: {
            ...mockUserRole,
            username: 'janedoe',
          },
        },
      };

      renderWrapper(<ViewActionCell {...differentUserProps} />);

      const viewButton = screen.getByRole('button', { name: /view/i });
      await user.click(viewButton);

      expect(mockNavigate).toHaveBeenCalledWith('/authz/user/janedoe');
    });

    it('handles empty username gracefully', async () => {
      const user = userEvent.setup();
      const emptyUsernameProps = {
        row: {
          original: {
            ...mockUserRole,
            username: '',
          },
        },
      };

      renderWrapper(<ViewActionCell {...emptyUsernameProps} />);

      const viewButton = screen.getByRole('button', { name: /view/i });
      await user.click(viewButton);

      expect(mockNavigate).toHaveBeenCalledWith('/authz/user/');
    });

    it('handles special characters in username', async () => {
      const user = userEvent.setup();
      const specialUsernameProps = {
        row: {
          original: {
            ...mockUserRole,
            username: 'user+with@special.chars',
          },
        },
      };

      renderWrapper(<ViewActionCell {...specialUsernameProps} />);

      const viewButton = screen.getByRole('button', { name: /view/i });
      await user.click(viewButton);

      expect(mockNavigate).toHaveBeenCalledWith('/authz/user/user+with@special.chars');
    });
  });

  describe('RoleCell', () => {
    const mockCell = {
      getCellProps: jest.fn(() => ({ 'data-testid': 'role-cell' })),
    };

    it('renders the role label for a mapped role', () => {
      const props = {
        value: 'library_admin',
        cell: mockCell,
        row: {
          original: {
            role: 'library_admin', org: 'Test Org', scope: 'Test Scope', permissionCount: 1,
          },
        },
        column: { id: 'role' },
      };

      renderWrapper(<RoleCell {...props} />);

      expect(screen.getByText('Library Admin')).toBeInTheDocument();
      expect(mockCell.getCellProps).toHaveBeenCalledWith({ 'data-role': 'Library Admin' });
    });

    it('renders empty string for unmapped role', () => {
      const props = {
        value: 'unknown_role',
        cell: mockCell,
        row: {
          original: {
            role: 'unknown_role', org: 'Test Org', scope: 'Test Scope', permissionCount: 1,
          },
        },
        column: { id: 'role' },
      };

      renderWrapper(<RoleCell {...props} />);

      const cellElement = screen.getByTestId('role-cell');
      expect(cellElement).toHaveTextContent('');
      expect(mockCell.getCellProps).toHaveBeenCalledWith({ 'data-role': '' });
    });

    it('applies cell props correctly', () => {
      const props = {
        value: 'course_staff',
        cell: mockCell,
        row: {
          original: {
            role: 'course_staff', org: 'Test Org', scope: 'Test Scope', permissionCount: 1,
          },
        },
        column: { id: 'role' },
      };

      renderWrapper(<RoleCell {...props} />);

      expect(screen.getByText('Course Staff')).toBeInTheDocument();
      expect(mockCell.getCellProps).toHaveBeenCalledWith({ 'data-role': 'Course Staff' });
    });
  });

  describe('OrgCell', () => {
    it('displays "All Organizations" for Django superuser role', () => {
      const props = {
        value: 'Test Org',
        row: {
          original: {
            role: 'django.superuser', org: 'Test Org', scope: 'Test Scope', permissionCount: 1,
          },
        },
        column: { id: 'org' },
      };

      renderWrapper(<OrgCell {...props} />);

      expect(screen.getByText('All Organizations')).toBeInTheDocument();
      expect(screen.queryByText('Test Org')).not.toBeInTheDocument();
    });

    it('displays "All Organizations" for Django global staff role', () => {
      const props = {
        value: 'Test Org',
        row: {
          original: {
            role: 'django.globalstaff', org: 'Test Org', scope: 'Test Scope', permissionCount: 1,
          },
        },
        column: { id: 'org' },
      };

      renderWrapper(<OrgCell {...props} />);

      expect(screen.getByText('All Organizations')).toBeInTheDocument();
      expect(screen.queryByText('Test Org')).not.toBeInTheDocument();
    });

    it('displays the actual org value for non-Django roles', () => {
      const props = {
        value: 'Test Organization',
        row: {
          original: {
            role: 'library_admin', org: 'Test Organization', scope: 'Test Scope', permissionCount: 1,
          },
        },
        column: { id: 'org' },
      };

      renderWrapper(<OrgCell {...props} />);

      expect(screen.getByText('Test Organization')).toBeInTheDocument();
      expect(screen.queryByText('All Organizations')).not.toBeInTheDocument();
    });
  });

  describe('ScopeCell', () => {
    it('displays "Global" for Django superuser role', () => {
      const props = {
        value: 'library',
        row: {
          original: {
            role: 'django.superuser', org: 'Test Org', scope: 'Test Scope', permissionCount: 1,
          },
        },
        column: { id: 'scope' },
      };

      renderWrapper(<ScopeCell {...props} />);

      expect(screen.getByText('Global')).toBeInTheDocument();
      expect(screen.queryByText('library')).not.toBeInTheDocument();
    });

    it('displays "Global" for Django global staff role', () => {
      const props = {
        value: 'course',
        row: {
          original: {
            role: 'django.globalstaff', org: 'Test Org', scope: 'Test Scope', permissionCount: 1,
          },
        },
        column: { id: 'scope' },
      };

      renderWrapper(<ScopeCell {...props} />);

      expect(screen.getByText('Global')).toBeInTheDocument();
      expect(screen.queryByText('course')).not.toBeInTheDocument();
    });

    it('displays the actual scope value for non-Django roles', () => {
      const props = {
        value: 'Course Scope',
        row: {
          original: {
            role: 'course_admin', org: 'Test Org', scope: 'Course Scope', permissionCount: 1,
          },
        },
        column: { id: 'scope' },
      };

      renderWrapper(<ScopeCell {...props} />);

      expect(screen.getByText('Course Scope')).toBeInTheDocument();
      expect(screen.queryByText('Global')).not.toBeInTheDocument();
    });
  });

  describe('PermissionsCell', () => {
    it('displays "Total Access" for Django superuser role', () => {
      const props = {
        row: {
          original: {
            role: 'django.superuser',
            org: 'Test Org',
            scope: 'Test Scope',
            permissionCount: 10,
          },
        },
        column: { id: 'permissions' },
      };

      renderWrapper(<PermissionsCell {...props} />);

      expect(screen.getByText('Total Access')).toBeInTheDocument();
    });

    it('displays "Partial Access" for Django global staff role', () => {
      const props = {
        row: {
          original: {
            role: 'django.globalstaff',
            permissionCount: 5,
            org: 'Test Org',
            scope: 'Test Scope',
          },
        },
        column: { id: 'permissions' },
      };

      renderWrapper(<PermissionsCell {...props} />);

      expect(screen.getByText('Partial Access')).toBeInTheDocument();
    });

    it('displays permission count for non-Django roles', () => {
      const props = {
        row: {
          original: {
            role: 'library_admin',
            permissionCount: 3,
            org: 'Test Org',
            scope: 'Test Scope',
          },
        },
        column: { id: 'permissions' },
      };

      renderWrapper(<PermissionsCell {...props} />);

      expect(screen.getByText('3 permissions available')).toBeInTheDocument();
    });
  });

  describe('createActionsCell', () => {
    const mockOnClickDeleteButton = jest.fn();
    const baseRow = {
      original: {
        role: 'library_admin',
        org: 'Test Org',
        scope: 'Test Scope',
        permissionCount: 1,
        canManageScope: true,
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders a delete button and calls onClickDeleteButton when clicked', async () => {
      const user = userEvent.setup();
      const CustomActionsCell = createActionsCell({
        onClickDeleteButton: mockOnClickDeleteButton,
        isUserAuthenticatedPage: false,
      });
      renderWrapper(<CustomActionsCell row={baseRow} column={{ id: 'actions' }} />);

      const deleteButton = screen.getByRole('button', { name: /delete role action/i });
      expect(deleteButton).toBeInTheDocument();

      await user.click(deleteButton);
      expect(mockOnClickDeleteButton).toHaveBeenCalledWith({ name: 'Library Admin', role: 'library_admin', scope: 'Test Scope' });
    });

    it('renders a disabled delete icon for admin roles when isUserAuthenticatedPage is true', () => {
      const adminRow = {
        original: {
          role: 'course_admin',
          org: 'Test Org',
          scope: 'Test Scope',
          permissionCount: 1,
        },
      };
      const CustomActionsCell = createActionsCell({
        onClickDeleteButton: mockOnClickDeleteButton,
        isUserAuthenticatedPage: true,
      });
      renderWrapper(<CustomActionsCell row={adminRow} column={{ id: 'actions' }} />);

      const infoIcon = screen.getByRole('img', { hidden: true });
      expect(infoIcon).toBeInTheDocument();
    });

    it('renders a tooltip when hovering over delete icon for admin roles when isUserAuthenticatedPage is true', async () => {
      const adminRow = {
        original: {
          role: 'course_admin',
          org: 'Test Org',
          scope: 'Test Scope',
          permissionCount: 1,
        },
      };
      const user = userEvent.setup();
      const CustomActionsCell = createActionsCell({
        onClickDeleteButton: mockOnClickDeleteButton,
        isUserAuthenticatedPage: true,
      });
      renderWrapper(<CustomActionsCell row={adminRow} column={{ id: 'actions' }} />);

      const infoIcon = screen.getByRole('img', { hidden: true });
      await user.hover(infoIcon);
      expect(screen.getByText(/You can’t remove your own admin role/i)).toBeInTheDocument();
    });

    it('renders info icon with tooltip for Django managed roles', async () => {
      const djangoRow = {
        original: {
          role: 'django.superuser',
          org: 'Test Org',
          scope: 'Test Scope',
          permissionCount: 1,
        },
      };
      const user = userEvent.setup();
      const CustomActionsCell = createActionsCell({
        onClickDeleteButton: mockOnClickDeleteButton,
        isUserAuthenticatedPage: true,
      });
      renderWrapper(<CustomActionsCell row={djangoRow} column={{ id: 'actions' }} />);

      const infoIcon = screen.getByRole('img', { hidden: true });
      expect(infoIcon).toBeInTheDocument();
      await user.hover(infoIcon);
      expect(screen.getByText(/Please go to Django Admin to manage it/i)).toBeInTheDocument();
    });

    it('renders a disabled button when user does not have permission', async () => {
      const CustomActionsCell = createActionsCell({
        onClickDeleteButton: mockOnClickDeleteButton,
        isUserAuthenticatedPage: false,
      });
      const customRow = {
        original: {
          ...baseRow,
          canManageScope: false,
        },
      };
      renderWrapper(<CustomActionsCell row={customRow} column={{ id: 'actions' }} />);

      const deleteButton = screen.queryByRole('button', { name: /delete role action/i });
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('ViewAllPermissionsCell', () => {
    const mockUserRole = {
      role: 'course_admin',
      org: 'OpenedX',
      scope: 'course-v1:OpenedX+DemoX+DemoCourse',
      permissionCount: 5,
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
    };

    const mockCellProps = {
      row: {
        original: mockUserRole,
        id: 'test-row-1',
        isExpanded: false,
        toggleRowExpanded: jest.fn(),
        values: mockUserRole,
      },
    };

    it('renders view more link', () => {
      renderWrapper(<ViewAllPermissionsCell {...mockCellProps} />);
      expect(screen.getByText(/view all permissions/i)).toBeInTheDocument();
    });

    it('displays correct link text', () => {
      renderWrapper(<ViewAllPermissionsCell {...mockCellProps} />);
      expect(screen.getByText(/view all permissions/i)).toBeInTheDocument();
    });

    it('handles toggle expand functionality with accordion behavior', async () => {
      const user = userEvent.setup();
      const mockToggleRowExpanded = jest.fn();
      const mockInstance = {
        state: {
          expanded: {
            'other-row-1': true,
            'other-row-2': true,
          },
        },
        toggleRowExpanded: mockToggleRowExpanded,
      };

      const propsWithToggle = {
        row: {
          ...mockCellProps.row,
          toggleRowExpanded: jest.fn(),
        },
      };

      renderWrapper(
        <DataTableContext.Provider value={mockInstance}>
          <ViewAllPermissionsCell {...propsWithToggle} />
        </DataTableContext.Provider>,
      );

      const toggleButton = screen.getByText(/view all permissions/i);
      await user.click(toggleButton);

      // Should close other expanded rows first
      expect(mockToggleRowExpanded).toHaveBeenCalledWith('other-row-1', false);
      expect(mockToggleRowExpanded).toHaveBeenCalledWith('other-row-2', false);
      // Should toggle the current row
      expect(propsWithToggle.row.toggleRowExpanded).toHaveBeenCalled();
    });

    it('toggles row without closing others when row is already expanded', async () => {
      const user = userEvent.setup();
      const mockToggleRowExpanded = jest.fn();
      const mockInstance = {
        state: {
          expanded: {
            'other-row-1': true,
          },
        },
        toggleRowExpanded: mockToggleRowExpanded,
      };

      const propsWithExpandedRow = {
        row: {
          ...mockCellProps.row,
          isExpanded: true,
          toggleRowExpanded: jest.fn(),
        },
      };

      renderWrapper(
        <DataTableContext.Provider value={mockInstance}>
          <ViewAllPermissionsCell {...propsWithExpandedRow} />
        </DataTableContext.Provider>,
      );

      const toggleButton = screen.getByText(/hide all permissions/i);
      await user.click(toggleButton);

      // Should NOT close other expanded rows when current row is already expanded
      expect(mockToggleRowExpanded).not.toHaveBeenCalled();
      // Should still toggle the current row
      expect(propsWithExpandedRow.row.toggleRowExpanded).toHaveBeenCalled();
    });
  });
});
