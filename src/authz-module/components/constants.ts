import { IntlShape } from '@edx/frontend-platform/i18n';
import { Language, LibraryBooks, School } from '@openedx/paragon/icons';
import messages from './messages';

export const getRolesFiltersOptions = (intl: IntlShape) => [
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.global']),
    groupIcon: Language,
    displayName: 'Super Admin',
    value: 'super_admin',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.global']),
    groupIcon: Language,
    displayName: 'Global Staff',
    value: 'global_staff',
  },

  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.courses']),
    groupIcon: School,
    displayName: 'Course Admin',
    value: 'course_admin',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.courses']),
    groupIcon: School,
    displayName: 'Course Staff',
    value: 'course_staff',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.courses']),
    groupIcon: School,
    displayName: 'Course Editor',
    value: 'course_editor',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.courses']),
    groupIcon: School,
    displayName: 'Course Auditor',
    value: 'course_auditor',
  },

  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.libraries']),
    groupIcon: LibraryBooks,
    displayName: 'Library Admin',
    value: 'library_admin',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.libraries']),
    groupIcon: LibraryBooks,
    displayName: 'Library Author',
    value: 'library_author',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.libraries']),
    groupIcon: LibraryBooks,
    displayName: 'Library Contributor',
    value: 'library_contributor',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.libraries']),
    groupIcon: LibraryBooks,
    displayName: 'Library User',
    value: 'library_user',
  },
];

export const RESOURCE_ICONS = {
  COURSE: School,
  LIBRARY: LibraryBooks,
  GLOBAL: Language,
};
