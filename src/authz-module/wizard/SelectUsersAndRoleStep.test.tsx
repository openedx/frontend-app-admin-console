import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import SelectUsersAndRoleStep from './SelectUsersAndRoleStep';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({ LMS_BASE_URL: 'http://localhost:8000' }),
}));

const libraryRole = {
  role: 'library_admin',
  name: 'Library Admin',
  description: 'Can manage the library.',
  contextType: 'library',
};

const courseRole = {
  role: 'course_admin',
  name: 'Course Admin',
  description: 'Can manage the course team.',
  contextType: 'course',
};

const disabledRole = {
  role: 'course_editor',
  name: 'Course Editor',
  description: 'Can edit course content.',
  contextType: 'course',
  disabled: true,
};

const defaultProps = {
  users: '',
  setUsers: jest.fn(),
  selectedRole: null,
  setSelectedRole: jest.fn(),
  roles: [libraryRole, courseRole],
  validationError: null,
  invalidUsers: [],
};

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

  it('shows validation error message when provided', () => {
    renderWrapper(
      <SelectUsersAndRoleStep
        {...defaultProps}
        validationError="An error occurred while validating users."
      />,
    );
    expect(screen.getByText('An error occurred while validating users.')).toBeInTheDocument();
  });

  it('renders roles section heading', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} />);
    expect(screen.getByText('Roles')).toBeInTheDocument();
  });

  it('renders library roles under Libraries group', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} roles={[libraryRole]} />);
    expect(screen.getByText('Libraries')).toBeInTheDocument();
    expect(screen.getByText('Library Admin')).toBeInTheDocument();
    expect(screen.getByText('Can manage the library.')).toBeInTheDocument();
  });

  it('renders course roles under Courses group', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} roles={[courseRole]} />);
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Course Admin')).toBeInTheDocument();
  });

  it('renders both course and library role groups', () => {
    renderWrapper(<SelectUsersAndRoleStep {...defaultProps} roles={[libraryRole, courseRole]} />);
    expect(screen.getByText('Libraries')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
  });

  it('calls setSelectedRole when a role radio is selected', async () => {
    const user = userEvent.setup();
    const setSelectedRole = jest.fn();
    renderWrapper(
      <SelectUsersAndRoleStep
        {...defaultProps}
        roles={[libraryRole]}
        setSelectedRole={setSelectedRole}
      />,
    );
    const radio = screen.getByRole('radio', { name: /Library Admin/i });
    await user.click(radio);
    expect(setSelectedRole).toHaveBeenCalledWith('library_admin');
  });

  it('renders disabled roles with tooltip wrapper', () => {
    renderWrapper(
      <SelectUsersAndRoleStep {...defaultProps} roles={[disabledRole]} />,
    );
    const radio = screen.getByRole('radio', { name: /Course Editor/i });
    expect(radio).toBeDisabled();
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
