import { useIntl } from '@edx/frontend-platform/i18n';
import { Check, Close } from '@openedx/paragon/icons';
import { Card, Icon } from '@openedx/paragon';
import { PermissionsResourceGrouped, Role } from '@src/types';
import { actionsDictionary } from './RoleCard/constants';
import ResourceTooltip from './ResourceTooltip';
import messages from './messages';

type PermissionTableProps = {
  roles: Role[];
  permissionsTable: PermissionsResourceGrouped[];
};

const PermissionTable = ({ permissionsTable, roles }: PermissionTableProps) => {
  const { formatMessage } = useIntl();
  return (
    <Card>
      <table className="permission-table w-100">
        <thead>
          <tr>
            <th className="" aria-hidden="true" />
            {roles.map(role => (
              <th key={role.name} className="text-center py-3">{role.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissionsTable.map(resourceGroup => (
            <>
              <tr className="bg-info-100 text-primary">
                <td colSpan={roles.length + 1} className="text-start py-3 px-4">
                  <strong>{resourceGroup.label}</strong>
                  <ResourceTooltip resourceGroup={resourceGroup} />
                </td>
              </tr>
              {resourceGroup.permissions.map(permission => (
                <tr key={permission.key} className="border-top">
                  <td className="text-start d-flex align-items-center small px-4 py-3">
                    <Icon className="d-inline-block mr-2" size="sm" src={actionsDictionary[permission.actionKey]} />
                    {permission.label}
                  </td>
                  {roles.map(role => (
                    <td key={role.name} className="text-center">
                      {
                      permission.roles[role.name]
                        ? (
                          <Icon
                            className="d-inline-block"
                            src={Check}
                            aria-label={formatMessage(messages['authz.role.card.permission.for.role.status.granted'], {
                              roleName: role.name,
                            })}
                            screenReaderText={formatMessage(messages['authz.role.card.permission.for.role.status.granted'], {
                              roleName: role.name,
                            })}
                          />
                        )
                        : (
                          <Icon
                            className="text-danger d-inline-block"
                            src={Close}
                            aria-label={formatMessage(messages['authz.role.card.permission.for.role.status.denied'], {
                              roleName: role.name,
                            })}
                            screenReaderText={formatMessage(messages['authz.role.card.permission.for.role.status.denied'], {
                              roleName: role.name,
                            })}
                          />
                        )
}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default PermissionTable;
