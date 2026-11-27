import type { Role } from '@src/authz-module/catalog';

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
