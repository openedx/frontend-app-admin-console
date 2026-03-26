import { useIntl } from '@edx/frontend-platform/i18n';
import { Check, Close } from '@openedx/paragon/icons';
import { Card, Icon, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { PermissionsResourceGrouped, Role } from '@src/types';
import { actionsDictionary } from './RoleCard/constants';
import ResourceTooltip from './ResourceTooltip';
import messages from './messages';

type PermissionTableProps = {
  roles: Role[];
  permissionsTable: PermissionsResourceGrouped[];
  title?: string;
};

const PermissionTable = ({ permissionsTable, roles, title }: PermissionTableProps) => {
  const { formatMessage } = useIntl();
  return (
    <Card>
      <table className="permission-table w-100">
        <thead>
          <tr>
            <th className="sticky-top bg-white px-4 py-3">
              {title}
            </th>
            {roles.map(role => (
              <th
                key={role.name}
                className={`text-center py-3 sticky-top bg-white ${role.disable && 'text-muted opacity-50'}`}
              >
                {role.disable ? (
                  <OverlayTrigger
                    placement="top"
                    overlay={(
                      <Tooltip
                        id={`tooltip-${role.name}`}
                        variant="light"
                      >
                        {formatMessage(messages['authz.role.card.permission.for.role.status.disabled'])}
                      </Tooltip>
                    )}
                  >
                    <span style={{ cursor: 'help' }}>{role.name}</span>
                  </OverlayTrigger>
                ) : (
                  role.name
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissionsTable.map(resourceGroup => (
            <>
              <tr className="bg-info-100 text-primary">
                <td colSpan={roles.length + 1} className="text-start py-3 px-4">
                  <div className="d-flex align-items-center">
                    {resourceGroup.icon && <Icon className="d-inline-block mr-2" size="xs" src={resourceGroup.icon} />}
                    <strong>{resourceGroup.label}</strong>
                    <ResourceTooltip resourceGroup={resourceGroup} />
                  </div>
                </td>
              </tr>
              {resourceGroup.permissions.map(permission => (
                <tr key={permission.key} className="border-top">
                  <td className="text-start d-flex align-items-center small px-4 py-3">
                    <Icon className="d-inline-block mr-2" size="sm" src={actionsDictionary[permission.actionKey]} />
                    {permission.label}
                  </td>
                  {roles.map(role => (
                    <td key={role.name} className={`text-center ${role.disable && 'opacity-50'}`}>
                      {
                      permission.roles[role.name]
                        ? (
                          <Icon
                            className={`d-inline-block ${role.disable && 'text-muted'}`}
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
                            className={`d-inline-block ${role.disable ? 'text-muted' : 'text-danger'}`}
                            src={Close}
                            aria-label={formatMessage(messages['authz.role.card.permission.for.role.status.not.granted'], {
                              roleName: role.name,
                            })}
                            screenReaderText={formatMessage(messages['authz.role.card.permission.for.role.status.not.granted'], {
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
