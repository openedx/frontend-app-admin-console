import { Form, Stack } from '@openedx/paragon';
import { getSiteConfig, useIntl } from '@openedx/frontend-base';
import type { MessageDescriptor } from '@openedx/frontend-base';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import type { ScopeCatalog } from '@src/authz-module/catalog';
import HighlightedUsersInput from './HighlightedUsersInput';
import messages from '@src/authz-module/role-assignation-wizard/messages';

// A role is selected within a scope type, since a role can be offered in several of them.
export interface SelectedRole {
  scopeType: string;
  role: string;
}

// The roles the user can assign in one scope type.
export type RoleGroup = Pick<ScopeCatalog, 'scopeType' | 'roles'>;

interface SelectUsersAndRoleStepProps {
  users: string;
  setUsers: (value: string) => void;
  selectedRole: SelectedRole | null;
  setSelectedRole: (selectedRole: SelectedRole) => void;
  roleGroups: RoleGroup[];
  invalidUsers: string[];
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

// Header of the roles of each scope type.
const SCOPE_TYPE_LABELS: Partial<Record<string, MessageDescriptor>> = {
  [SCOPE_TYPES.COURSE]: messages['wizard.step1.roles.contextLabel.course'],
  [SCOPE_TYPES.LIBRARY]: messages['wizard.step1.roles.contextLabel.library'],
};

const ADMIN_URL = `${getSiteConfig().lmsBaseUrl}/admin`;

const SelectUsersAndRoleStep = ({
  users,
  setUsers,
  selectedRole,
  setSelectedRole,
  roleGroups,
  invalidUsers,
  inputRef,
}: SelectUsersAndRoleStepProps) => {
  const intl = useIntl();

  return (
    <div className="select-users-and-role-step">
      {/* Users Section */}
      <h3 className="text-primary mb-2">{intl.formatMessage(messages['wizard.step1.users.heading'])}</h3>
      <Form.Group controlId="users-input">
        <Form.Label>{intl.formatMessage(messages['wizard.step1.users.label'])}</Form.Label>
        <HighlightedUsersInput
          ref={inputRef}
          id="users-input"
          value={users}
          onChange={setUsers}
          invalidUsers={invalidUsers}
          placeholder={intl.formatMessage(messages['wizard.step1.users.placeholder'])}
          hasError={invalidUsers.length > 0}
          ariaDescribedBy="users-input-hint"
        />
        <Form.Text id="users-input-hint" aria-live="polite" className={`my-3 ${invalidUsers.length > 0 ? 'text-danger' : ''}`}>
          {invalidUsers.length > 0
            ? intl.formatMessage(messages['wizard.step1.users.invalid'], { count: invalidUsers.length })
            : intl.formatMessage(messages['wizard.step1.users.hint'])}
        </Form.Text>
      </Form.Group>

      {/* Roles Section */}
      <h3 className="text-primary mt-4 mb-2">{intl.formatMessage(messages['wizard.step1.roles.heading'])}</h3>
      {roleGroups.filter(({ roles }) => roles.length > 0).map(({ scopeType, roles }) => {
        const label = SCOPE_TYPE_LABELS[scopeType];
        return (
          <div key={scopeType} className="role-group mb-4">
            <h5 className="h4 text-gray role-group-header my-4 pl-4">
              {label ? intl.formatMessage(label) : scopeType}
            </h5>
            <Form.RadioSet
              name={`role-selection-${scopeType}`}
              value={selectedRole?.scopeType === scopeType ? selectedRole.role : ''}
              onChange={(e) => setSelectedRole({ scopeType, role: e.target.value })}
              aria-required
              className="pl-4"
            >
              {roles.map((role) => (
                <Form.Radio key={role.role} value={role.role}>
                  <Stack gap={2}>
                    <span className="role-name">
                      {role.displayName}
                    </span>
                    <p className="mb-0 text-gray-500 small">{role.description}</p>
                  </Stack>
                </Form.Radio>
              ))}
            </Form.RadioSet>
          </div>
        );
      })}

      {/* Documentation Link */}
      <div className="mt-3">
        <p className="mb-1 font-weight-bold small">{intl.formatMessage(messages['wizard.step1.docs.heading'])}</p>
        <p className="mb-0 small">
          {intl.formatMessage(messages['wizard.step1.docs.body'])}{' '}
          <a href={ADMIN_URL} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage(messages['wizard.step1.docs.link'])}
          </a>
        </p>
      </div>
    </div>
  );
};

export default SelectUsersAndRoleStep;
