import { IntlShape } from '@edx/frontend-platform/i18n';
import { actionKeys } from '@src/authz-module/components/RoleCard/constants';
import actionMessages from '../components/RoleCard/messages';
import { PermissionMetadata, ResourceMetadata, Role } from 'types';

function getPermissionMetadata(
  permission: PermissionMetadata,
  intl: IntlShape,
): { label: string; actionKey: string | undefined } {
  const actionKey = actionKeys.find(action => permission.key.includes(action));
  let messageKey = `authz.permissions.actions.${actionKey}`;
  let messageResource = '';

  if (actionKey === 'tag' || actionKey === 'team') {
    messageKey = 'authz.permissions.actions.manage';
    messageResource = actionKey === 'tag' ? 'Tags' : '';
  }

  const label = permission.label || intl.formatMessage(actionMessages[messageKey], { resource: messageResource });

  return { label, actionKey };
}


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
  rolePermissions,
  permissions,
  resources,
  intl,
}) => {
  const permissionsMatrix = {};
  const allowedPermissions = new Set(rolePermissions);

  permissions.forEach((permission) => {
    const resourceLabel =
      resources.find((r) => r.key === permission.resource)?.label ||
      permission.resource;

    const { label, actionKey } = getPermissionMetadata(permission, intl);

    if (!actionKey) return; // Skip unknown actions

    // Initialize resource group if not already present
    if (!permissionsMatrix[permission.resource]) {
      permissionsMatrix[permission.resource] = {
        key: permission.resource,
        label: resourceLabel,
        actions: [],
      };
    }

    permissionsMatrix[permission.resource].actions.push({
      key: actionKey,
      label,
      disabled: !allowedPermissions.has(permission.key),
    });
  });

  return Object.values(permissionsMatrix);
};




type PermissionMatrix = {
  resource: string;
  resourceLabel: string;
  permissions: {
    key: string;
    label: string;
    roles: Record<string, boolean>;
  }[];
}[];

export function buildPermissionMatrix(
  roles: Role[],
  permissions: PermissionMetadata[],
  resources: ResourceMetadata[],
  intl: IntlShape,
): PermissionMatrix {
  const permissionsByResource = permissions.reduce<Record<string, PermissionMetadata[]>>((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  const matrix: PermissionMatrix = resources.map(resource => {
    const resourcePermissions = permissionsByResource[resource.key] || [];

    const permissionRows = resourcePermissions.map(permission => {
      const rolesMap: Record<string, boolean> = {};

      roles.forEach(role => {
        rolesMap[role.name] = role.permissions.includes(permission.key);
      });

      const { label, actionKey } = getPermissionMetadata(permission, intl);

      return {
        key: permission.key,
        actionKey, // Important for icon mapping
        label,
        roles: rolesMap,
      };
    });

    return {
      resource: resource.key,
      resourceLabel: resource.label,
      permissions: permissionRows,
    };
  });

  return matrix;
}


export { buildPermissionsByRoleMatrix };
