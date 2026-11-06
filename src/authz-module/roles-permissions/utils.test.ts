import type { ScopeCatalog } from '@src/authz-module/catalog';
import {
  buildCatalogCategory, buildCatalogPermission, buildCatalogRole,
} from '@src/authz-module/catalog/testUtils';
import { buildPermissionMatrix } from './utils';

const otherCategory = buildCatalogCategory('other');

const scopeCatalog: ScopeCatalog = {
  scopeType: 'lib',
  categories: [buildCatalogCategory('library'), buildCatalogCategory('team')],
  permissions: [
    buildCatalogPermission('content_libraries.view_library', { categoryId: 'library' }),
    buildCatalogPermission('content_libraries.manage_library_team', { categoryId: 'team' }),
    buildCatalogPermission('content_libraries.edit_library_content', { categoryId: 'library' }),
  ],
  roles: [
    buildCatalogRole('library_admin', {
      permissions: [
        'content_libraries.view_library', 'content_libraries.manage_library_team', 'content_libraries.edit_library_content',
      ],
    }),
    buildCatalogRole('library_user', { permissions: ['content_libraries.view_library'] }),
  ],
};

const permissionIdsByCategory = (matrix: ReturnType<typeof buildPermissionMatrix>) => matrix.map(
  ({ category, permissions }) => [category.id, permissions.map(({ permission }) => permission.id)],
);

describe('buildPermissionMatrix', () => {
  it('groups the permissions by category, in catalog order', () => {
    const matrix = buildPermissionMatrix(scopeCatalog, otherCategory);

    expect(permissionIdsByCategory(matrix)).toEqual([
      ['library', ['content_libraries.view_library', 'content_libraries.edit_library_content']],
      ['team', ['content_libraries.manage_library_team']],
    ]);
  });

  it('shows which roles grant each permission', () => {
    const [libraryCategory] = buildPermissionMatrix(scopeCatalog, otherCategory);

    expect(libraryCategory.permissions.map(({ grantedTo }) => grantedTo)).toEqual([
      { library_admin: true, library_user: true },
      { library_admin: true, library_user: false },
    ]);
  });

  it('groups the permissions without a category in a final "other" category', () => {
    const matrix = buildPermissionMatrix({
      ...scopeCatalog,
      permissions: [...scopeCatalog.permissions, buildCatalogPermission('content_libraries.export_library')],
    }, otherCategory);

    expect(permissionIdsByCategory(matrix).at(-1)).toEqual(['other', ['content_libraries.export_library']]);
  });

  it('leaves out the "other" category when every permission has a category', () => {
    const matrix = buildPermissionMatrix(scopeCatalog, otherCategory);

    expect(matrix.map(({ category }) => category.id)).not.toContain('other');
  });
});
