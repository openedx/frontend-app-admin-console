import { actionKeys } from '@src/authz-module/components/RoleCard/constants';
import actionMessages from '../components/RoleCard/messages';

const buildPermissionsByRoleMatrix = ({
  rolePermissions, permissions, resources, intl,
}) => {
  const permissionsMatrix = {};
  const allowedPermissions = new Set(rolePermissions);

  permissions.forEach((permission) => {
    const resourceLabel = resources.find(r => r.key === permission.resource)?.label || permission.resource;
    const actionKey = actionKeys.find(action => permission.key.includes(action));
    let messageKey = `authz.permissions.actions.${actionKey}`;
    let messageResource = '';

    permissionsMatrix[permission.resource] = permissionsMatrix[permission.resource]
    || { key: permission.resource, label: resourceLabel, actions: [] };

    if (actionKey === 'tag' || actionKey === 'team') {
      messageKey = 'authz.permissions.actions.manage';
      messageResource = actionKey === 'tag' ? 'Tags' : messageResource;
    }

    permissionsMatrix[permission.resource].actions.push({
      key: actionKey,
      label: permission.label || intl.formatMessage(actionMessages[messageKey], { resource: messageResource }),
      disabled: !allowedPermissions.has(permission.key),
    });
  });
  return Object.values(permissionsMatrix);
};

export { buildPermissionsByRoleMatrix };
