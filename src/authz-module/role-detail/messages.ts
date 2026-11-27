import { defineMessages } from '@openedx/frontend-base';

const messages = defineMessages({
  'authz.custom.role.load.error': {
    id: 'authz.custom.role.load.error',
    defaultMessage: 'The role could not be loaded. Please try again later.',
    description: 'Message shown on the role detail page when the roles catalog fails to load',
  },
  'authz.custom.role.more.name.alt': {
    id: 'authz.custom.role.more.name.alt',
    defaultMessage: 'More actions',
    description: 'Accessible label for the more button that opens a menu with more actions for the custom role',
  },
  'authz.custom.role.tabs.members': {
    id: 'authz.custom.role.tabs.members',
    defaultMessage: 'Members',
    description: 'Label for the "Members" tab on the role detail page',
  },
  'authz.custom.role.tabs.permissions': {
    id: 'authz.custom.role.tabs.permissions',
    defaultMessage: 'Permissions',
    description: 'Label for the "Permissions" tab on the role detail page',
  },
  'authz.custom.role.tabs.comparison': {
    id: 'authz.custom.role.tabs.comparison',
    defaultMessage: 'Role comparison',
    description: 'Label for the "Role comparison" tab on the role detail page',
  },
  'authz.custom.role.members.table.column.header.username': {
    id: 'authz.custom.role.members.table.column.header.username',
    defaultMessage: 'Username',
    description: 'Header for the "Username" column in the members table',
  },
  'authz.custom.role.members.table.column.header.email': {
    id: 'authz.custom.role.members.table.column.header.email',
    defaultMessage: 'Email',
    description: 'Header for the "Email" column in the members table',
  },
  'authz.custom.role.members.table.column.header.scope': {
    id: 'authz.custom.role.members.table.column.header.scope',
    defaultMessage: 'Scope',
    description: 'Header for the "Scope" column in the members table',
  },
  'authz.custom.role.members.table.column.header.actions': {
    id: 'authz.custom.role.members.table.column.header.actions',
    defaultMessage: 'Actions',
    description: 'Header for the "Actions" column in the members table',
  },
  'authz.custom.role.members.table.showing.message': {
    id: 'authz.custom.role.members.table.showing.message',
    defaultMessage: 'Showing {pageSize} assignments of {itemCount}',
    description: 'Message displayed in the footer and in the control bar of the role members table. Each row is one assignment of the role (a user in one scope), so it counts assignments, not users.',
  },
  'authz.role.members.table.action.view.alt': {
    id: 'authz.role.members.table.action.view.alt',
    defaultMessage: 'View member details for {username}',
    description: 'Accessible label for the view button in the members table',
  },
  'authz.role.members.table.action.delete.alt': {
    id: 'authz.role.members.table.action.delete.alt',
    defaultMessage: 'Remove {username} from role',
    description: 'Accessible label for the delete button in the members table',
  },
  'authz.custom.role.action.duplicate': {
    id: 'authz.custom.role.action.duplicate',
    defaultMessage: 'Duplicate',
    description: 'Menu item to duplicate a custom role',
  },
  'authz.custom.role.action.delete': {
    id: 'authz.custom.role.action.delete',
    defaultMessage: 'Delete',
    description: 'Menu item to delete a custom role',
  },
  'authz.custom.role.last.updated': {
    id: 'authz.custom.role.last.updated',
    defaultMessage: 'Last updated: {date}',
    description: 'Date and time a custom role was last updated, shown next to its resource type',
  },
  'authz.custom.role.members.changes.warning': {
    id: 'authz.custom.role.members.changes.warning',
    defaultMessage: 'This role is assigned to {count, plural, one {{formattedCount} team member} other {{formattedCount} team members}}. Any permission changes will apply to them immediately.',
    description: 'Warning on a custom role that permission changes reach its members right away. formattedCount is count padded to two digits, e.g. 05.',
  },
  'authz.custom.role.members.table.empty': {
    id: 'authz.custom.role.members.table.empty',
    defaultMessage: 'No users assigned to this role',
    description: 'Message displayed when the members table is empty',
  },
});

export default messages;
