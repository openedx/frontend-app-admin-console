/**
 * Catalog test helpers: a catalog fixture, builders for it, and a mock of `useAuthzCatalog` serving it.
 *
 * Suites calling `mockAuthzCatalog` must mock the hook module:
 * `jest.mock('@src/authz-module/catalog/data/hooks', () => ({ useAuthzCatalog: jest.fn() }));`
 */
import { SCOPE_TYPES } from '@src/authz-module/constants';
import { useAuthzCatalog } from './data/hooks';
import type {
  AuthzCatalog, Category, Permission, Role,
} from './types';
import { getScopeCatalog } from './utils';

// Builders of catalog entries: the identifier plus the fields a test cares about; the rest default to
// empty values, and the display name to the identifier.

export const buildCatalogCategory = (id: string, fields: Partial<Category> = {}): Category => ({
  id, displayName: id, description: '', icon: null, ...fields,
});

export const buildCatalogPermission = (id: string, fields: Partial<Permission> = {}): Permission => ({
  id, displayName: id, description: '', icon: null, categoryId: null, scopeTypes: [], ...fields,
});

export const buildCatalogRole = (role: string, fields: Partial<Role> = {}): Role => ({
  role, displayName: role, description: '', icon: null, definitionKind: 'static', permissions: [], scopeTypes: [], ...fields,
});

/** A catalog with the course and library roles. */
export const authzCatalog: AuthzCatalog = {
  scopeTypes: [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY],
  categories: [
    buildCatalogCategory('course', { displayName: 'Course', icon: 'BookOpen' }),
    buildCatalogCategory('library', { displayName: 'Library', icon: 'CollectionsBookmark' }),
  ],
  permissions: [
    buildCatalogPermission('content_libraries.edit_library_content', { categoryId: 'library', scopeTypes: [SCOPE_TYPES.LIBRARY] }),
    buildCatalogPermission('content_libraries.manage_library_team', { categoryId: 'library', scopeTypes: [SCOPE_TYPES.LIBRARY] }),
    buildCatalogPermission('content_libraries.view_library', { categoryId: 'library', scopeTypes: [SCOPE_TYPES.LIBRARY] }),
    buildCatalogPermission('courses.edit_course_content', { categoryId: 'course', scopeTypes: [SCOPE_TYPES.COURSE] }),
    buildCatalogPermission('courses.manage_course_team', { categoryId: 'course', scopeTypes: [SCOPE_TYPES.COURSE] }),
    buildCatalogPermission('courses.view_course', { categoryId: 'course', scopeTypes: [SCOPE_TYPES.COURSE] }),
  ],
  roles: [
    buildCatalogRole('course_admin', {
      displayName: 'Course Admin',
      permissions: ['courses.edit_course_content', 'courses.manage_course_team', 'courses.view_course'],
      scopeTypes: [SCOPE_TYPES.COURSE],
    }),
    buildCatalogRole('course_staff', {
      displayName: 'Course Staff',
      permissions: ['courses.edit_course_content', 'courses.view_course'],
      scopeTypes: [SCOPE_TYPES.COURSE],
    }),
    buildCatalogRole('library_admin', {
      displayName: 'Library Admin',
      permissions: [
        'content_libraries.edit_library_content', 'content_libraries.manage_library_team', 'content_libraries.view_library',
      ],
      scopeTypes: [SCOPE_TYPES.LIBRARY],
    }),
    buildCatalogRole('library_author', {
      displayName: 'Library Author',
      permissions: ['content_libraries.edit_library_content', 'content_libraries.view_library'],
      scopeTypes: [SCOPE_TYPES.LIBRARY],
    }),
    buildCatalogRole('library_contributor', {
      displayName: 'Library Contributor',
      permissions: ['content_libraries.edit_library_content', 'content_libraries.view_library'],
      scopeTypes: [SCOPE_TYPES.LIBRARY],
    }),
    buildCatalogRole('library_user', {
      displayName: 'Library User',
      permissions: ['content_libraries.view_library'],
      scopeTypes: [SCOPE_TYPES.LIBRARY],
    }),
  ],
};

// The part of the `useAuthzCatalog` result its consumers read.
type AuthzCatalogResult = Pick<ReturnType<typeof useAuthzCatalog>, 'scopeTypes' | 'getScopeCatalog' | 'getRole' | 'isLoading' | 'isError'>;

interface MockAuthzCatalogOptions {
  catalog?: AuthzCatalog;
  // The scope types the user can view; the catalog's by default.
  scopeTypes?: string[];
  isLoading?: boolean;
  isError?: boolean;
}

/**
 * Makes `useAuthzCatalog` return `catalog`, limited to the scope types the user can view. Nothing is
 * loaded while `isLoading` or on `isError`. Each scope type's catalog is built once, with the real
 * `getScopeCatalog`, so it keeps its identity between renders as the hook's does.
 */
export const mockAuthzCatalog = ({
  catalog = authzCatalog, scopeTypes = catalog.scopeTypes, isLoading = false, isError = false,
}: MockAuthzCatalogOptions = {}) => {
  const loadedScopeTypes = isLoading || isError ? [] : scopeTypes;
  const scopeCatalogs = new Map(loadedScopeTypes.map((scopeType) => [scopeType, getScopeCatalog(catalog, scopeType)]));
  const loadedRoles = isLoading || isError ? [] : catalog.roles;

  // Typed as the hook's result, so the mock fails to compile if the hook's API changes.
  const result: AuthzCatalogResult = {
    isLoading,
    isError,
    scopeTypes: loadedScopeTypes,
    getScopeCatalog: (scopeType) => scopeCatalogs.get(scopeType),
    getRole: (roleId) => loadedRoles.find(({ role }) => role === roleId),
  };
  (useAuthzCatalog as jest.Mock).mockReturnValue(result);
};
