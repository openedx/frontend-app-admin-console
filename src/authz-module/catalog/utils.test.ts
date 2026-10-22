import { SCOPE_TYPES } from '@src/authz-module/constants';
import { buildCatalogCategory, buildCatalogPermission, buildCatalogRole } from './testUtils';
import type { AuthzCatalog, Role } from './types';
import { getScopeCatalog, sortRolesByPermissionCount } from './utils';

const catalog: AuthzCatalog = {
  scopeTypes: [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY],
  categories: [buildCatalogCategory('course'), buildCatalogCategory('library'), buildCatalogCategory('team')],
  permissions: [
    buildCatalogPermission('courses.view_course', { categoryId: 'course', scopeTypes: [SCOPE_TYPES.COURSE] }),
    buildCatalogPermission('courses.edit_course_content', { categoryId: 'course', scopeTypes: [SCOPE_TYPES.COURSE] }),
    buildCatalogPermission('content_libraries.view_library', { categoryId: 'library', scopeTypes: [SCOPE_TYPES.LIBRARY] }),
    buildCatalogPermission('team.view_team', {
      categoryId: 'team', scopeTypes: [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY],
    }),
  ],
  roles: [
    buildCatalogRole('course_staff', { permissions: ['courses.view_course'], scopeTypes: [SCOPE_TYPES.COURSE] }),
    buildCatalogRole('course_admin', {
      permissions: ['courses.view_course', 'courses.edit_course_content'], scopeTypes: [SCOPE_TYPES.COURSE],
    }),
    buildCatalogRole('library_user', {
      permissions: ['content_libraries.view_library'], scopeTypes: [SCOPE_TYPES.LIBRARY],
    }),
    buildCatalogRole('team_viewer', {
      permissions: ['team.view_team', 'content_libraries.view_library'],
      scopeTypes: [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY],
    }),
  ],
};

const roleIds = (roles: Role[]) => roles.map(({ role }) => role);

describe('getScopeCatalog', () => {
  it('keeps only the permissions granted in the scope type', () => {
    const { permissions } = getScopeCatalog(catalog, SCOPE_TYPES.LIBRARY);

    expect(permissions.map(({ id }) => id)).toEqual(['content_libraries.view_library', 'team.view_team']);
  });

  it('keeps only the categories used by the scope type permissions', () => {
    const { categories } = getScopeCatalog(catalog, SCOPE_TYPES.LIBRARY);

    expect(categories.map(({ id }) => id)).toEqual(['library', 'team']);
  });

  it('leaves out the roles without grants in the scope type', () => {
    const { roles } = getScopeCatalog(catalog, SCOPE_TYPES.LIBRARY);

    expect(roleIds(roles)).not.toContain('course_staff');
    expect(roleIds(roles)).not.toContain('course_admin');
  });

  it('leaves out a role granting a permission of several scope types only in another one', () => {
    const courseTeamViewer = buildCatalogRole('course_team_viewer', {
      permissions: ['team.view_team'], scopeTypes: [SCOPE_TYPES.COURSE],
    });
    const { roles } = getScopeCatalog({ ...catalog, roles: [courseTeamViewer] }, SCOPE_TYPES.LIBRARY);

    expect(roleIds(roles)).toEqual([]);
  });

  it('lists a role spanning several scope types in each, with only that scope type permissions', () => {
    const courseRole = getScopeCatalog(catalog, SCOPE_TYPES.COURSE).roles.find(({ role }) => role === 'team_viewer');
    const libraryRole = getScopeCatalog(catalog, SCOPE_TYPES.LIBRARY).roles.find(({ role }) => role === 'team_viewer');

    expect(courseRole?.permissions).toEqual(['team.view_team']);
    expect(libraryRole?.permissions).toEqual(['team.view_team', 'content_libraries.view_library']);
  });

  it('orders the roles from most to fewest permissions in the scope type', () => {
    const { roles } = getScopeCatalog(catalog, SCOPE_TYPES.COURSE);

    expect(roleIds(roles)).toEqual(['course_admin', 'course_staff', 'team_viewer']);
  });
});

describe('sortRolesByPermissionCount', () => {
  it('keeps the catalog order of roles with the same number of permissions', () => {
    const roles = [
      buildCatalogRole('b', { displayName: 'Bravo', permissions: ['one'] }),
      buildCatalogRole('c', { displayName: 'Charlie', permissions: ['one', 'two'] }),
      buildCatalogRole('a', { displayName: 'Alpha', permissions: ['one'] }),
    ];

    expect(roleIds(sortRolesByPermissionCount(roles))).toEqual(['c', 'b', 'a']);
  });
});
