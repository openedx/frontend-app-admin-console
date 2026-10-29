import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import { buildCatalogRole } from '@src/authz-module/catalog/testUtils';
import { renderWrapper } from '@src/testUtils';
import SelectUsersAndRoleStep from './SelectUsersAndRoleStep';

const courseGroup = {
  scopeType: SCOPE_TYPES.COURSE,
  roles: [buildCatalogRole('course_admin', {
    displayName: 'Course Admin', description: 'Can manage the course team.', scopeTypes: [SCOPE_TYPES.COURSE],
  })],
};

const libraryGroup = {
  scopeType: SCOPE_TYPES.LIBRARY,
  roles: [buildCatalogRole('library_admin', {
    displayName: 'Library Admin', description: 'Can manage the library.', scopeTypes: [SCOPE_TYPES.LIBRARY],
  })],
};

const defaultProps = {
  users: '',
  setUsers: jest.fn(),
  selectedRole: null,
  setSelectedRole: jest.fn(),
  roleGroups: [courseGroup, libraryGroup],
  invalidUsers: [],
};

const roleGroup = (name: string) => screen.getByRole('group', { name });

describe('SelectUsersAndRoleStep', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the users input section', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows hint text when no invalid users', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} />);
    expect(screen.getByText('The user must already have an account.')).toBeInTheDocument();
  });

  it('shows invalid user count error when there are invalid users', () => {
    renderWrapper(
      <SelectUsersAndRoleStep {...defaultProps} invalidUsers={['baduser']} />,
    );
    expect(
      screen.getByText(/not associated with an account/i),
    ).toBeInTheDocument();
  });

  it('offers the roles of every scope type as a single required choice', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} />);
    const roles = screen.getByRole('radiogroup', { name: 'Roles' });
    expect(screen.getAllByRole('radiogroup')).toEqual([roles]);
    expect(roles).toHaveAttribute('aria-required', 'true');
    expect(within(roles).getAllByRole('radio')).toHaveLength(2);
  });

  it('renders library roles under Libraries group', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} roleGroups={[libraryGroup]} />);
    expect(within(roleGroup('Libraries')).getByRole('radio', { name: /Library Admin/ })).toBeInTheDocument();
    expect(screen.getByText('Can manage the library.')).toBeInTheDocument();
  });

  it('renders course roles under Courses group', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} roleGroups={[courseGroup]} />);
    expect(within(roleGroup('Courses')).getByRole('radio', { name: /Course Admin/ })).toBeInTheDocument();
  });

  it('renders the role groups in the given scope type order', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} />);
    expect(screen.getAllByRole('group')).toEqual([roleGroup('Courses'), roleGroup('Libraries')]);
  });

  it('leaves out the scope types without roles', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} roleGroups={[courseGroup, { ...libraryGroup, roles: [] }]} />);
    expect(screen.getAllByRole('group')).toEqual([roleGroup('Courses')]);
  });

  it('announces that the roles are loading', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} roleGroups={[]} isLoadingRoles />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading roles...');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('alerts that the roles could not be loaded', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} roleGroups={[]} isRolesError />);
    expect(screen.getByRole('alert')).toHaveTextContent('The roles could not be loaded. Please try again later.');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('calls setSelectedRole when a role radio is selected', async () => {
    const user = userEvent.setup();
    const setSelectedRole = jest.fn();
    renderWrapper(
      <SelectUsersAndRoleStep
        {...defaultProps}
        setSelectedRole={setSelectedRole}
      />,
    );
    const radio = screen.getByRole('radio', { name: /Library Admin/i });
    await user.click(radio);
    expect(setSelectedRole).toHaveBeenCalledWith({ scopeType: SCOPE_TYPES.LIBRARY, role: 'library_admin' });
  });

  it('renders the roles managed outside the wizard, pointing to the Django admin', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} />);
    expect(screen.getByText(/Some roles are managed outside this console/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /View roles managed in LMS and Django Admin/i });
    expect(link).toHaveAttribute('href', 'http://localhost:8000/admin');
  });

  it('calls setUsers when typing in the textarea', async () => {
    const user = userEvent.setup();
    const setUsers = jest.fn();
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} setUsers={setUsers} />);
    await user.type(screen.getByRole('textbox'), 'alice');
    expect(setUsers).toHaveBeenCalled();
  });
});
