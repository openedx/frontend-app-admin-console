import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders } from '@src/testUtils';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import { authzCatalog, buildCatalogRole, mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import RolesPermissionsTable from './RolesPermissionsTable';

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
}));

const catalogWithCustomRole = {
  ...authzCatalog,
  roles: [
    ...authzCatalog.roles,
    buildCatalogRole('library_reviewer', {
      displayName: 'Library reviewer',
      definitionKind: 'user_defined',
      permissions: ['content_libraries.view_library'],
      scopeTypes: [SCOPE_TYPES.LIBRARY],
    }),
  ],
};

const getRow = (roleName: string) => screen.getByText(roleName).closest('tr') as HTMLElement;
const roleNames = () => screen.getAllByRole('row').slice(1)
  .map((row) => within(row).getAllByRole('cell')[0].querySelector('span')?.textContent);

describe('RolesPermissionsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthzCatalog({ catalog: catalogWithCustomRole });
  });

  it('renders the columns from the design', () => {
    renderWithAllProviders(<RolesPermissionsTable />);

    const headers = screen.getAllByRole('columnheader').map(({ textContent }) => textContent);
    expect(headers).toEqual(['Role', 'Type of resource', 'Members', 'Permissions', 'Last updated', 'Actions']);
  });

  it('lists the catalog roles of every viewable scope type with their permission count', () => {
    renderWithAllProviders(<RolesPermissionsTable />);

    expect(roleNames()).toEqual([
      'Course Admin', 'Course Staff', 'Library Admin', 'Library Author', 'Library Contributor', 'Library User',
      'Library reviewer',
    ]);
    const courseAdmin = within(getRow('Course Admin'));
    expect(courseAdmin.getByText('Courses')).toBeInTheDocument();
    expect(courseAdmin.getByText('3 Granted')).toBeInTheDocument();
    expect(screen.getAllByText('Showing 7 roles of 7.')).toHaveLength(2);
  });

  it('marks custom roles and gives them the edit action, standard roles the view action', () => {
    renderWithAllProviders(<RolesPermissionsTable />);

    const customRow = within(getRow('Library reviewer'));
    expect(customRow.getByText('Custom Role')).toBeInTheDocument();
    expect(customRow.getByRole('button', { name: 'Edit role' })).toBeInTheDocument();

    const standardRow = within(getRow('Library Admin'));
    expect(standardRow.queryByText('Custom Role')).not.toBeInTheDocument();
    expect(standardRow.getByRole('button', { name: 'View role' })).toBeInTheDocument();
    expect(standardRow.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
  });

  it('only lists the scope types the user can view', () => {
    mockAuthzCatalog({ catalog: catalogWithCustomRole, scopeTypes: [SCOPE_TYPES.LIBRARY] });
    renderWithAllProviders(<RolesPermissionsTable />);

    expect(screen.queryByText('Course Admin')).not.toBeInTheDocument();
    expect(screen.getByText('Library Admin')).toBeInTheDocument();
  });

  it('searches roles by name', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<RolesPermissionsTable />);

    await user.type(screen.getByPlaceholderText('Search'), 'staff');

    expect(roleNames()).toEqual(['Course Staff']);
  });

  it('filters by type of resource and shows the applied filter as a removable chip', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<RolesPermissionsTable />);

    await user.click(screen.getByRole('button', { name: /Type of resource/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Courses' }));

    expect(roleNames()).toEqual(['Course Admin', 'Course Staff']);
    expect(screen.getByText('Filtered by:')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Courses filter' }));

    expect(screen.queryByText('Filtered by:')).not.toBeInTheDocument();
    expect(roleNames()).toHaveLength(7);
  });

  it('shows an empty state when no role matches', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<RolesPermissionsTable />);

    await user.type(screen.getByPlaceholderText('Search'), 'nonexistent');

    expect(screen.getByText('No roles found.')).toBeInTheDocument();
  });

  it('shows a loading indicator while the catalog loads', () => {
    mockAuthzCatalog({ isLoading: true });
    renderWithAllProviders(<RolesPermissionsTable />);

    expect(screen.getByText('Loading roles and permissions')).toBeInTheDocument();
  });

  it('shows an error when the catalog cannot be loaded', () => {
    mockAuthzCatalog({ isError: true });
    renderWithAllProviders(<RolesPermissionsTable />);

    expect(screen.getByText('The roles and permissions could not be loaded. Please try again later.')).toBeInTheDocument();
  });
});
