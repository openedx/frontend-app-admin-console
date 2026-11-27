import { useMemo, useState } from 'react';
import type { Permission } from '@src/authz-module/catalog';
import type { CustomRoleSeed } from '../customRoleDraft';
import { resolveSelection, setCategorySelection, togglePermission } from '../permissionSelection';

/**
 * Holds the permissions chosen in the create custom role wizard.
 *
 * The wizard calls it, not the permissions step, because the step unmounts on Back and the
 * choices must survive that. The choices restart from the seed when the resource type or the
 * cloned role changes, since the old ones may not apply any more, and are kept otherwise, so a
 * Back and Next round trip, or an edit of the name, loses nothing.
 *
 * @param seed - What the step starts from, or `null` while the first step is incomplete.
 * @param cloneSourceRole - Id of the role being cloned, which tells two seeds of one resource type apart.
 * @param permissions - The permissions of the seed's resource type, which carry the dependencies.
 */
export const usePermissionSelection = (
  seed: CustomRoleSeed | null,
  cloneSourceRole: string | null,
  permissions: Permission[],
) => {
  const seedKey = seed ? `${seed.scopeType}|${cloneSourceRole ?? ''}` : '';
  const [state, setState] = useState<{ key: string; selected: string[] }>({ key: '', selected: [] });
  const selected = useMemo(
    () => (state.key === seedKey ? state.selected : (seed?.permissions ?? [])),
    [state, seedKey, seed?.permissions],
  );

  const { effective, requiredBy } = useMemo(
    () => resolveSelection(selected, permissions),
    [selected, permissions],
  );

  const update = (next: string[]) => setState({ key: seedKey, selected: next });

  return {
    /** Ids granted: the chosen ones and what they need. */
    effective,
    /** For each locked permission, the ids of the chosen permissions that need it. */
    requiredBy,
    selectedCount: permissions.filter(({ id }) => effective.has(id)).length,
    toggle: (permissionId: string) => update(togglePermission(selected, permissionId, permissions)),
    setCategory: (categoryPermissionIds: string[], isOn: boolean) => update(
      setCategorySelection(selected, categoryPermissionIds, isOn),
    ),
  };
};

export type PermissionSelection = ReturnType<typeof usePermissionSelection>;
