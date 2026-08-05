import { useIntl } from '@edx/frontend-platform/i18n';
import { SUPERUSER_ROLE } from '@src/authz-module/constants';
import messages from '@src/authz-module/audit-user/messages';

interface RenderAdminRoleProps {
  role: string;
}

const RenderAdminRole = ({ role }: RenderAdminRoleProps) => {
  const intl = useIntl();
  const messageKey = role === SUPERUSER_ROLE
    ? 'authz.user.table.permissions.role.admin'
    : 'authz.user.table.permissions.role.staff';

  return (
    <p className="mb-0 text-primary-300 font-weight-light">
      {intl.formatMessage(messages[messageKey])}
    </p>
  );
};

export default RenderAdminRole;
