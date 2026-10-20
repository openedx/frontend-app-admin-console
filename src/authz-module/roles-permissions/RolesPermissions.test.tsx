import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders } from '@src/testUtils';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import { mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import RolesPermissions from './RolesPermissions';

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
}));

jest.mock('../components/AnchorButton', () => function MockAnchorButton() {
  return <div data-testid="anchor-button" />;
});

const roleColumns = () => screen.getAllByRole('columnheader').slice(1).map(({ textContent }) => textContent);

describe('RolesPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthzCatalog();
  });

  it('shows a button per scope type the user can view, with courses active by default', async () => {
    renderWithAllProviders(<RolesPermissions />);

    const coursesButton = await screen.findByRole('button', { name: 'Courses' });
    expect(coursesButton).toHaveClass('btn-primary');
    expect(screen.getByRole('button', { name: 'Libraries' })).toHaveClass('btn-outline-primary');
    expect(screen.getByRole('columnheader', { name: 'Course Roles' })).toBeInTheDocument();
    expect(roleColumns()).toEqual(['Course Admin', 'Course Staff']);
  });

  it('switches to the matrix of the selected scope type', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<RolesPermissions />);

    await user.click(await screen.findByRole('button', { name: 'Libraries' }));

    expect(screen.getByRole('button', { name: 'Libraries' })).toHaveClass('btn-primary');
    expect(screen.getByRole('button', { name: 'Courses' })).toHaveClass('btn-outline-primary');
    expect(screen.getByRole('columnheader', { name: 'Library Roles' })).toBeInTheDocument();
  });

  it('orders the roles from most to fewest permissions', async () => {
    mockAuthzCatalog({ scopeTypes: [SCOPE_TYPES.LIBRARY] });
    renderWithAllProviders(<RolesPermissions />);

    await screen.findByRole('columnheader', { name: 'Library Roles' });

    expect(roleColumns()).toEqual(['Library Admin', 'Library Author', 'Library Contributor', 'Library User']);
  });

  it('shows only the scope type the user can view', async () => {
    mockAuthzCatalog({ scopeTypes: [SCOPE_TYPES.LIBRARY] });
    renderWithAllProviders(<RolesPermissions />);

    expect(await screen.findByRole('button', { name: 'Libraries' })).toHaveClass('btn-primary');
    expect(screen.queryByRole('button', { name: 'Courses' })).not.toBeInTheDocument();
    expect(screen.queryByText('Course Admin')).not.toBeInTheDocument();
  });

  it('shows the course roles note only for courses', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<RolesPermissions />);

    expect(await screen.findByText('See full documentation')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Libraries' }));

    expect(screen.queryByText('See full documentation')).not.toBeInTheDocument();
  });

  it('shows a loading indicator while the catalog loads', () => {
    mockAuthzCatalog({ isLoading: true });
    renderWithAllProviders(<RolesPermissions />);

    expect(screen.getByText('Loading roles and permissions')).toBeInTheDocument();
  });

  it('shows an error when the catalog cannot be loaded', async () => {
    mockAuthzCatalog({ isError: true });
    renderWithAllProviders(<RolesPermissions />);

    expect(await screen.findByText('The roles and permissions could not be loaded. Please try again later.')).toBeInTheDocument();
  });
});
