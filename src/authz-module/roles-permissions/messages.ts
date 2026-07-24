import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'authz.tabs.permissions': {
    id: 'authz.tabs.permissions',
    defaultMessage: 'Permissions',
    description: 'Libraries AuthZ title for the permissions tab',
  },
  'authz.tabs.permissionsRoles': {
    id: 'authz.tabs.permissionsRoles',
    defaultMessage: 'Roles and Permissions',
    description: 'Libraries AuthZ title for the permissions and roles tab',
  },
  'authz.tabs.permissionsRoles.courses.alert.title': {
    id: 'authz.tabs.permissionsRoles.courses.alert.title',
    defaultMessage: 'Course Roles',
    description: 'Libraries AuthZ title for the course roles alert',
  },
  'authz.tabs.permissionsRoles.courses.tab': {
    id: 'authz.tabs.permissionsRoles.courses.tab',
    defaultMessage: 'Courses',
    description: 'Libraries AuthZ title for the course roles tab',
  },
  'authz.tabs.permissionsRoles.libraries.tab': {
    id: 'authz.tabs.permissionsRoles.libraries.tab',
    defaultMessage: 'Libraries',
    description: 'Libraries AuthZ title for the libraries roles tab',
  },
  'authz.tabs.permissionsRoles.libraries.tab.title': {
    id: 'authz.tabs.permissionsRoles.libraries.tab.title',
    defaultMessage: 'Library Roles',
    description: 'Libraries AuthZ title for the library roles table',
  },
  'authz.tabs.permissionsRoles.courses.tab.title': {
    id: 'authz.tabs.permissionsRoles.courses.tab.title',
    defaultMessage: 'Course Roles',
    description: 'Libraries AuthZ title for the course roles table',
  },
  'authz.tabs.permissionsRoles.courses.alert.note': {
    id: 'authz.tabs.permissionsRoles.courses.alert.note',
    defaultMessage: 'Note:',
    description: 'Libraries AuthZ note for the course roles alert',
  },
  'authz.tabs.permissionsRoles.courses.alert.description': {
    id: 'authz.tabs.permissionsRoles.courses.alert.description',
    defaultMessage: 'This list shows the permissions currently available in Authoring Studio. Some roles may grant additional permissions managed outside this interface.',
    description: 'Libraries AuthZ description for the course roles alert',
  },
  'authz.tabs.permissionsRoles.courses.alert.link': {
    id: 'authz.tabs.permissionsRoles.courses.alert.link',
    defaultMessage: 'See full documentation',
    description: 'Libraries AuthZ link for the course roles alert',
  },
  'authz.team.remove.user.toast.success.description': {
    id: 'authz.team.remove.user.toast.success.description',
    defaultMessage: 'The {role} role has been successfully removed.{rolesCount, plural, =0 { The user no longer has access to this library and has been removed from the member list.} other {}}',
    description: 'Libraries team management remove user toast success',
  },
  'authz.team.toast.default.error.message': {
    id: 'authz.team.toast.default.error.message',
    defaultMessage: '<Bold>Something went wrong on our end.</Bold> <Br></Br>Please try again later.',
    description: 'Libraries default error message',
  },
});

export default messages;
