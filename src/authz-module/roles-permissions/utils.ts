import type { Category, Permission, ScopeCatalog } from '@src/authz-module/catalog';

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

export { buildPermissionMatrix };
