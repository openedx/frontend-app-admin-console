import type { Permission } from '@src/authz-module/catalog';

export interface ResolvedSelection {
  // Every permission that ends up granted: the chosen ones plus the ones they need.
  effective: Set<string>;
  // For each permission that another chosen permission needs, the ids of the chosen permissions
  // that need it. Those rows are shown enabled and locked.
  requiredBy: Record<string, string[]>;
}

/**
 * Applies permission dependencies to the permissions the user chose. Dependencies are followed
 * transitively and cycles are tolerated.
 *
 * Only the user's own choices are kept as state, and this derives what they imply. That way,
 * turning off the permission that needed another one releases it, instead of leaving it enabled
 * with nobody to explain why.
 *
 * @param selected - Ids the user chose explicitly.
 * @param permissions - The permissions of the resource type, carrying `implies`.
 */
export const resolveSelection = (selected: string[], permissions: Permission[]): ResolvedSelection => {
  const byId = new Map(permissions.map((permission) => [permission.id, permission]));
  const effective = new Set(selected);
  const requirers: Record<string, Set<string>> = {};

  selected.forEach((rootId) => {
    const visited = new Set([rootId]);
    const pending = [...(byId.get(rootId)?.implies ?? [])];
    while (pending.length) {
      const dependencyId = pending.pop() as string;
      if (!visited.has(dependencyId)) {
        visited.add(dependencyId);
        effective.add(dependencyId);
        (requirers[dependencyId] ??= new Set()).add(rootId);
        pending.push(...(byId.get(dependencyId)?.implies ?? []));
      }
    }
  });

  const requiredBy = Object.fromEntries(
    Object.entries(requirers).map(([id, rootIds]) => [id, [...rootIds].sort()]),
  );
  return { effective, requiredBy };
};

/**
 * Turns one permission on or off. A permission that another chosen one needs is locked, so
 * toggling it changes nothing.
 */
export const togglePermission = (selected: string[], permissionId: string, permissions: Permission[]): string[] => {
  if (resolveSelection(selected, permissions).requiredBy[permissionId]) {
    return selected;
  }
  return selected.includes(permissionId)
    ? selected.filter((id) => id !== permissionId)
    : [...selected, permissionId];
};

/**
 * Turns on, or off, all the permissions of a category. Turning off drops them as choices, and
 * one that a permission outside the category still needs stays enabled through that one.
 */
export const setCategorySelection = (selected: string[], categoryPermissionIds: string[], isOn: boolean): string[] => {
  if (isOn) {
    return [...selected, ...categoryPermissionIds.filter((id) => !selected.includes(id))];
  }
  return selected.filter((id) => !categoryPermissionIds.includes(id));
};

/** The "x of y" of a category: how many of its permissions are granted. */
export const getCategoryTally = (effective: Set<string>, categoryPermissionIds: string[]) => ({
  selected: categoryPermissionIds.filter((id) => effective.has(id)).length,
  total: categoryPermissionIds.length,
});
