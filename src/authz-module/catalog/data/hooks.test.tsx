import { renderHook, waitFor } from '@testing-library/react';
import { usePermissions } from '@openedx/frontend-base';
import { createQueryClientWrapper, mockHttpClient } from '@src/testUtils';
import { SCOPE_TYPES, VIEW_TEAM_ACTIONS } from '@src/authz-module/constants';
import { CATALOG_PAGE_SIZE } from '../constants';
import { useAuthzCatalog } from './hooks';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedHttpClient: jest.fn(),
  usePermissions: jest.fn(),
}));

interface MockPermissionsOptions {
  course?: boolean;
  library?: boolean;
  isPermissionsPending?: boolean;
  isPermissionsError?: boolean;
}

const buildPermission = (id: string, scopeType: string) => ({
  id, display_name: id, description: '', icon: null, category_id: null, scope_types: [scopeType],
});

const buildRole = (role: string, permissions: string[], scopeType: string) => ({
  role, display_name: role, description: '', icon: null, definition_kind: 'static', permissions, scope_types: [scopeType],
});

const mockPermissions = ({
  course = false, library = false, isPermissionsPending = false, isPermissionsError = false,
}: MockPermissionsOptions = {}) => {
  jest.mocked(usePermissions<Record<'course-v1' | 'lib', { action: string }>>).mockReturnValue({
    [SCOPE_TYPES.COURSE]: course,
    [SCOPE_TYPES.LIBRARY]: library,
    isLoading: isPermissionsPending,
    isError: isPermissionsError,
    isPaused: false,
    error: isPermissionsError ? new Error('Permission validation failed') : null,
    isAuthzEnabled: true,
  });
};

const mockCatalogApi = () => {
  const get = jest.fn((url: URL) => Promise.resolve({
    data: {
      count: 0,
      next: null,
      previous: null,
      scope_types: url.searchParams.get('scope_types')?.split(','),
      categories: [],
      permissions: [
        buildPermission('courses.view_course', SCOPE_TYPES.COURSE),
        buildPermission('content_libraries.view_library', SCOPE_TYPES.LIBRARY),
      ],
      results: [
        buildRole('course_admin', ['courses.view_course'], SCOPE_TYPES.COURSE),
        buildRole('library_admin', ['content_libraries.view_library'], SCOPE_TYPES.LIBRARY),
      ],
    },
  }));
  mockHttpClient().mockReturnValue({ get });
  return { get };
};

const renderUseAuthzCatalog = () => renderHook(() => useAuthzCatalog(), { wrapper: createQueryClientWrapper() });

describe('useAuthzCatalog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the catalog of every scope type the user can view', async () => {
    mockPermissions({ course: true, library: true });
    mockCatalogApi();

    const { result } = renderUseAuthzCatalog();

    await waitFor(() => expect(result.current.scopeTypes).toEqual([SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY]));
    expect(usePermissions).toHaveBeenCalledWith({
      [SCOPE_TYPES.COURSE]: { action: VIEW_TEAM_ACTIONS[SCOPE_TYPES.COURSE] },
      [SCOPE_TYPES.LIBRARY]: { action: VIEW_TEAM_ACTIONS[SCOPE_TYPES.LIBRARY] },
    }, true);
  });

  it('fetches only the library catalog when the user can only view library teams', async () => {
    mockPermissions({ library: true });
    mockCatalogApi();

    const { result } = renderUseAuthzCatalog();

    await waitFor(() => expect(result.current.scopeTypes).toEqual([SCOPE_TYPES.LIBRARY]));
  });

  it('gives the catalog of each scope type the user can view', async () => {
    mockPermissions({ course: true, library: true });
    mockCatalogApi();

    const { result } = renderUseAuthzCatalog();

    await waitFor(() => expect(
      result.current.getScopeCatalog(SCOPE_TYPES.LIBRARY)?.roles.map(({ role }) => role),
    ).toEqual(['library_admin']));
    expect(result.current.getScopeCatalog(SCOPE_TYPES.COURSE)?.roles.map(({ role }) => role)).toEqual(['course_admin']);
  });

  it('finds a role by its id', async () => {
    mockPermissions({ course: true, library: true });
    mockCatalogApi();

    const { result } = renderUseAuthzCatalog();

    await waitFor(() => expect(result.current.getRole('library_admin')?.permissions).toEqual([
      'content_libraries.view_library',
    ]));
    expect(result.current.getRole('course_admin')?.permissions).toEqual(['courses.view_course']);
  });

  it('finds no role the catalog does not describe', async () => {
    mockPermissions({ library: true });
    mockCatalogApi();

    const { result } = renderUseAuthzCatalog();
    await waitFor(() => expect(result.current.getRole('library_admin')).toBeDefined());

    expect(result.current.getRole('unknown_role')).toBeUndefined();
  });

  it('keeps the same scope type catalog between renders', async () => {
    mockPermissions({ library: true });
    mockCatalogApi();

    const { result, rerender } = renderUseAuthzCatalog();
    await waitFor(() => expect(result.current.getScopeCatalog(SCOPE_TYPES.LIBRARY)).toBeDefined());
    const libraryCatalog = result.current.getScopeCatalog(SCOPE_TYPES.LIBRARY);

    rerender();

    expect(result.current.getScopeCatalog(SCOPE_TYPES.LIBRARY)).toBe(libraryCatalog);
  });

  it('is loading while the view permissions are being resolved', () => {
    mockPermissions({ isPermissionsPending: true });
    const { get } = mockCatalogApi();

    const { result } = renderUseAuthzCatalog();

    expect(result.current.isLoading).toBe(true);
    expect(get).not.toHaveBeenCalled();
  });

  it('does not fetch a catalog when the user cannot view any team', async () => {
    mockPermissions();
    const { get } = mockCatalogApi();

    const { result } = renderUseAuthzCatalog();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.scopeTypes).toEqual([]);
    expect(result.current.getScopeCatalog(SCOPE_TYPES.LIBRARY)).toBeUndefined();
    expect(get).not.toHaveBeenCalled();
  });

  it('exposes permission validation errors without fetching the catalog', () => {
    mockPermissions({ isPermissionsError: true });
    const { get } = mockCatalogApi();

    const { result } = renderUseAuthzCatalog();

    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toBe('Permission validation failed');
    expect(get).not.toHaveBeenCalled();
  });

  it('lists the roles of every page, in order, when they do not fit in one page', async () => {
    mockPermissions({ library: true });
    // Three pages of roles, one role in each.
    const get = jest.fn((url: URL) => {
      const page = Number(url.searchParams.get('page'));
      return Promise.resolve({
        data: {
          count: CATALOG_PAGE_SIZE * 2 + 1,
          next: page < 3 ? 'next-page' : null,
          previous: null,
          scope_types: [SCOPE_TYPES.LIBRARY],
          categories: [],
          permissions: [],
          results: [{
            role: `role_page_${page}`, display_name: '', description: '', icon: null, definition_kind: 'static', permissions: [], scope_types: [SCOPE_TYPES.LIBRARY],
          }],
        },
      });
    });
    mockHttpClient().mockReturnValue({ get });

    const { result } = renderUseAuthzCatalog();

    await waitFor(() => expect(
      result.current.data?.roles.map(({ role }) => role),
    ).toEqual(['role_page_1', 'role_page_2', 'role_page_3']));
  });
});
