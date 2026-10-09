import { screen } from '@testing-library/react';
import { initializeMocks, renderWrapper } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { DataTableContext } from '@openedx/paragon';
import {
  RoleBadgeCell,
  OrgIconCell,
  ScopeNameCell,
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
    initializeMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const assignmentProps = (
    original: { role?: string; scope?: string; org?: string; scopeDisplayName?: string },
  ) => ({
    row: {
      original: {
        role: 'course_staff', scope: 'course-v1:OpenedX+DemoX+DemoCourse', org: 'OpenedX', scopeDisplayName: '', ...original,
      },
    },
  });

  describe('RoleBadgeCell', () => {
    it('shows the role label', () => {
      renderWrapper(<RoleBadgeCell {...assignmentProps({ role: 'library_admin' })} />);

      expect(screen.getByText('Library Admin')).toBeInTheDocument();
    });

    it('shows the role key when the role has no label', () => {
      renderWrapper(<RoleBadgeCell {...assignmentProps({ role: 'unknown_role' })} />);

      expect(screen.getByText('unknown_role')).toBeInTheDocument();
    });
  });

  describe('OrgIconCell', () => {
    it('shows the organization', () => {
      renderWrapper(<OrgIconCell {...assignmentProps({ org: 'Test Organization' })} />);

      expect(screen.getByText('Test Organization')).toBeInTheDocument();
      expect(screen.queryByText('All platform')).not.toBeInTheDocument();
    });

    it('displays "All platform" for a wildcard organization', () => {
      renderWrapper(<OrgIconCell {...assignmentProps({ scope: 'course-v1:*', org: '*' })} />);

      expect(screen.getByText('All platform')).toBeInTheDocument();
    });

    it('shows the organization for an organization-wide scope', () => {
      renderWrapper(<OrgIconCell {...assignmentProps({ scope: 'course-v1:MathDept+*', org: 'MathDept' })} />);

      expect(screen.getByText('MathDept')).toBeInTheDocument();
    });
  });

  describe('ScopeNameCell', () => {
    it("shows the scope's display name", () => {
      renderWrapper(<ScopeNameCell {...assignmentProps({ scope: 'course-v1:OpenedX+DemoX+DemoCourse', org: 'OpenedX', scopeDisplayName: 'Open edX Demo Course' })} />);

      expect(screen.getByText('Open edX Demo Course')).toBeInTheDocument();
      expect(screen.queryByText('course-v1:OpenedX+DemoX+DemoCourse')).not.toBeInTheDocument();
    });

    it('falls back to the scope key when the API resolved no display name', () => {
      renderWrapper(<ScopeNameCell {...assignmentProps({ scope: 'course-v1:OpenedX+DemoX+DemoCourse', org: 'OpenedX' })} />);

      expect(screen.getByText('course-v1:OpenedX+DemoX+DemoCourse')).toBeInTheDocument();
    });

    it('names a platform-wide course scope instead of showing its wildcard key', () => {
      renderWrapper(<ScopeNameCell {...assignmentProps({ scope: 'course-v1:*', org: '*' })} />);

      expect(screen.getByText('All courses')).toBeInTheDocument();
      expect(screen.queryByText('course-v1:*')).not.toBeInTheDocument();
    });

    it('names a platform-wide library scope', () => {
      renderWrapper(<ScopeNameCell {...assignmentProps({ scope: 'lib:*', org: '*' })} />);

      expect(screen.getByText('All libraries')).toBeInTheDocument();
    });

    it('names an organization-wide course scope', () => {
      renderWrapper(<ScopeNameCell {...assignmentProps({ scope: 'course-v1:MathDept+*', org: 'MathDept' })} />);

      expect(screen.getByText('All courses')).toBeInTheDocument();
    });

    it('names an organization-wide library scope', () => {
      renderWrapper(<ScopeNameCell {...assignmentProps({ scope: 'lib:MathDept:*', org: 'MathDept' })} />);

      expect(screen.getByText('All libraries')).toBeInTheDocument();
    });

    it('shows the scope key when a wildcard belongs to a different organization', () => {
      renderWrapper(<ScopeNameCell {...assignmentProps({ scope: 'course-v1:MathDept+*', org: 'OtherOrg' })} />);

      expect(screen.getByText('course-v1:MathDept+*')).toBeInTheDocument();
    });
  });

  describe('PermissionsCell', () => {
    it('displays "Total Access" for Django superuser role', () => {
      const props = {
        row: {
          id: '0',
          original: {
            role: 'django.superuser',
            org: 'Test Org',
            scope: 'Test Scope',
            scopeDisplayName: '',
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
          id: '0',
          original: {
            role: 'django.globalstaff',
            scopeDisplayName: '',
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
          id: '0',
          original: {
            role: 'library_admin',
            scopeDisplayName: '',
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
        scopeDisplayName: '',
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
          scopeDisplayName: '',
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
          scopeDisplayName: '',
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
          scopeDisplayName: '',
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

    it('renders a disabled delete button with a tooltip when course authoring is disabled for the course', async () => {
      const user = userEvent.setup();
      const CustomActionsCell = createActionsCell({
        onClickDeleteButton: mockOnClickDeleteButton,
        isUserAuthenticatedPage: false,
        isCourseEnabled: () => false,
      });
      const courseRow = {
        original: {
          role: 'course_staff',
          org: 'Test Org',
          scope: 'course-v1:TestOrg+C101+2026',
          scopeDisplayName: '',
          permissionCount: 1,
          canManageScope: true,
        },
      };
      renderWrapper(<CustomActionsCell row={courseRow} column={{ id: 'actions' }} />);

      const deleteButton = screen.getByRole('button', { name: /delete role action/i });
      expect(deleteButton).toBeDisabled();

      await user.hover(deleteButton);
      expect(screen.getByText(/manage its team in Studio instead/i)).toBeInTheDocument();
    });

    it('keeps the delete action enabled for library roles when course authoring is disabled', () => {
      const CustomActionsCell = createActionsCell({
        onClickDeleteButton: mockOnClickDeleteButton,
        isUserAuthenticatedPage: false,
        isCourseEnabled: () => false,
      });
      renderWrapper(<CustomActionsCell row={baseRow} column={{ id: 'actions' }} />);

      const deleteButton = screen.getByRole('button', { name: /delete role action/i });
      expect(deleteButton).toBeEnabled();
    });
  });

  describe('ViewAllPermissionsCell', () => {
    const mockUserRole = {
      role: 'course_admin',
      org: 'OpenedX',
      scope: 'course-v1:OpenedX+DemoX+DemoCourse',
      scopeDisplayName: '',
      permissionCount: 5,
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
    };

    const mockCellProps = {
      row: {
        id: 'test-row-1',
        original: mockUserRole,
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

    it('reports whether the permissions breakdown is open', () => {
      const { rerender } = renderWrapper(<ViewAllPermissionsCell {...mockCellProps} />);
      expect(screen.getByRole('button', { name: /view all permissions/i }))
        .toHaveAttribute('aria-expanded', 'false');

      rerender(<ViewAllPermissionsCell row={{ ...mockCellProps.row, isExpanded: true }} />);
      expect(screen.getByRole('button', { name: /hide all permissions/i }))
        .toHaveAttribute('aria-expanded', 'true');
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
