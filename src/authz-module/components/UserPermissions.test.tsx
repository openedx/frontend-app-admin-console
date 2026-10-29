import { screen } from '@testing-library/react';
import { renderWithAllProviders } from '@src/testUtils';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import {
  authzCatalog, buildCatalogCategory, buildCatalogPermission, buildCatalogRole, mockAuthzCatalog,
} from '@src/authz-module/catalog/testUtils';
import UserPermissions from './UserPermissions';

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
}));

const renderUserPermissions = (original: { role: string; scope: string }) => renderWithAllProviders(
  <UserPermissions row={{ original }} />,
);

describe('UserPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthzCatalog();
  });

  it('describes the Django managed roles', () => {
    const { container } = renderUserPermissions({ role: 'django.superuser', scope: 'lib:OpenedX:CSPROB' });

    expect(container).not.toBeEmptyDOMElement();
  });

  it('shows the permissions the role grants, grouped by category', async () => {
    renderUserPermissions({ role: 'library_user', scope: 'lib:OpenedX:CSPROB' });

    expect(await screen.findByRole('heading', { name: 'Library' })).toBeInTheDocument();
    expect(screen.getByText('content_libraries.view_library')).toBeInTheDocument();
    expect(screen.queryByText('content_libraries.edit_library_content')).not.toBeInTheDocument();
  });

  it('shows the permissions of the assignment scope type for a role in several scope types', async () => {
    mockAuthzCatalog({
      catalog: {
        scopeTypes: [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY],
        categories: [buildCatalogCategory('course'), buildCatalogCategory('library')],
        permissions: [
          buildCatalogPermission('courses.view_course_team', { categoryId: 'course', scopeTypes: [SCOPE_TYPES.COURSE] }),
          buildCatalogPermission('content_libraries.view_library_team', {
            categoryId: 'library', scopeTypes: [SCOPE_TYPES.LIBRARY],
          }),
        ],
        roles: [buildCatalogRole('team_viewer', {
          permissions: ['courses.view_course_team', 'content_libraries.view_library_team'],
          scopeTypes: [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY],
        })],
      },
    });

    renderUserPermissions({ role: 'team_viewer', scope: 'lib:OpenedX:CSPROB' });

    expect(await screen.findByText('content_libraries.view_library_team')).toBeInTheDocument();
    expect(screen.queryByText('courses.view_course_team')).not.toBeInTheDocument();
  });

  it('groups the permissions without a category under "Other"', async () => {
    mockAuthzCatalog({
      catalog: {
        ...authzCatalog,
        permissions: [
          ...authzCatalog.permissions,
          buildCatalogPermission('content_libraries.export_library', { scopeTypes: [SCOPE_TYPES.LIBRARY] }),
        ],
        roles: authzCatalog.roles.map((role) => (role.role === 'library_user'
          ? { ...role, permissions: [...role.permissions, 'content_libraries.export_library'] }
          : role)),
      },
    });

    renderUserPermissions({ role: 'library_user', scope: 'lib:OpenedX:CSPROB' });

    expect(await screen.findByRole('heading', { name: 'Other' })).toBeInTheDocument();
    expect(screen.getByText('content_libraries.export_library')).toBeInTheDocument();
  });

  it('splits the categories in two columns when there are more than three', async () => {
    const categoryIds = ['one', 'two', 'three', 'four'];
    mockAuthzCatalog({
      catalog: {
        scopeTypes: [SCOPE_TYPES.COURSE],
        categories: categoryIds.map((id) => buildCatalogCategory(id)),
        permissions: categoryIds.map((id) => buildCatalogPermission(`courses.${id}`, {
          categoryId: id, scopeTypes: [SCOPE_TYPES.COURSE],
        })),
        roles: [buildCatalogRole('course_admin', {
          permissions: categoryIds.map((id) => `courses.${id}`), scopeTypes: [SCOPE_TYPES.COURSE],
        })],
      },
    });

    renderUserPermissions({ role: 'course_admin', scope: 'course-v1:OpenedX+DemoX+Demo' });

    await screen.findByRole('heading', { name: 'one' });
    expect(screen.getAllByRole('list')).toHaveLength(4);
  });

  it('shows nothing for a role the catalog does not have', () => {
    const { container } = renderUserPermissions({ role: 'unknown_role', scope: 'lib:OpenedX:CSPROB' });

    expect(container).toBeEmptyDOMElement();
  });

  it('does not use a role from another scope type for the assignment', () => {
    const { container } = renderUserPermissions({
      role: 'library_admin', scope: 'course-v1:OpenedX+DemoX+2024',
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing while the catalog of the assignment scope type is not loaded', () => {
    mockAuthzCatalog({ isLoading: true });

    const { container } = renderUserPermissions({ role: 'library_user', scope: 'lib:OpenedX:CSPROB' });

    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing when the role has no permissions described in the catalog', () => {
    mockAuthzCatalog({
      catalog: {
        ...authzCatalog,
        roles: [buildCatalogRole('test_unlisted', {
          permissions: ['not_a_permission'], scopeTypes: [SCOPE_TYPES.COURSE],
        })],
      },
    });

    const { container } = renderUserPermissions({
      role: 'test_unlisted', scope: 'course-v1:OpenedX+DemoX+2024',
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing without a role', () => {
    const { container } = renderUserPermissions({ role: '', scope: 'lib:OpenedX:CSPROB' });

    expect(container).toBeEmptyDOMElement();
  });
});
