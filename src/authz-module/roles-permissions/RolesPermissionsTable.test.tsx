import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders } from '@src/testUtils';
import { SCOPE_TYPES, TABLE_DEFAULT_PAGE_SIZE } from '@src/authz-module/constants';
import { buildCatalogRole } from '@src/authz-module/catalog/testUtils';
import { useCatalogRoles } from '@src/authz-module/catalog/data/hooks';
import type { GetAuthzCatalogResponse, RolesQueryParams } from '@src/authz-module/catalog';
import { useViewTeamPermissions } from '@src/authz-module/hooks/useViewTeamPermissions';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import RolesPermissionsTable from './RolesPermissionsTable';

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
  useCatalogRoles: jest.fn(),
}));

jest.mock('@src/authz-module/hooks/useViewTeamPermissions', () => ({
  useViewTeamPermissions: jest.fn(),
}));

const mockUseCatalogRoles = useCatalogRoles as jest.Mock;
const mockUseViewTeamPermissions = useViewTeamPermissions as jest.Mock;

const ALL_SCOPE_TYPES = [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY];
// The table debounces its state changes before they reach the request, as the team members table does.
const DEBOUNCE_MS = 500;

const roles = [
  buildCatalogRole('course_admin', {
    displayName: 'Course Admin',
    permissions: ['courses.edit_course_content', 'courses.manage_course_team', 'courses.view_course'],
    scopeTypes: [SCOPE_TYPES.COURSE],
    userCount: 5,
  }),
  buildCatalogRole('library_reviewer', {
    displayName: 'Library reviewer',
    definitionKind: 'user_defined',
    permissions: ['content_libraries.view_library'],
    scopeTypes: [SCOPE_TYPES.LIBRARY],
    userCount: 12,
    updatedAt: '2026-10-20T14:30:00',
  }),
];

const buildPage = (overrides: Partial<GetAuthzCatalogResponse> = {}): GetAuthzCatalogResponse => ({
  count: roles.length,
  next: null,
  previous: null,
  scopeTypes: ALL_SCOPE_TYPES,
  categories: [],
  permissions: [],
  results: roles,
  ...overrides,
});

const mockRolesPage = (overrides: Record<string, unknown> = {}) => {
  mockUseCatalogRoles.mockReturnValue({
    data: buildPage(), isLoading: false, error: null, refetch: jest.fn(), ...overrides,
  });
};

const mockViewPermissions = (overrides: Partial<ReturnType<typeof useViewTeamPermissions>> = {}) => {
  mockUseViewTeamPermissions.mockReturnValue({
    isCourseViewAllowed: true, isLibraryViewAllowed: true, isLoading: false, ...overrides,
  });
};

const renderTable = () => renderWithAllProviders(
  <ToastManagerProvider>
    <RolesPermissionsTable />
  </ToastManagerProvider>,
);

const requestedParams = (): RolesQueryParams => mockUseCatalogRoles.mock.lastCall[0];
const isRequestEnabled = (): boolean => mockUseCatalogRoles.mock.lastCall[1];
const getRow = (roleName: string) => screen.getByText(roleName).closest('tr') as HTMLElement;
const getHeader = (title: string) => screen.getAllByRole('columnheader')
  .find(({ textContent }) => textContent?.trim() === title) as HTMLElement;
const waitForDebounce = () => act(() => {
  jest.advanceTimersByTime(DEBOUNCE_MS);
});

describe('RolesPermissionsTable', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockViewPermissions();
    mockRolesPage();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('renders the columns from the design', () => {
      renderTable();

      const headers = screen.getAllByRole('columnheader').map(({ textContent }) => textContent);
      expect(headers).toEqual(['Role', 'Type of resource', 'Members', 'Permissions', 'Last updated', 'Actions']);
    });

    it('shows each role of the page with its members, permission count and update time', () => {
      renderTable();

      const courseAdmin = within(getRow('Course Admin'));
      expect(courseAdmin.getByText('Courses')).toBeInTheDocument();
      expect(courseAdmin.getByText('5')).toBeInTheDocument();
      expect(courseAdmin.getByText('3 Granted')).toBeInTheDocument();
      expect(courseAdmin.getByText('-')).toBeInTheDocument();

      const reviewer = within(getRow('Library reviewer'));
      expect(reviewer.getByText('Libraries')).toBeInTheDocument();
      expect(reviewer.getByText('12')).toBeInTheDocument();
      expect(reviewer.getByText('1 Granted')).toBeInTheDocument();
      expect(reviewer.getByText(/10\/20\/2026/)).toBeInTheDocument();
    });

    it('lists the rows in the order the server returned them', () => {
      mockRolesPage({ data: buildPage({ results: [...roles].reverse() }) });
      renderTable();

      const names = screen.getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent);
      expect(names).toEqual(['Library reviewerCustom Role', 'Course Admin']);
    });

    it('marks custom roles and gives them the edit action, standard roles the view action', () => {
      renderTable();

      const reviewer = within(getRow('Library reviewer'));
      expect(reviewer.getByText('Custom Role')).toBeInTheDocument();
      expect(reviewer.getByRole('button', { name: 'Edit role' })).toBeInTheDocument();

      const courseAdmin = within(getRow('Course Admin'));
      expect(courseAdmin.queryByText('Custom Role')).not.toBeInTheDocument();
      expect(courseAdmin.getByRole('button', { name: 'View role' })).toBeInTheDocument();
    });

    it('shows a pill for each resource type of a role', () => {
      mockRolesPage({
        data: buildPage({
          count: 1,
          results: [buildCatalogRole('shared_role', { displayName: 'Shared role', scopeTypes: ALL_SCOPE_TYPES })],
        }),
      });
      renderTable();

      const row = within(getRow('Shared role'));
      expect(row.getByText('Courses')).toBeInTheDocument();
      expect(row.getByText('Libraries')).toBeInTheDocument();
    });

    it('counts the shown roles out of the server total', () => {
      mockRolesPage({ data: buildPage({ count: 25 }) });
      renderTable();

      expect(screen.getAllByText('Showing 2 roles of 25.')).toHaveLength(2);
    });

    it('shows the empty state when no role matches', () => {
      mockRolesPage({ data: buildPage({ count: 0, results: [] }) });
      renderTable();

      expect(screen.getByText('No roles found.')).toBeInTheDocument();
    });
  });

  describe('request', () => {
    it('asks for the first page of every viewable scope type, with the endpoint default sort', () => {
      renderTable();

      expect(requestedParams()).toEqual({
        scopeTypes: ALL_SCOPE_TYPES,
        search: null,
        sortBy: null,
        order: null,
        pageIndex: 0,
        pageSize: TABLE_DEFAULT_PAGE_SIZE,
      });
      expect(isRequestEnabled()).toBe(true);
    });

    it('asks only for the scope types the user can view', () => {
      mockViewPermissions({ isCourseViewAllowed: false });
      renderTable();

      expect(requestedParams().scopeTypes).toEqual([SCOPE_TYPES.LIBRARY]);
    });

    it('waits for the view permissions before fetching', () => {
      mockViewPermissions({ isCourseViewAllowed: false, isLibraryViewAllowed: false, isLoading: true });
      renderTable();

      expect(isRequestEnabled()).toBe(false);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('searches once the user stops typing', async () => {
      renderTable();

      await user.type(screen.getByPlaceholderText('Search'), 'admin');
      expect(requestedParams().search).toBeNull();

      await waitForDebounce();

      expect(requestedParams()).toMatchObject({ search: 'admin', pageIndex: 0 });
    });

    it.each([
      ['Role', 'display_name'],
      ['Type of resource', 'scope_type'],
      ['Members', 'user_count'],
      ['Last updated', 'updated_at'],
    ])('sorts by the %s column, then reverses the order', async (title, sortBy) => {
      renderTable();

      await user.click(getHeader(title));
      await waitForDebounce();
      expect(requestedParams()).toMatchObject({ sortBy, order: 'asc' });

      await user.click(getHeader(title));
      await waitForDebounce();
      expect(requestedParams()).toMatchObject({ sortBy, order: 'desc' });
    });

    it('does not sort by permissions', async () => {
      renderTable();

      await user.click(getHeader('Permissions'));
      await waitForDebounce();

      expect(requestedParams()).toMatchObject({ sortBy: null, order: null });
    });

    it('filters by the chosen resource type, and by every one once the chip is removed', async () => {
      renderTable();

      await user.click(screen.getByRole('button', { name: /Type of resource/ }));
      // The menu ignores clicks until it finishes opening, which runs on the faked timers.
      await act(async () => {
        await jest.runOnlyPendingTimersAsync();
      });
      await user.click(screen.getByRole('checkbox', { name: 'Courses' }));
      await waitForDebounce();
      expect(requestedParams().scopeTypes).toEqual([SCOPE_TYPES.COURSE]);
      expect(screen.getByText('Filtered by:')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Remove Courses filter' }));
      await waitForDebounce();

      expect(requestedParams().scopeTypes).toEqual(ALL_SCOPE_TYPES);
      expect(screen.queryByText('Filtered by:')).not.toBeInTheDocument();
    });

    it('offers only the resource types the user can view', async () => {
      mockViewPermissions({ isCourseViewAllowed: false });
      renderTable();

      await user.click(screen.getByRole('button', { name: /Type of resource/ }));

      expect(screen.getByRole('checkbox', { name: 'Libraries' })).toBeInTheDocument();
      expect(screen.queryByRole('checkbox', { name: 'Courses' })).not.toBeInTheDocument();
    });

    it('moves to the next page, and back to the first one on a new search', async () => {
      mockRolesPage({ data: buildPage({ count: 25 }) });
      renderTable();

      await user.click(screen.getByRole('button', { name: 'Next, Page 2' }));
      await waitForDebounce();
      expect(requestedParams().pageIndex).toBe(1);

      await user.type(screen.getByPlaceholderText('Search'), 'admin');
      await waitForDebounce();

      expect(requestedParams()).toMatchObject({ search: 'admin', pageIndex: 0 });
    });
  });

  describe('loading and errors', () => {
    it('shows the loading state while the page loads, keeping the controls', () => {
      mockRolesPage({ data: undefined, isLoading: true });
      renderTable();

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });

    it('keeps the previous rows under the loading state while the next page loads', () => {
      mockRolesPage({ isPlaceholderData: true });
      renderTable();

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Course Admin')).toBeInTheDocument();
    });

    it('shows no loading state once the page has loaded', () => {
      renderTable();

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('reports a failed page once, with a toast', () => {
      const error = new Error('Boom');
      mockRolesPage({ data: undefined, error });
      const { rerender } = renderTable();

      rerender(
        <ToastManagerProvider>
          <RolesPermissionsTable />
        </ToastManagerProvider>,
      );

      expect(screen.getAllByText(/Something went wrong on our end./)).toHaveLength(1);
    });

    // An empty table would otherwise claim that no role matched.
    it('says the roles could not be loaded when there is no page to show', () => {
      mockRolesPage({ data: undefined, error: new Error('Boom') });
      renderTable();

      expect(screen.getByText('The roles and permissions could not be loaded. Please try again later.')).toBeInTheDocument();
      expect(screen.queryByText('No roles found.')).not.toBeInTheDocument();
    });

    it('keeps showing the loaded page when refreshing it fails', () => {
      mockRolesPage({ error: new Error('Boom') });
      renderTable();

      expect(screen.getByText('Course Admin')).toBeInTheDocument();
      expect(screen.queryByText('The roles and permissions could not be loaded. Please try again later.')).not.toBeInTheDocument();
    });
  });
});
