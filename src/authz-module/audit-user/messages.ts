import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages(
  {
    'authz.user.table.role.column.header': {
      id: 'authz.user.table.role.column.header',
      defaultMessage: 'Role',
      description: 'Header for the role column in the user table',
    },
    'authz.user.table.organization.column.header': {
      id: 'authz.user.table.organization.column.header',
      defaultMessage: 'Organization',
      description: 'Header for the organization column in the user table',
    },
    'authz.user.table.scope.column.header': {
      id: 'authz.user.table.scope.column.header',
      defaultMessage: 'Scope',
      description: 'Header for the scope column in the user table',
    },
    'authz.user.table.permissions.column.header': {
      id: 'authz.user.table.permissions.column.header',
      defaultMessage: 'Permissions',
      description: 'Header for the permissions column in the user table',
    },
    'authz.user.table.action.column.header': {
      id: 'authz.user.table.action.column.header',
      defaultMessage: 'Actions',
      description: 'Header for the actions column in the user table',
    },
    'authz.user.table.view_all_permissions.link.text': {
      id: 'authz.user.table.view_all_permissions.link.text',
      defaultMessage: 'View all permissions',
      description: 'Text for the link to view all permissions in the user table',
    },
    'authz.user.table.delete.action.alt': {
      id: 'authz.user.table.delete.action.alt',
      defaultMessage: 'Delete role action',
      description: 'Alt description for delete button',
    },
    'authz.user.table.permissions.available.count': {
      id: 'authz.user.table.permissions.available.count',
      defaultMessage: '{count, plural, one {# permission available} other {# permissions available}}',
      description: 'Text showing the number of permissions available, with proper pluralization',
    },
    'authz.user.table.delete.action.djangorole.tooltip': {
      id: 'authz.user.table.delete.action.djangorole.tooltip',
      defaultMessage: 'You can’t remove this role here. Please go to Django Admin to manage it.',
      description: 'Tooltip for delete button when hovering over Django roles',
    },
  },
);

export default messages;
