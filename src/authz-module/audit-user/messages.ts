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
    'authz.user.table.permissions.total.access': {
      id: 'authz.user.table.permissions.total.access',
      defaultMessage: 'Total access',
      description: 'Label indicating Super Admin has total access to all permissions',
    },
    'authz.user.table.permissions.partial.access': {
      id: 'authz.user.table.permissions.partial.access',
      defaultMessage: 'Partial access',
      description: 'Label indicating Global Staff has partial access to permissions',
    },
    'authz.user.table.permissions.role.admin': {
      id: 'authz.user.table.permissions.role.admin',
      defaultMessage: 'Super Admins have full access to all areas of the platform, including content, settings, and user management. This role is managed at the platform level and cannot be changed from here. To modify it, go to Django Admin.',
      description: 'Description for the permissions of the Super Admin role',
    },
    'authz.user.table.permissions.role.staff': {
      id: 'authz.user.table.permissions.role.staff',
      defaultMessage: 'Global Staff have access to all areas of the platform, similar to Super Admin, but cannot grant or revoke Super Admin or Global Staff roles to other users. This role is managed at the platform level and cannot be changed from here. To modify it, go to Django Admin.',
      description: 'Description for the permissions of the Global Staff role',
    },
  },
);

export default messages;
