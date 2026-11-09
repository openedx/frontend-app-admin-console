import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders } from '@src/testUtils';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import { authzCatalog, mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import { getScopeCatalog } from '@src/authz-module/catalog/utils';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import RolesFilter from './RolesFilter';

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
}));

jest.mock('@src/authz-module/hooks/useCourseAuthoringFlag', () => ({
  useCourseAuthoringFlag: jest.fn(),
}));

const mockUseCourseAuthoringFlag = useCourseAuthoringFlag as jest.Mock;

describe('RolesFilter', () => {
  const defaultProps = {
    filterButtonText: 'Roles',
    filterValue: [],
    setFilter: jest.fn(),
    disabled: false,
  };

  const openDropdown = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: /Roles/i }));
    return within(await screen.findByRole('group', { name: 'Roles' }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthzCatalog();
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: true,
      isCourseEnabled: () => true,
      isLoading: false,
    });
  });

  it('renders the filter toggle', () => {
    renderWithAllProviders(<RolesFilter {...defaultProps} />);
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    renderWithAllProviders(<RolesFilter {...defaultProps} disabled />);
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('displays filter button text', () => {
    renderWithAllProviders(<RolesFilter {...defaultProps} filterButtonText="Select Roles" />);
    expect(screen.getByText('Select Roles')).toBeInTheDocument();
  });

  it('calls setFilter with the selected role when a role is checked', async () => {
    const user = userEvent.setup();
    const setFilter = jest.fn();
    renderWithAllProviders(<RolesFilter {...defaultProps} setFilter={setFilter} />);
    const menu = await openDropdown(user);
    await user.click(await menu.findByLabelText('Course Admin'));
    expect(setFilter).toHaveBeenCalledWith(
      ['course_admin'],
      expect.objectContaining({ value: 'course_admin', displayName: 'Course Admin' }),
    );
  });

  it('shows only the roles of the scope types the user can view', async () => {
    const user = userEvent.setup();
    // The catalog only returns the metadata of the scope types the user can view, so a user who
    // can only view library teams gets only the library roles.
    mockAuthzCatalog({ scopeTypes: [SCOPE_TYPES.LIBRARY] });
    renderWithAllProviders(<RolesFilter {...defaultProps} />);
    const menu = await openDropdown(user);
    expect(await menu.findByText('Libraries')).toBeInTheDocument();
    expect(menu.queryByText('Courses')).not.toBeInTheDocument();

    getScopeCatalog(authzCatalog, SCOPE_TYPES.LIBRARY).roles.forEach(({ displayName }) => {
      expect(menu.getByLabelText(displayName)).toBeInTheDocument();
    });
    getScopeCatalog(authzCatalog, SCOPE_TYPES.COURSE).roles.forEach(({ displayName }) => {
      expect(menu.queryByLabelText(displayName)).not.toBeInTheDocument();
    });
  });

  it('shows both course and library roles when the user can view both scopes', async () => {
    const user = userEvent.setup();
    renderWithAllProviders(<RolesFilter {...defaultProps} />);
    const menu = await openDropdown(user);
    expect(await menu.findByText('Courses')).toBeInTheDocument();
    expect(menu.getByText('Libraries')).toBeInTheDocument();
  });

  it('lists the roles of each scope type in the catalog order', async () => {
    const user = userEvent.setup();
    mockAuthzCatalog({ scopeTypes: [SCOPE_TYPES.LIBRARY] });
    renderWithAllProviders(<RolesFilter {...defaultProps} />);
    const menu = await openDropdown(user);
    await menu.findByLabelText('Library Admin');

    const catalogRoles = getScopeCatalog(authzCatalog, SCOPE_TYPES.LIBRARY).roles;
    expect(menu.getAllByRole('checkbox').map((checkbox) => checkbox.getAttribute('aria-label')))
      .toEqual(catalogRoles.map(({ displayName }) => displayName));
  });

  it('shows no role options when the user cannot view any scope', async () => {
    const user = userEvent.setup();
    mockAuthzCatalog({ scopeTypes: [] });
    renderWithAllProviders(<RolesFilter {...defaultProps} />);
    const menu = await openDropdown(user);
    expect(menu.queryByText('Courses')).not.toBeInTheDocument();
    expect(menu.queryByText('Libraries')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows no role options while the catalog is still loading', async () => {
    const user = userEvent.setup();
    mockAuthzCatalog({ isLoading: true });
    renderWithAllProviders(<RolesFilter {...defaultProps} />);
    const menu = await openDropdown(user);
    expect(menu.queryByText('Courses')).not.toBeInTheDocument();
    expect(menu.queryByText('Libraries')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('explains a catalog failure instead of showing an empty list', async () => {
    const user = userEvent.setup();
    mockAuthzCatalog({ isError: true });
    renderWithAllProviders(<RolesFilter {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: 'Roles' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Roles could not be loaded. Please try again later.');
    expect(screen.queryByText('Showing 0 of 0.')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('restores the selected roles when the catalog recovers', async () => {
    const user = userEvent.setup();
    const props = { ...defaultProps, filterValue: ['library_admin'] };
    mockAuthzCatalog({ isError: true });
    const { rerender } = renderWithAllProviders(<RolesFilter {...props} />);
    await user.click(screen.getByRole('button', { name: 'Roles (1)' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    mockAuthzCatalog();
    rerender(<RolesFilter {...props} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Library Admin' })).toBeChecked();
  });

  it('hides course roles when the course-authoring flag is disabled', async () => {
    const user = userEvent.setup();
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: false,
      isCourseEnabled: () => false,
      isLoading: false,
    });
    renderWithAllProviders(<RolesFilter {...defaultProps} />);
    const menu = await openDropdown(user);
    expect(await menu.findByText('Libraries')).toBeInTheDocument();
    expect(menu.queryByText('Courses')).not.toBeInTheDocument();
    expect(menu.queryByLabelText('Course Admin')).not.toBeInTheDocument();
  });

  it('shows no role options while the course-authoring flag is still loading', async () => {
    const user = userEvent.setup();
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: false,
      isCourseEnabled: () => false,
      isLoading: true,
    });
    renderWithAllProviders(<RolesFilter {...defaultProps} />);
    const menu = await openDropdown(user);
    expect(menu.queryByText('Courses')).not.toBeInTheDocument();
    expect(menu.queryByText('Libraries')).not.toBeInTheDocument();
  });
});
