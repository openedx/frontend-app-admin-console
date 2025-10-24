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
  'library.authz.team.default.error.toast.message': {
    id: 'library.authz.team.default.error.toast.message',
    defaultMessage: '<b>Something went wrong on our end</b> <br></br> Please try again later.',
    description: 'Libraries team management remove user toast success',
  },
});

export default messages;
