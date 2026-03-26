import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form, Stack, OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import HighlightedUsersInput from './HighlightedUsersInput';
import messages from './messages';

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

const SelectUsersAndRoleStep = ({
  users,
  setUsers,
  selectedRole,
  setSelectedRole,
  roles,
  validationError,
  invalidUsers,
}: SelectUsersAndRoleStepProps) => {
  const intl = useIntl();

  const contextLabels: Record<string, string> = {
    library: intl.formatMessage(messages['wizard.step1.roles.contextLabel.library']),
    course: intl.formatMessage(messages['wizard.step1.roles.contextLabel.course']),
  };

  const rolesByContext = roles.reduce<Record<string, RoleMetadata[]>>((acc, role) => {
    const context = role.contextType || 'library';
    if (!acc[context]) { acc[context] = []; }
    acc[context].push(role);
    return acc;
  }, {});

  const orderedContexts = CONTEXT_ORDER.filter((ctx) => rolesByContext[ctx]);

  const adminUrl = `${getConfig().LMS_BASE_URL}/admin`;

  return (
    <div className="select-users-and-role-step">
      {/* Users Section */}
      <h3 className="mb-2">{intl.formatMessage(messages['wizard.step1.users.heading'])}</h3>
      <Form.Group controlId="users-input">
        <Form.Label>{intl.formatMessage(messages['wizard.step1.users.label'])}</Form.Label>
        <HighlightedUsersInput
          value={users}
          onChange={setUsers}
          invalidUsers={invalidUsers}
          placeholder={intl.formatMessage(messages['wizard.step1.users.placeholder'])}
          hasNetworkError={!!validationError || invalidUsers.length > 0}
        />
        <Form.Text className={invalidUsers.length > 0 ? 'text-danger' : ''}>
          {invalidUsers.length > 0
            ? intl.formatMessage(messages['wizard.step1.users.invalid'], { count: invalidUsers.length })
            : intl.formatMessage(messages['wizard.step1.users.hint'])}
        </Form.Text>
        {validationError && (
          <div className="text-danger small mt-1">{validationError}</div>
        )}
      </Form.Group>

      {/* Roles Section */}
      <h3 className="mt-4 mb-2">{intl.formatMessage(messages['wizard.step1.roles.heading'])}</h3>
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
                        {intl.formatMessage(messages['wizard.step1.roles.disabled.tooltip'])}
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
        <p className="mb-1 font-weight-bold small">{intl.formatMessage(messages['wizard.step1.docs.heading'])}</p>
        <p className="mb-0 small">
          {intl.formatMessage(messages['wizard.step1.docs.body'])}{' '}
          <a href={adminUrl} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage(messages['wizard.step1.docs.link'])}
          </a>
        </p>
      </div>
    </div>
  );
};

export default SelectUsersAndRoleStep;
