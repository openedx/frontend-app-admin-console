import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../audit-user/messages';

interface RenderAdminRoleProps {
  role: string;
}

const RenderAdminRole = ({ role }: RenderAdminRoleProps) => {
  const intl = useIntl();
  // Determine which message to show based on role
  const messageKey = role?.toLowerCase().includes('admin')
    ? 'authz.user.table.permissions.role.admin'
    : 'authz.user.table.permissions.role.staff';

  return (
    <p className="mb-0 text-primary-300 font-weight-light">
      {intl.formatMessage(messages[messageKey])}
    </p>
  );
};

export default RenderAdminRole;
