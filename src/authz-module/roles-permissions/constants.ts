import type { ComponentType } from 'react';
import type { MessageDescriptor } from '@openedx/frontend-base';

import { SCOPE_TYPES } from '../constants';
import type { RolesSortBy } from '../catalog';
import { RESOURCE_ICONS } from '../components/constants';
import messages from './messages';

/**
 * Icon and label of each resource type the roles table knows. The table and its filter
 * fall back to the raw scope type for any other the catalog returns.
 */
export const RESOURCE_TYPE_DISPLAY: Partial<Record<string, { icon: ComponentType; label: MessageDescriptor }>> = {
  [SCOPE_TYPES.COURSE]: { icon: RESOURCE_ICONS.COURSE, label: messages['authz.roles.table.resource.type.courses'] },
  [SCOPE_TYPES.LIBRARY]: { icon: RESOURCE_ICONS.LIBRARY, label: messages['authz.roles.table.resource.type.libraries'] },
};

// Ids of the roles table columns that search, filter or sort on the server.
export const ROLES_TABLE_COLUMNS = {
  NAME: 'name',
  RESOURCE_TYPE: 'resourceType',
  MEMBERS: 'members',
  LAST_UPDATED: 'lastUpdated',
} as const;

/**
 * The `sort_by` value of each sortable column. Explicit, since the column ids don't match the
 * API names; a column missing here sends no sort, so the endpoint's default (display name) applies.
 */
export const ROLES_SORT_BY: Partial<Record<string, RolesSortBy>> = {
  [ROLES_TABLE_COLUMNS.NAME]: 'display_name',
  [ROLES_TABLE_COLUMNS.RESOURCE_TYPE]: 'scope_type',
  [ROLES_TABLE_COLUMNS.MEMBERS]: 'user_count',
  [ROLES_TABLE_COLUMNS.LAST_UPDATED]: 'updated_at',
};
