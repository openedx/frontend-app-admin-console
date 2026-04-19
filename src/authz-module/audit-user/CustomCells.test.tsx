import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWrapper } from '@src/setupTest';
import { DataTableContext } from '@openedx/paragon';
import { ViewAllPermissionsCell, ActionsCell, PermissionsCell } from './CustomCells';

describe('CustomCells', () => {
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

  beforeAll(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      },
    });
  });

  describe('ViewAllPermissionsCell', () => {
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

  describe('ActionsCell', () => {
    it('renders delete button', () => {
      renderWrapper(<ActionsCell {...mockCellProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('PermissionsCell', () => {
    it('renders permission count', () => {
      renderWrapper(<PermissionsCell {...mockCellProps} />);
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('handles zero permission count', () => {
      const propsWithZero = {
        row: {
          ...mockCellProps.row,
          original: { ...mockUserRole, permissionCount: 0 },
        },
      };
      renderWrapper(<PermissionsCell {...propsWithZero} />);
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('handles missing permission count', () => {
      const { permissionCount, ...userRoleWithoutCount } = mockUserRole;
      const propsWithoutCount = {
        row: {
          ...mockCellProps.row,
          original: userRoleWithoutCount as any,
        },
      };
      renderWrapper(<PermissionsCell {...propsWithoutCount} />);
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });
  });
});
