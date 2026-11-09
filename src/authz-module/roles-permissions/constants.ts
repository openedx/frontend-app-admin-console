import type { ComponentType } from 'react';
import type { MessageDescriptor } from '@openedx/frontend-base';

import { SCOPE_TYPES } from '../constants';
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
