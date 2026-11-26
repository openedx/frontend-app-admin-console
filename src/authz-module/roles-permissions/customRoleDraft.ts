import type { CreateCustomRoleRequest, Permission, Role } from '@src/authz-module/catalog';

/** Backend `display_name` is `max_length=255`; a longer name would be rejected on save. */
export const MAX_ROLE_NAME_LENGTH = 255;

export const START_FROM = {
  SCRATCH: 'scratch',
  CLONE: 'clone',
} as const;

export type StartFrom = typeof START_FROM[keyof typeof START_FROM];

/** What the first step of the create custom role wizard collects. */
export interface CustomRoleDraft {
  name: string;
  startFrom: StartFrom;
  // The resource type picked in scratch mode. Clone mode takes it from the source role instead.
  scopeType: string;
  // The id of the role to clone, in clone mode.
  sourceRole: string | null;
}

/** What the permissions step starts from: the resource type and the permissions already granted. */
export interface CustomRoleSeed {
  scopeType: string;
  permissions: string[];
}

export const EMPTY_CUSTOM_ROLE_DRAFT: CustomRoleDraft = {
  name: '',
  startFrom: START_FROM.SCRATCH,
  scopeType: '',
  sourceRole: null,
};

/**
 * Turns the first step's answers into what the permissions step starts from, or `null` while
 * a required answer is missing, which is also what keeps Next disabled.
 *
 * A clone takes its resource type and permissions from the source role, so the resource type
 * can't differ from the role it copies. Roles hold a single resource type today, so the
 * source role's first one is the resource type.
 *
 * @param draft - The first step's answers.
 * @param getRole - Looks a role up by id in the catalog.
 */
export const getCustomRoleSeed = (
  draft: CustomRoleDraft,
  getRole: (roleId: string) => Role | undefined,
): CustomRoleSeed | null => {
  if (!draft.name.trim()) return null;
  if (draft.startFrom === START_FROM.SCRATCH) {
    return draft.scopeType ? { scopeType: draft.scopeType, permissions: [] } : null;
  }
  const sourceRole = draft.sourceRole ? getRole(draft.sourceRole) : undefined;
  const scopeType = sourceRole?.scopeTypes[0];
  if (!sourceRole || !scopeType) return null;
  return { scopeType, permissions: [...sourceRole.permissions] };
};

/**
 * Turns the wizard's answers into the request that creates the role.
 *
 * The permissions are those of the resource type that end up granted, the chosen ones and what
 * they need, in catalog order, so the request matches the count the permissions step shows.
 *
 * @param draft - The first step's answers.
 * @param seed - What the permissions step started from, which holds the resource type.
 * @param effective - Ids granted in the permissions step.
 * @param permissions - The permissions of the seed's resource type.
 */
export const buildCreateCustomRoleRequest = (
  draft: CustomRoleDraft,
  seed: CustomRoleSeed,
  effective: ReadonlySet<string>,
  permissions: Permission[],
): CreateCustomRoleRequest => ({
  displayName: draft.name.trim(),
  scopeType: seed.scopeType,
  permissions: permissions.filter(({ id }) => effective.has(id)).map(({ id }) => id),
});

/**
 * Whether two role names are the same to the server, which compares them trimmed and without case.
 * The wizard uses it to tell whether the name a create was rejected for has been changed.
 */
export const isSameRoleName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
