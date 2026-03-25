import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'library.authz.manage.page.title': {
    id: 'library.authz.manage.page.title',
    defaultMessage: 'Library Team Management',
    description: 'Libraries AuthZ page title',
  },
  'library.authz.breadcrumb.root': {
    id: 'library.authz.breadcrumb.root',
    defaultMessage: 'Manage Access',
    description: 'Libraries AuthZ root breadcrumb',
  },
  'library.authz.tabs.team': {
    id: 'library.authz.tabs.team',
    defaultMessage: 'Team Members',
    description: 'Libraries AuthZ title for the team management tab',
  },
  'library.authz.tabs.roles': {
    id: 'library.authz.tabs.roles',
    defaultMessage: 'Roles',
    description: 'Libraries AuthZ title for the roles tab',
  },
  'library.authz.tabs.permissions': {
    id: 'library.authz.tabs.permissions',
    defaultMessage: 'Permissions',
    description: 'Libraries AuthZ title for the permissions tab',
  },
  'library.authz.tabs.permissionsRoles': {
    id: 'library.authz.tabs.permissionsRoles',
    defaultMessage: 'Roles and Permissions',
    description: 'Libraries AuthZ title for the permissions and roles tab',
  },
  'library.authz.tabs.permissionsRoles.courses.alert.title': {
    id: 'library.authz.tabs.permissionsRoles.courses.alert.title',
    defaultMessage: 'Course Roles',
    description: 'Libraries AuthZ title for the course roles alert',
  },
  'library.authz.tabs.permissionsRoles.courses.tab': {
    id: 'library.authz.tabs.permissionsRoles.courses.tab',
    defaultMessage: 'Courses',
    description: 'Libraries AuthZ title for the course roles tab',
  },
  'library.authz.tabs.permissionsRoles.libraries.tab': {
    id: 'library.authz.tabs.permissionsRoles.libraries.tab',
    defaultMessage: 'Libraries',
    description: 'Libraries AuthZ title for the libraries roles tab',
  },
  'library.authz.tabs.permissionsRoles.courses.alert.description': {
    id: 'library.authz.tabs.permissionsRoles.courses.alert.description',
    defaultMessage: 'This list shows the permissions currently available in Authoring Studio. Some roles may grant additional permissions manages outside this interface.',
    description: 'Libraries AuthZ description for the course roles alert',
  },
  'library.authz.tabs.permissionsRoles.courses.alert.link': {
    id: 'library.authz.tabs.permissionsRoles.courses.alert.link',
    defaultMessage: 'See full documentation',
    description: 'Libraries AuthZ link for the course roles alert',
  },
  'library.authz.team.remove.user.toast.success.description': {
    id: 'library.authz.team.remove.user.toast.success.description',
    defaultMessage: 'The {role} role has been successfully removed.{rolesCount, plural, =0 { The user no longer has access to this library and has been removed from the member list.} other {}}',
    description: 'Libraries team management remove user toast success',
  },
  'library.authz.team.toast.default.error.message': {
    id: 'library.authz.team.toast.default.error.message',
    defaultMessage: '<Bold>Something went wrong on our end.</Bold> <Br></Br>Please try again later.',
    description: 'Libraries default error message',
  },
  'library.authz.team.toast.500.error.message': {
    id: 'library.authz.team.toast.500.error.message',
    defaultMessage: '<Bold>We\'re experiencing technical difficulties.</Bold> <Br></Br>Please try again later.',
    description: 'Libraries internal server error message',
  },
  'library.authz.team.toast.502.error.message': {
    id: 'library.authz.team.toast.502.error.message',
    defaultMessage: '<Bold>We\'re having trouble connecting to our services.</Bold> <Br></Br>Please try again later.',
    description: 'Libraries bad gateway error message',
  },
  'library.authz.team.toast.503.error.message': {
    id: 'library.authz.team.toast.503.error.message',
    defaultMessage: '<Bold>The service is temporarily unavailable.</Bold> <Br></Br>Please try again in a few moments.',
    description: 'Libraries service temporary unavailable message',
  },
  'library.authz.team.toast.408.error.message': {
    id: 'library.authz.team.toast.408.error.message',
    defaultMessage: '<Bold>The request took too long.</Bold> <Br></Br>Please check your connection and try again.',
    description: 'Libraries request timeout message',
  },
  'library.authz.team.toast.retry.label': {
    id: 'library.authz.team.toast.retry.label',
    defaultMessage: 'Retry',
    description: 'Label for retry button.',
  },
});

export default messages;
