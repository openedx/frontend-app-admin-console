import {
  Form, Stack, OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import HighlightedUsersInput from './HighlightedUsersInput';

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
  const rolesByContext = roles.reduce<Record<string, RoleMetadata[]>>((acc, role) => {
    const context = role.contextType || 'library';
    if (!acc[context]) { acc[context] = []; }
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
        <HighlightedUsersInput
          value={users}
          onChange={setUsers}
          invalidUsers={invalidUsers}
          placeholder="Enter one or more email addresses or usernames"
          hasNetworkError={!!validationError || invalidUsers.length > 0}
        />
        <Form.Text className={invalidUsers.length > 0 ? 'text-danger' : ''}>
          {invalidUsers.length > 0
            ? 'This email is not associated with an account in this platform.'
            : 'The user must already have an account.'}
        </Form.Text>
        {validationError && (
          <div className="text-danger small mt-1">{validationError}</div>
        )}
      </Form.Group>

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
            {rolesByContext[context].map((role) => {
              const radioContent = (
                <Form.Radio key={role.role} value={role.role} disabled={role.disabled}>
                  <Stack gap={2}>
                    <span className={`role-name font-weight-bold${role.disabled ? ' text-muted' : ''}`}>
                      {role.name}
                    </span>
                    <p className="mb-0 text-gray-500 small">{role.description}</p>
                  </Stack>
                </Form.Radio>
              );

              if (role.disabled) {
                return (
                  <OverlayTrigger
                    key={role.role}
                    placement="right"
                    overlay={(
                      <Tooltip variant="light" id={`tooltip-disabled-${role.role}`}>
                        We are expanding our permissions system. This role is currently
                        unavailable but will be part of an upcoming update.
                      </Tooltip>
                    )}
                  >
                    <div>{radioContent}</div>
                  </OverlayTrigger>
                );
              }

              return radioContent;
            })}
          </Form.RadioSet>
        </div>
      ))}

      {/* Documentation Link */}
      <div className="mt-3">
        <p className="mb-1 font-weight-bold small">Can&apos;t find the role you want to assign?</p>
        <p className="mb-0 small">
          Some roles are managed outside this console{' '}
          <a href="/admin" target="_blank" rel="noopener noreferrer">
            View roles managed in LMS and Django Admin
          </a>
        </p>
      </div>
    </div>
  );
};

export default SelectUsersAndRoleStep;
