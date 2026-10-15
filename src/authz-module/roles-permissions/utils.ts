import type { IntlShape } from '@openedx/frontend-base';
import { actionKeys } from '@src/authz-module/components/RoleCard/constants';
import type { Category, Permission, ScopeCatalog } from '@src/authz-module/catalog';
import { EnrichedPermission, PermissionMetadata } from '@src/types';
import actionMessages from '@src/authz-module/components/RoleCard/messages';

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

  if (actionKey === 'team') {
    messageKey = 'authz.permissions.actions.manage';
  }

  const messageDescriptor = actionMessages[messageKey];
  const label = permission.label || (messageDescriptor
    ? intl.formatMessage(messageDescriptor, { resource: '' })
    : permission.key);

  return { ...permission, label, actionKey };
};

export interface MatrixPermission {
  permission: Permission;
  // Whether each role, by role id, grants the permission.
  grantedTo: Record<string, boolean>;
}

export interface MatrixCategory {
  category: Category;
  permissions: MatrixPermission[];
}

/**
 * Builds the roles and permissions matrix of a scope type: its permissions grouped by category,
 * each one with the roles that grant it.
 *
 * Categories keep the catalog order. Permissions without a category go in a final
 * `otherCategory`, which is left out when there are none.
 *
 * @param scopeCatalog - The catalog of the scope type.
 * @param otherCategory - The category that groups the permissions without one.
 *
 * @returns The matrix, one entry per category.
 */
const buildPermissionMatrix = (
  { categories, permissions, roles }: ScopeCatalog,
  otherCategory: Category,
): MatrixCategory[] => {
  const toMatrixPermission = (permission: Permission): MatrixPermission => ({
    permission,
    grantedTo: Object.fromEntries(roles.map(({ role, permissions: granted }) => [role, granted.includes(permission.id)])),
  });

  const matrix = categories.map((category) => ({
    category,
    permissions: permissions.filter(({ categoryId }) => categoryId === category.id).map(toMatrixPermission),
  }));

  const uncategorized = permissions.filter(({ categoryId }) => categoryId === null);
  if (!uncategorized.length) return matrix;

  return [...matrix, { category: otherCategory, permissions: uncategorized.map(toMatrixPermission) }];
};

export { buildPermissionMatrix, getPermissionMetadata };
