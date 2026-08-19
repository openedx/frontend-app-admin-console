import { screen } from '@testing-library/react';
import { initializeMocks, renderWrapper } from '@src/testUtils';
import { BookOpen } from '@openedx/paragon/icons';
import RenderPermissionInLine from './RenderPermissionInLine';

describe('RenderPermissionInLine', () => {
  beforeAll(() => {
    initializeMocks();
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
      ],
    },
  ];

  it('renders without crashing', () => {
    const { container } = renderWrapper(<RenderPermissionInLine items={mockItems} />);
    expect(container.querySelector('.d-flex')).toBeInTheDocument();
  });

  it('displays the resource label', () => {
    renderWrapper(<RenderPermissionInLine items={mockItems} />);
    expect(screen.getByText('Course Content')).toBeInTheDocument();
  });

  it('displays permission labels', () => {
    renderWrapper(<RenderPermissionInLine items={mockItems} />);
    expect(screen.getByText('View Course')).toBeInTheDocument();
  });

  it('renders empty when no items provided', () => {
    const { container } = renderWrapper(<RenderPermissionInLine items={[]} />);
    expect(container.querySelector('.d-flex')).toBeInTheDocument();
  });
});
