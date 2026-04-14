import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

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
    <div className="mb-4">
      <p className="mb-0 text-primary-300 font-weight-light">
        {intl.formatMessage(messages[messageKey])}
      </p>
    </div>
  );
};

export default RenderAdminRole;
