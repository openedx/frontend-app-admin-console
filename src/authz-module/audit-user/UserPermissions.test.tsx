import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWrapper } from '@src/setupTest';
import UserPermissions from './UserPermissions';

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
});
