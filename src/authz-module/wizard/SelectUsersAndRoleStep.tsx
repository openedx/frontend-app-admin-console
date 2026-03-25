import { Form, Stack } from '@openedx/paragon';

interface RoleMetadata {
  role: string;
  name: string;
  description: string;
  contextType?: string;
  disabled?: boolean;
}

interface SelectUsersAndRoleStepProps {
  users: string;
  setUsers: React.Dispatch<React.SetStateAction<string>>;
  selectedRole: string | null;
  setSelectedRole: React.Dispatch<React.SetStateAction<string | null>>;
  roles: RoleMetadata[];
  validationError: string | null;
  invalidUsers: string[];
}

const CONTEXT_ORDER = ['course', 'library'];

const contextLabels: Record<string, string> = {
  library: 'Libraries',
  course: 'Courses',
};

const SelectUsersAndRoleStep = ({
  users,
  setUsers,
  selectedRole,
  setSelectedRole,
  roles,
  validationError,
  invalidUsers,
}: SelectUsersAndRoleStepProps) => {
  // Group roles by contextType preserving CONTEXT_ORDER
  const rolesByContext = roles.reduce<Record<string, RoleMetadata[]>>((acc, role) => {
    const context = role.contextType || 'library';
    if (!acc[context]) {
      acc[context] = [];
    }
    acc[context].push(role);
    return acc;
  }, {});

  const orderedContexts = CONTEXT_ORDER.filter((ctx) => rolesByContext[ctx]);

  return (
    <div className="select-users-and-role-step">
      {/* Users Section */}
      <h3 className="mb-2">Users</h3>
      <Form.Group controlId="users-input">
        <Form.Label>Add users by username or email</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={users}
          onChange={(e) => setUsers(e.target.value)}
          placeholder="Enter one or more email addresses or usernames"
          isInvalid={!!validationError}
        />
        <Form.Text>The user must already have an account.</Form.Text>
        {validationError && (
          <Form.Control.Feedback type="invalid">
            {validationError}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      {/* Invalid Users Display */}
      {invalidUsers.length > 0 && (
        <div className="invalid-users-alert mb-3">
          <ul className="invalid-users-list">
            {invalidUsers.map((user) => (
              <li key={user} className="text-danger">
                {user}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Roles Section */}
      <h3 className="mt-4 mb-2">Roles</h3>
      {orderedContexts.map((context) => (
        <div key={context} className="role-group mb-4">
          <h5 className="role-group-header mb-3 pl-4">
            {contextLabels[context] || context}
          </h5>
          <Form.RadioSet
            name="role-selection"
            value={selectedRole || ''}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="pl-4"
          >
            {rolesByContext[context].map((role) => (
              <Form.Radio key={role.role} value={role.role} disabled={role.disabled}>
                <Stack gap={2}>
                  <span className={`role-name font-weight-bold${role.disabled ? ' text-muted' : ''}`}>
                    {role.name}
                  </span>
                  <p className="mb-0 text-gray-500 small">{role.description}</p>
                </Stack>
              </Form.Radio>
            ))}
          </Form.RadioSet>
        </div>
      ))}

      {/* Documentation Link */}
      <div className="mt-3">
        <p className="mb-1 font-weight-bold small">Can't find the role you want to assign?</p>
        <p className="mb-0 small">
          Some roles are managed outside this console{' '}
          <a
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
          >
            View roles managed in LMS and Django Admin
          </a>
        </p>
      </div>
    </div>
  );
};

export default SelectUsersAndRoleStep;
