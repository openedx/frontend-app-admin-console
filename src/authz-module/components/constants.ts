import type { IntlShape } from '@edx/frontend-platform/i18n';
import { Language, LibraryBooks, School } from '@openedx/paragon/icons';
import { allRolesMetadata } from '@src/authz-module/roles-permissions';
import { GLOBAL_STAFF_ROLE, MAP_ROLE_KEY_TO_LABEL, SUPERUSER_ROLE } from '@src/authz-module/constants';
import messages from './messages';

export const RESOURCE_ICONS = {
  COURSE: School,
  LIBRARY: LibraryBooks,
  GLOBAL: Language,
};

// The API expects the underscore format when roles are sent as filter values,
// while role data received from the API uses the dotted format (e.g. django.superuser).
const GLOBAL_ROLE_FILTER_OPTIONS = [
  { value: 'super_admin', displayName: MAP_ROLE_KEY_TO_LABEL[SUPERUSER_ROLE] },
  { value: 'global_staff', displayName: MAP_ROLE_KEY_TO_LABEL[GLOBAL_STAFF_ROLE] },
];

export const getRolesFiltersOptions = (intl: IntlShape) => {
  const globalGroup = {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.global']),
    groupIcon: RESOURCE_ICONS.GLOBAL,
  };
  const contextGroups = {
    course: {
      groupName: intl.formatMessage(messages['authz.team.members.table.group.courses']),
      groupIcon: RESOURCE_ICONS.COURSE,
    },
    library: {
      groupName: intl.formatMessage(messages['authz.team.members.table.group.libraries']),
      groupIcon: RESOURCE_ICONS.LIBRARY,
    },
  };

  return [
    ...GLOBAL_ROLE_FILTER_OPTIONS.map((role) => ({ ...globalGroup, ...role })),
    ...allRolesMetadata.map((meta) => ({
      ...contextGroups[meta.contextType],
      displayName: meta.name,
      value: meta.role,
    })),
  ];
};
