import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from '@src/authz-module/roles-permissions';
import RolesFilter from './RolesFilter';

jest.mock('@src/data/hooks', () => ({
  useValidateUserPermissionsNonSuspense: jest.fn(),
}));

const mockUsePermissions = useValidateUserPermissionsNonSuspense as jest.Mock;

const permissionsData = ({ library, course }: { library?: boolean; course?: boolean }) => [
  { action: CONTENT_LIBRARY_PERMISSIONS.VIEW_LIBRARY_TEAM, allowed: !!library },
  { action: CONTENT_COURSE_PERMISSIONS.VIEW_COURSE_TEAM, allowed: !!course },
];

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
    mockUsePermissions.mockReturnValue({ data: permissionsData({ library: true, course: true }) });
  });

  it('renders the filter toggle', () => {
    renderWrapper(<RolesFilter {...defaultProps} />);
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    renderWrapper(<RolesFilter {...defaultProps} disabled />);
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('displays filter button text', () => {
    renderWrapper(<RolesFilter {...defaultProps} filterButtonText="Select Roles" />);
    expect(screen.getByText('Select Roles')).toBeInTheDocument();
  });

  it('calls setFilter with the selected role when a role is checked', async () => {
    const user = userEvent.setup();
    const setFilter = jest.fn();
    renderWrapper(<RolesFilter {...defaultProps} setFilter={setFilter} />);
    const menu = await openDropdown(user);
    await user.click(menu.getByLabelText('Course Admin'));
    expect(setFilter).toHaveBeenCalledWith(
      ['course_admin'],
      expect.objectContaining({ value: 'course_admin', displayName: 'Course Admin' }),
    );
  });

  it('shows only library roles when the user can view the library scope only', async () => {
    const user = userEvent.setup();
    mockUsePermissions.mockReturnValue({ data: permissionsData({ library: true }) });
    renderWrapper(<RolesFilter {...defaultProps} />);
    const menu = await openDropdown(user);
    expect(menu.getByText('Libraries')).toBeInTheDocument();
    expect(menu.getByLabelText('Library Admin')).toBeInTheDocument();
    expect(menu.queryByText('Courses')).not.toBeInTheDocument();
    expect(menu.queryByLabelText('Course Admin')).not.toBeInTheDocument();
  });

  it('shows both course and library roles when the user can view both scopes', async () => {
    const user = userEvent.setup();
    renderWrapper(<RolesFilter {...defaultProps} />);
    const menu = await openDropdown(user);
    expect(menu.getByText('Courses')).toBeInTheDocument();
    expect(menu.getByText('Libraries')).toBeInTheDocument();
  });

  it('shows no role options when the user cannot view any scope', async () => {
    const user = userEvent.setup();
    mockUsePermissions.mockReturnValue({ data: permissionsData({}) });
    renderWrapper(<RolesFilter {...defaultProps} />);
    const menu = await openDropdown(user);
    expect(menu.queryByText('Courses')).not.toBeInTheDocument();
    expect(menu.queryByText('Libraries')).not.toBeInTheDocument();
  });

  it('shows no role options while permissions are still loading', async () => {
    const user = userEvent.setup();
    mockUsePermissions.mockReturnValue({ data: undefined, isLoading: true });
    renderWrapper(<RolesFilter {...defaultProps} />);
    const menu = await openDropdown(user);
    expect(menu.queryByText('Courses')).not.toBeInTheDocument();
    expect(menu.queryByText('Libraries')).not.toBeInTheDocument();
  });
});
