import { screen } from '@testing-library/react';
import { initializeMocks, renderWrapper } from '@src/testUtils';
import * as coursesConstants from '@src/authz-module/roles-permissions';
import UserPermissions from './UserPermissions';

// ESM named exports are read-only bindings, so jest.spyOn(module, prop, 'get')
// can't intercept them. This module mock exposes a mutable override for
// `courseRolesWithPermissions` that individual tests can set via
// `setMockedCourseRoles(...)`.
let mockedCourseRoles: unknown[] | null = null;
export const setMockedCourseRoles = (roles: unknown[] | null) => {
  mockedCourseRoles = roles;
};

jest.mock('@src/authz-module/roles-permissions', () => {
  const actual = jest.requireActual('@src/authz-module/roles-permissions');
  return {
    ...actual,
    get courseRolesWithPermissions() {
      return mockedCourseRoles ?? actual.courseRolesWithPermissions;
    },
  };
});

jest.mock('./RenderPermissionInLine', () => (
  jest.fn(({ items }) => (
    <div data-testid="render-permission-inline" data-items-count={items?.length || 0}>
      Mocked RenderPermissionInLine
    </div>
  ))
));

describe('UserPermissions', () => {
  beforeAll(() => {
    initializeMocks();
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
    setMockedCourseRoles([...originalRolesObject, ...mockRoleObject]);

    const props = {
      row: {
        original: {
          role: 'test_viewer',
        },
      },
    };

    const { getByTestId } = renderWrapper(<UserPermissions {...props} />);
    expect(getByTestId('render-permission-inline')).toBeInTheDocument();
    setMockedCourseRoles(null);
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
