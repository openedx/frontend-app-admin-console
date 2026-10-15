import { screen, within } from '@testing-library/react';
import type { CategoryPermissions } from '@src/authz-module/catalog';
import { buildCatalogCategory, buildCatalogPermission } from '@src/authz-module/catalog/testUtils';
import { renderWrapper } from '@src/testUtils';
import RenderPermissionColumn from './RenderPermissionColumn';

const items: CategoryPermissions[] = [
  {
    category: buildCatalogCategory('course', { displayName: 'Course access & content' }),
    permissions: [
      buildCatalogPermission('courses.view_course', { displayName: 'View course', categoryId: 'course' }),
      buildCatalogPermission('courses.edit_course_content', { displayName: 'Edit content', categoryId: 'course' }),
    ],
  },
  {
    category: buildCatalogCategory('course_team', { displayName: 'Team' }),
    permissions: [
      buildCatalogPermission('courses.view_course_team', { displayName: 'View team', categoryId: 'course_team' }),
    ],
  },
];

describe('RenderPermissionColumn', () => {
  it('shows each category with its permissions', () => {
    renderWrapper(<RenderPermissionColumn items={items} />);

    const [courseList, teamList] = screen.getAllByRole('list');
    expect(screen.getByRole('heading', { name: 'Course access & content' })).toBeInTheDocument();
    expect(within(courseList).getAllByRole('listitem').map(({ textContent }) => textContent)).toEqual([
      'View course', 'Edit content',
    ]);
    expect(screen.getByRole('heading', { name: 'Team' })).toBeInTheDocument();
    expect(within(teamList).getByText('View team')).toBeInTheDocument();
  });

  it('shows nothing when there are no categories', () => {
    renderWrapper(<RenderPermissionColumn items={[]} />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
