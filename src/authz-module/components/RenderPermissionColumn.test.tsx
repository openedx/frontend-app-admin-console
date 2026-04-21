import { screen } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform/testing';
import { renderWrapper } from '@src/setupTest';
import { BookOpen, Person } from '@openedx/paragon/icons';
import RenderPermissionColumn from './RenderPermissionColumn';

describe('RenderPermissionColumn', () => {
  beforeAll(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      },
    });
  });

  const mockItems = [
    {
      key: 'course_content',
      icon: BookOpen,
      label: 'Course Content',
      description: 'Manage course content',
      perms: [
        {
          key: 'view_course',
          resource: 'course_content',
          label: 'View Course',
          description: 'View course content',
          actionKey: 'view_course',
          icon: BookOpen,
          disabled: false,
        },
        {
          key: 'edit_course',
          resource: 'course_content',
          label: 'Edit Course',
          description: 'Edit course content',
          actionKey: 'edit_course',
          icon: Person,
          disabled: false,
        },
      ],
    },
    {
      key: 'user_management',
      icon: Person,
      label: 'User Management',
      description: 'Manage users',
      perms: [
        {
          key: 'view_users',
          resource: 'user_management',
          label: 'View Users',
          description: 'View user information',
          actionKey: 'view_users',
          icon: Person,
          disabled: false,
        },
      ],
    },
  ];

  it('renders without crashing', () => {
    const { container } = renderWrapper(<RenderPermissionColumn items={mockItems} />);
    expect(container.querySelector('.mb-4')).toBeInTheDocument();
  });

  it('displays resource labels', () => {
    renderWrapper(<RenderPermissionColumn items={mockItems} />);
    expect(screen.getByText('Course Content')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('displays permission labels', () => {
    renderWrapper(<RenderPermissionColumn items={mockItems} />);
    expect(screen.getByText('View Course')).toBeInTheDocument();
    expect(screen.getByText('Edit Course')).toBeInTheDocument();
    expect(screen.getByText('View Users')).toBeInTheDocument();
  });

  it('renders multiple resource groups', () => {
    renderWrapper(<RenderPermissionColumn items={mockItems} />);
    const resourceGroups = screen.getAllByText(/Course Content|User Management/);
    expect(resourceGroups).toHaveLength(2);
  });

  it('renders permissions in horizontal list', () => {
    const { container } = renderWrapper(<RenderPermissionColumn items={mockItems} />);
    const permissionsList = container.querySelector('ul.d-flex');
    expect(permissionsList).toBeInTheDocument();
  });

  it('applies correct CSS classes to permission items', () => {
    const { container } = renderWrapper(<RenderPermissionColumn items={mockItems} />);
    const permissionItem = container.querySelector('li.d-flex');
    expect(permissionItem).toHaveClass('align-items-center', 'text-primary-400');
  });

  it('handles empty items array', () => {
    const { container } = renderWrapper(<RenderPermissionColumn items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles single item with single permission', () => {
    const singleItem = [mockItems[1]]; // User Management item with one permission
    renderWrapper(<RenderPermissionColumn items={singleItem} />);
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('View Users')).toBeInTheDocument();
  });

  it('applies border styling to multiple permissions correctly', () => {
    const { container } = renderWrapper(<RenderPermissionColumn items={[mockItems[0]]} />);
    const permissionItems = container.querySelectorAll('li');
    // First item should have border-right and pr-2
    expect(permissionItems[0]).toHaveClass('border-right', 'pr-2');
    // Last item should not have border-right
    expect(permissionItems[1]).not.toHaveClass('border-right');
    // Second item should have pl-2
    expect(permissionItems[1]).toHaveClass('pl-2');
  });
});
