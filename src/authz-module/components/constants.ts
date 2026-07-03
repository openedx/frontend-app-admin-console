import { IntlShape } from '@edx/frontend-platform/i18n';
import { Language, LibraryBooks, School } from '@openedx/paragon/icons';
import messages from './messages';

export const getRolesFiltersOptions = (intl: IntlShape) => [
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.global']),
    groupIcon: Language,
    displayName: 'Super Admin',
    value: 'super_admin',
    contextType: 'global',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.global']),
    groupIcon: Language,
    displayName: 'Global Staff',
    value: 'global_staff',
    contextType: 'global',
  },

  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.courses']),
    groupIcon: School,
    displayName: 'Course Admin',
    value: 'course_admin',
    contextType: 'course',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.courses']),
    groupIcon: School,
    displayName: 'Course Staff',
    value: 'course_staff',
    contextType: 'course',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.courses']),
    groupIcon: School,
    displayName: 'Course Editor',
    value: 'course_editor',
    contextType: 'course',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.courses']),
    groupIcon: School,
    displayName: 'Course Auditor',
    value: 'course_auditor',
    contextType: 'course',
  },

  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.libraries']),
    groupIcon: LibraryBooks,
    displayName: 'Library Admin',
    value: 'library_admin',
    contextType: 'library',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.libraries']),
    groupIcon: LibraryBooks,
    displayName: 'Library Author',
    value: 'library_author',
    contextType: 'library',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.libraries']),
    groupIcon: LibraryBooks,
    displayName: 'Library Contributor',
    value: 'library_contributor',
    contextType: 'library',
  },
  {
    groupName: intl.formatMessage(messages['authz.team.members.table.group.libraries']),
    groupIcon: LibraryBooks,
    displayName: 'Library User',
    value: 'library_user',
    contextType: 'library',
  },
];

export const RESOURCE_ICONS = {
  COURSE: School,
  LIBRARY: LibraryBooks,
  GLOBAL: Language,
};
