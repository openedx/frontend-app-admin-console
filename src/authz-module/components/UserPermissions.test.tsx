import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWrapper } from '@src/setupTest';
import * as coursesConstants from '@src/authz-module/courses/constant';
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

    const originalRolesObject = coursesConstants.rolesObject;
    (coursesConstants as any).rolesObject = [...originalRolesObject, ...mockRoleObject];

    const props = {
      row: {
        original: {
          role: 'test_viewer',
        },
      },
    };

    const { getByTestId } = renderWrapper(<UserPermissions {...props} />);
    expect(getByTestId('render-permission-inline')).toBeInTheDocument();
    (coursesConstants as any).rolesObject = originalRolesObject;
  });

  it('returns null when role is not found in rolesObject (line 52 coverage)', () => {
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
