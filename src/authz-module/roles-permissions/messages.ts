import { defineMessages } from '@openedx/frontend-base';

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
  'authz.tabs.permissionsRoles.loading': {
    id: 'authz.tabs.permissionsRoles.loading',
    defaultMessage: 'Loading roles and permissions',
    description: 'Libraries AuthZ screen reader text while the roles and permissions are loading',
  },
  'authz.tabs.permissionsRoles.error': {
    id: 'authz.tabs.permissionsRoles.error',
    defaultMessage: 'The roles and permissions could not be loaded. Please try again later.',
    description: 'Libraries AuthZ message shown when the roles and permissions fail to load',
  },
  'authz.roles.table.search.placeholder': {
    id: 'authz.roles.table.search.placeholder',
    defaultMessage: 'Search',
    description: 'Placeholder of the search input in the roles table',
  },
  'authz.roles.table.showing.roles.text': {
    id: 'authz.roles.table.showing.roles.text',
    defaultMessage: 'Showing {pageSize, plural, one {# role} other {# roles}} of {itemCount}.',
    description: 'Text stating how many roles are listed on the current page out of the total count',
  },
  'authz.roles.table.column.role.title': {
    id: 'authz.roles.table.column.role.title',
    defaultMessage: 'Role',
    description: 'Header of the role name column in the roles table',
  },
  'authz.roles.table.column.resource.type.title': {
    id: 'authz.roles.table.column.resource.type.title',
    defaultMessage: 'Type of resource',
    description: 'Header of the resource type column in the roles table, also used as the filter button text',
  },
  'authz.roles.table.column.members.title': {
    id: 'authz.roles.table.column.members.title',
    defaultMessage: 'Members',
    description: 'Header of the members count column in the roles table',
  },
  'authz.roles.table.column.permissions.title': {
    id: 'authz.roles.table.column.permissions.title',
    defaultMessage: 'Permissions',
    description: 'Header of the permissions column in the roles table',
  },
  'authz.roles.table.column.last.updated.title': {
    id: 'authz.roles.table.column.last.updated.title',
    defaultMessage: 'Last updated',
    description: 'Header of the last updated column in the roles table',
  },
  'authz.roles.table.column.actions.title': {
    id: 'authz.roles.table.column.actions.title',
    defaultMessage: 'Actions',
    description: 'Header of the actions column in the roles table',
  },
  'authz.roles.table.resource.type.courses': {
    id: 'authz.roles.table.resource.type.courses',
    defaultMessage: 'Courses',
    description: 'Label for roles that apply to courses',
  },
  'authz.roles.table.resource.type.libraries': {
    id: 'authz.roles.table.resource.type.libraries',
    defaultMessage: 'Libraries',
    description: 'Label for roles that apply to libraries',
  },
  'authz.roles.table.custom.role.label': {
    id: 'authz.roles.table.custom.role.label',
    defaultMessage: 'Custom Role',
    description: 'Label shown under the name of a role created by the user',
  },
  'authz.roles.table.permissions.granted': {
    id: 'authz.roles.table.permissions.granted',
    defaultMessage: '{count} Granted',
    description: 'Number of permissions granted by a role',
  },
  'authz.roles.table.action.view.alt': {
    id: 'authz.roles.table.action.view.alt',
    defaultMessage: 'View role',
    description: 'Accessible label of the button that opens a built-in role',
  },
  'authz.roles.table.action.edit.alt': {
    id: 'authz.roles.table.action.edit.alt',
    defaultMessage: 'Edit role',
    description: 'Accessible label of the button that edits a custom role',
  },
  'authz.roles.table.action.more.alt': {
    id: 'authz.roles.table.action.more.alt',
    defaultMessage: 'More actions',
    description: 'Accessible label of the menu with more actions for a role',
  },
  'authz.roles.table.action.duplicate': {
    id: 'authz.roles.table.action.duplicate',
    defaultMessage: 'Duplicate',
    description: 'Menu item that duplicates a role',
  },
  'authz.roles.table.action.assign': {
    id: 'authz.roles.table.action.assign',
    defaultMessage: 'Assign role',
    description: 'Menu item that assigns a role to users',
  },
  'authz.roles.table.empty': {
    id: 'authz.roles.table.empty',
    defaultMessage: 'No roles found.',
    description: 'Message shown in the roles table when there are no roles, or none match the search and filters',
  },
  'authz.roles.table.filter.remove.alt': {
    id: 'authz.roles.table.filter.remove.alt',
    defaultMessage: 'Remove {filter} filter',
    description: 'Accessible label of the button that removes an applied filter chip in the roles table',
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
