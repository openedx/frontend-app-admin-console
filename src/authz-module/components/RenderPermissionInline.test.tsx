import { screen } from '@testing-library/react';
import type { CategoryPermissions } from '@src/authz-module/catalog';
import { renderWrapper } from '@src/testUtils';
import RenderPermissionInline from './RenderPermissionInline';

const items: CategoryPermissions[] = [
  {
    category: {
      id: 'library', displayName: 'Library', description: 'Library permissions.', icon: null,
    },
    permissions: [
      {
        id: 'content_libraries.view_library',
        displayName: 'View',
        description: 'See the library.',
        icon: null,
        categoryId: 'library',
        scopeTypes: ['lib'],
      },
      {
        id: 'content_libraries.manage_library_tags',
        displayName: 'Manage tags',
        description: 'Manage the library tags.',
        icon: null,
        categoryId: 'library',
        scopeTypes: ['lib'],
      },
    ],
  },
];

describe('RenderPermissionInline', () => {
  it('shows each category with its permissions', () => {
    renderWrapper(<RenderPermissionInline items={items} />);

    expect(screen.getByRole('heading', { name: 'Library' })).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Manage tags')).toBeInTheDocument();
  });

  it('shows nothing when there are no categories', () => {
    renderWrapper(<RenderPermissionInline items={[]} />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
