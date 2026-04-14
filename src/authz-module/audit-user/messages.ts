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
  },
);

export default messages;
