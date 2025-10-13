import { actionKeys } from '@src/authz-module/components/RoleCard/constants';
import actionMessages from '../components/RoleCard/messages';

/**
 * Builds a permission matrix for a role.
 *
 * Builds a permission matrix grouped by resource, mapping each action to its display label
 * and enabled/disabled state based on the role's allowed permissions.
 *
 * @param rolePermissions - Array of permission keys allowed for the current role.
 * @param permissions - Permissions metadata.
 * @param resources - Resources metadata.
 * @param intl - the i18n function to enable label translations.
 * @returns An array of permission groupings by resource with action-level details.
 */
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
