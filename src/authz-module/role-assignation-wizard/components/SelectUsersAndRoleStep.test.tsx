import { screen } from '@testing-library/react';
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

const groupHeaders = () => Array.from(document.querySelectorAll('.role-group-header')).map(({ textContent }) => textContent);

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

  it('renders roles section heading', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} />);
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('renders library roles under Libraries group', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} roleGroups={[libraryGroup]} />);
    expect(screen.getByText('Libraries')).toBeInTheDocument();
    expect(screen.getByText('Library Admin')).toBeInTheDocument();
    expect(screen.getByText('Can manage the library.')).toBeInTheDocument();
  });

  it('renders course roles under Courses group', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} roleGroups={[courseGroup]} />);
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Course Admin')).toBeInTheDocument();
  });

  it('renders the role groups in the given scope type order', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} />);
    expect(groupHeaders()).toEqual(['Courses', 'Libraries']);
  });

  it('leaves out the scope types without roles', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} roleGroups={[courseGroup, { ...libraryGroup, roles: [] }]} />);
    expect(groupHeaders()).toEqual(['Courses']);
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

  it('selects a role offered in several scope types only in the selected one', () => {
    const teamViewer = buildCatalogRole('team_viewer', {
      displayName: 'Team Viewer', scopeTypes: [SCOPE_TYPES.COURSE, SCOPE_TYPES.LIBRARY],
    });
    renderWrapper(
      <SelectUsersAndRoleStep
        {...defaultProps}
        roleGroups={[
          { scopeType: SCOPE_TYPES.COURSE, roles: [teamViewer] },
          { scopeType: SCOPE_TYPES.LIBRARY, roles: [teamViewer] },
        ]}
        selectedRole={{ scopeType: SCOPE_TYPES.LIBRARY, role: 'team_viewer' }}
      />,
    );
    const [courseRadio, libraryRadio] = screen.getAllByRole('radio', { name: /Team Viewer/i });
    expect(courseRadio).not.toBeChecked();
    expect(libraryRadio).toBeChecked();
  });

  it('renders documentation link', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} />);
    expect(screen.getByRole('link', { name: /View roles managed in LMS and Django Admin/i })).toBeInTheDocument();
  });

  it('documentation link points to the admin URL', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} />);
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
