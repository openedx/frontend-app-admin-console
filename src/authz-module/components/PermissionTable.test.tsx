import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  buildCatalogCategory, buildCatalogPermission, buildCatalogRole,
} from '@src/authz-module/catalog/testUtils';
import type { MatrixCategory } from '@src/authz-module/roles-permissions';
import { renderWrapper } from '@src/testUtils';
import PermissionTable from './PermissionTable';

const roles = [
  buildCatalogRole('library_admin', { displayName: 'Library Admin' }),
  buildCatalogRole('library_author', { displayName: 'Library Author' }),
  buildCatalogRole('library_user', { displayName: 'Library User' }),
];

const matrix: MatrixCategory[] = [
  {
    category: buildCatalogCategory('library', { displayName: 'Library', description: 'Permissions related to the library.' }),
    permissions: [
      {
        permission: buildCatalogPermission('content_libraries.view_library', { displayName: 'View', description: 'See the library.' }),
        grantedTo: { library_admin: true, library_author: true, library_user: true },
      },
      {
        permission: buildCatalogPermission('content_libraries.delete_library', {
          displayName: 'Delete', description: 'Delete the library.',
        }),
        grantedTo: { library_admin: true, library_author: false, library_user: false },
      },
    ],
  },
  {
    category: buildCatalogCategory('library_team', { displayName: 'Team' }),
    permissions: [
      {
        permission: buildCatalogPermission('content_libraries.manage_library_team', { displayName: 'Manage' }),
        grantedTo: { library_admin: true, library_author: false, library_user: false },
      },
    ],
  },
];

const getPermissionRow = (displayName: string) => screen.getByText(displayName).closest('tr') as HTMLElement;

describe('PermissionTable', () => {
  it('shows the title and a column per role', () => {
    renderWrapper(<PermissionTable roles={roles} matrix={matrix} title="Library Roles" />);

    expect(screen.getByRole('columnheader', { name: 'Library Roles' })).toBeInTheDocument();
    roles.forEach(({ displayName }) => {
      expect(screen.getByRole('columnheader', { name: displayName })).toBeInTheDocument();
    });
  });

  it('shows each category with its permissions', () => {
    renderWrapper(<PermissionTable roles={roles} matrix={matrix} />);

    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Manage')).toBeInTheDocument();
  });

  it('marks which roles grant each permission', () => {
    renderWrapper(<PermissionTable roles={roles} matrix={matrix} />);

    const deleteRow = within(getPermissionRow('Delete'));
    expect(deleteRow.getByLabelText('Permission granted in Library Admin role')).toBeInTheDocument();
    expect(deleteRow.getByLabelText('Permission not granted in Library Author role')).toBeInTheDocument();
    expect(deleteRow.getByLabelText('Permission not granted in Library User role')).toBeInTheDocument();
  });

  it('describes a category and its permissions on its info icon', async () => {
    const user = userEvent.setup();
    renderWrapper(<PermissionTable roles={roles} matrix={matrix} />);

    // The info icon follows the category label.
    const infoIcon = screen.getByText('Library').parentElement?.nextElementSibling as HTMLElement;
    await user.hover(infoIcon);

    const popover = await screen.findByRole('tooltip');
    expect(within(popover).getByText('Permissions related to the library.')).toBeInTheDocument();
    expect(within(popover).getByText('See the library.')).toBeInTheDocument();
    expect(within(popover).getByText('Delete the library.')).toBeInTheDocument();
  });

  it('shows the categories without role columns when there are no roles', () => {
    renderWrapper(<PermissionTable roles={[]} matrix={matrix} />);

    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Library Admin' })).not.toBeInTheDocument();
  });

  it('shows the role columns when there are no permissions', () => {
    renderWrapper(<PermissionTable roles={roles} matrix={[]} />);

    roles.forEach(({ displayName }) => {
      expect(screen.getByRole('columnheader', { name: displayName })).toBeInTheDocument();
    });
  });
});
