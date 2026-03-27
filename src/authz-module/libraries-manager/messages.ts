import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'library.authz.manage.page.title': {
    id: 'library.authz.manage.page.title',
    defaultMessage: 'Library Team Management',
    description: 'Libreries AuthZ page title',
  },
  'library.authz.breadcrumb.root': {
    id: 'library.authz.breadcrumb.root',
    defaultMessage: 'Manage Access',
    description: 'Libreries AuthZ root breafcrumb',
  },
  'library.authz.tabs.team': {
    id: 'library.authz.tabs.team',
    defaultMessage: 'Team Members',
    description: 'Libreries AuthZ title for the team management tab',
  },
  'library.authz.tabs.roles': {
    id: 'library.authz.tabs.roles',
    defaultMessage: 'Roles',
    description: 'Libreries AuthZ title for the roles tab',
  },
  'library.authz.tabs.permissions': {
    id: 'library.authz.tabs.permissions',
    defaultMessage: 'Permissions',
    description: 'Libreries AuthZ title for the permissions tab',
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
    description: 'Libraries bad getaway error message',
  },
  'library.authz.team.toast.503.error.message': {
    id: 'library.authz.team.toast.503.error.message',
    defaultMessage: '<Bold>The service is temporarily unavailable.</Bold> <Br></Br>Please try again in a few moments.',
    description: 'Libraries service temporary unabailable message',
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
