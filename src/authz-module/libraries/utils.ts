import { IntlShape } from '@edx/frontend-platform/i18n';
import { actionKeys } from '@src/authz-module/components/RoleCard/constants';
import {
  EnrichedPermission, PermissionMetadata, PermissionsResourceGrouped,
  PermissionsRoleGrouped, ResourceMetadata, Role, RoleResourceGroup,
} from '@src/types';
import actionMessages from '../components/RoleCard/messages';

/**
 * Derives the localized label and action key for a given permission.
 *
 * This function enhance the permissions metadata mapping the key to a list of prefefined actions
 * to add visual elemments (icons) and a localized label.
 * If a label is already defined in the permission metadata, that is returned as-is.
 *
 * Special handling is applied for action keys like `'tag'` and `'team'`, which are
 * normalized to `'manage'` and given a custom resource string for translation.
 *
 * @param permission - The permission metadata, typically containing a key and optional label.
 * @param intl - The `IntlShape` object used to generate localized labels.
 *
 * @returns An object containing:
 * - `label`: The human-readable, localized label for the permission.
 * - `actionKey`: A string representing icon to be displayed (e.g., `'Read'`, `'Edit'`), or '' if not matched.
 */
const getPermissionMetadata = (permission: PermissionMetadata, intl: IntlShape): EnrichedPermission => {
  const actionKey = actionKeys.find(action => permission.key.includes(action)) || '';
  let messageKey = `authz.permissions.actions.${actionKey}`;
  let messageResource = '';

  if (actionKey === 'tag' || actionKey === 'team') {
    messageKey = 'authz.permissions.actions.manage';
    messageResource = actionKey === 'tag' ? 'Tags' : '';
  }

  const messageDescriptor = actionMessages[messageKey];
  const label = permission.label || (messageDescriptor
    ? intl.formatMessage(messageDescriptor, { resource: messageResource })
    : permission.key);

  return { ...permission, label, actionKey };
};

type BuildPermissionsMatrixProps = {
  roles: Role[];
  permissions: PermissionMetadata[];
  resources: ResourceMetadata[];
  intl: IntlShape;
};

/**
 * Builds a permission matrix from the given roles, permissions, and resources.
 *
 * The matrix groups permissions under their respective resources and maps
 * each permission to which roles have access to it.
 *
 * @param roles - List of roles, each containing a list of granted permission keys.
 * @param permissions - Metadata describing each permission, including its associated resource.
 * @param resources - List of resource metadata used to group permissions.
 * @param intl - The internationalization object used to localize permission labels.
 *
 * @returns A permission matrix grouped by resource, with role mappings per permission.
 */
const buildPermissionMatrixByResource = ({
  roles, permissions, resources, intl,
}: BuildPermissionsMatrixProps): PermissionsResourceGrouped[] => {
  const enrichedPermissions = permissions.reduce((acc, perm) => {
    acc[perm.key] = getPermissionMetadata(perm, intl);
    return acc;
  }, {} as Record<string, EnrichedPermission>);

  const permissionsByResource = permissions.reduce<Record<string, PermissionMetadata[]>>((acc, perm) => {
    if (!acc[perm.resource]) { acc[perm.resource] = []; }
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  return resources.map(resource => {
    const perms = permissionsByResource[resource.key] || [];

    const permissionRows = perms.map(permission => {
      const enriched = enrichedPermissions[permission.key];
      const rolesMap = roles.reduce((acc, role) => {
        acc[role.name] = role.permissions.includes(permission.key);
        return acc;
      }, {} as Record<string, boolean>);

      return {
        ...enriched,
        roles: rolesMap,
      };
    });

    return {
      ...resource,
      permissions: permissionRows,
    };
  });
};

/**
 * Builds a permission matrix for grouped by roles.
 *
 * Builds a permission matrix grouped by resource, mapping each action to its display label
 * and enabled/disabled state based on the role's allowed permissions.
 *
 * @param roles - Array of roles metadata.
 * @param permissions - Permissions metadata.
 * @param resources - Resources metadata.
 * @param intl - the i18n function to enable label translations.
 * @returns An array of permission groupings by role and resource with action-level details.
 */
const buildPermissionMatrixByRole = ({
  roles, permissions, resources, intl,
}: BuildPermissionsMatrixProps): PermissionsRoleGrouped[] => {
  const enrichedPermissions = permissions.reduce((acc, perm) => {
    acc[perm.key] = getPermissionMetadata(perm, intl);
    return acc;
  }, {} as Record<string, EnrichedPermission>);

  return roles.map(role => {
    const allowed = new Set(role.permissions);
    const permissionsGroupedByResource: Record<string, RoleResourceGroup> = {};

    permissions.forEach(permission => {
      const enriched = enrichedPermissions[permission.key];
      const { resource } = permission;

      if (!enriched.actionKey) { return; }

      if (!permissionsGroupedByResource[resource]) {
        const resourceInfo = resources.find(r => r.key === resource);
        if (!resourceInfo) { return; }

        permissionsGroupedByResource[resource] = {
          key: resourceInfo.key,
          label: resourceInfo.label,
          description: resourceInfo.description,
          permissions: [],
        };
      }

      permissionsGroupedByResource[resource].permissions.push({
        ...enriched,
        description: permission.description,
        disabled: !allowed.has(permission.key),
      });
    });

    return {
      ...role,
      resources: Object.values(permissionsGroupedByResource),
    };
  });
};

export { buildPermissionMatrixByResource, buildPermissionMatrixByRole };
