import { screen } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWrapper } from '@src/setupTest';
import * as coursesConstants from '@src/authz-module/roles-permissions';
import UserPermissions from './UserPermissions';

jest.mock('./RenderPermissionInLine', () => (
  jest.fn(({ items }) => (
    <div data-testid="render-permission-inline" data-items-count={items?.length || 0}>
      Mocked RenderPermissionInLine
    </div>
  ))
));

describe('UserPermissions', () => {
  beforeAll(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Django managed roles', () => {
    const props = {
      row: {
        original: {
          role: 'django.superuser',
        },
      },
    };

    const { container } = renderWrapper(<UserPermissions {...props} />);
    expect(container.querySelector('.d-flex')).toBeInTheDocument();
  });

  it('renders regular course roles', () => {
    const props = {
      row: {
        original: {
          role: 'course_admin',
        },
      },
    };

    const { container } = renderWrapper(<UserPermissions {...props} />);
    expect(container.querySelector('.d-flex')).toBeInTheDocument();
  });

  it('renders library role permissions with their metadata labels', () => {
    const props = {
      row: {
        original: {
          role: 'library_admin',
        },
      },
    };

    const { container } = renderWrapper(<UserPermissions {...props} />);

    // Resource group headers from libraryResourceTypes
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    // Explicit labels from the permission metadata
    expect(screen.getAllByText('Manage tags').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Publish').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reuse').length).toBeGreaterThan(0);
    // No permission renders with an empty label
    const labels = Array.from(container.querySelectorAll('li span.font-weight-light'));
    expect(labels.length).toBeGreaterThan(0);
    labels.forEach((label) => expect(label.textContent?.trim()).not.toBe(''));
  });

  it('returns null when role is empty', () => {
    const props = {
      row: {
        original: {
          role: '',
        },
      },
    };

    const { container } = renderWrapper(<UserPermissions {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when row data is invalid', () => {
    const props = {
      row: {
        original: undefined as any,
      },
    };

    const { container } = renderWrapper(<UserPermissions {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders RenderPermissionInLine for single row layout', () => {
    const mockRoleObject = [
      {
        role: 'test_viewer',
        permissions: [1, 50, 100],
        userCount: 1,
        name: 'Test Viewer',
        description: 'Test role with limited permissions',
      },
    ];

    const originalRolesObject = coursesConstants.courseRolesWithPermissions;
    const courseRolesWithPermissionsSpy = jest.spyOn(coursesConstants, 'courseRolesWithPermissions', 'get')
      .mockReturnValue([...originalRolesObject, ...mockRoleObject] as typeof originalRolesObject);

    const props = {
      row: {
        original: {
          role: 'test_viewer',
        },
      },
    };

    const { getByTestId } = renderWrapper(<UserPermissions {...props} />);
    expect(getByTestId('render-permission-inline')).toBeInTheDocument();
    courseRolesWithPermissionsSpy.mockRestore();
  });

  it('returns null when role is not found in courseRolesWithPermissions (line 52 coverage)', () => {
    const props = {
      row: {
        original: {
          role: 'unknown_role',
        },
      },
    };

    const { container } = renderWrapper(<UserPermissions {...props} />);
    expect(container.firstChild).toBeNull();
  });
});
