import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'authz.role.card.permission.for.role.status.granted': {
    id: 'authz.role.card.permission.for.role.status.granted',
    defaultMessage: 'Permission granted in {roleName} role',
    description: 'Label for granted status of a permission in the permissions table',
  },
  'authz.role.card.permission.for.role.status.not.granted': {
    id: 'authz.role.card.permission.for.role.status.not.granted',
    defaultMessage: 'Permission not granted in {roleName} role',
    description: 'Label for not granted status of a permission in the permissions table',
  },
  'authz.role.card.permission.for.role.status.disabled': {
    id: 'authz.role.card.permission.for.role.status.disabled',
    defaultMessage: 'We are expanding our permissions system. This role is currently unavailable but will be part of an upcoming update.',
    description: 'Tooltip message for disabled roles in the permissions table',
  },
  'authz.anchor.button.alt': {
    id: 'authz.anchor.button.alt',
    defaultMessage: 'Scroll to top',
    description: 'Alt text for the scroll to top anchor button',
  },
  'authz.table.controlbar.clearFilters': {
    id: 'authz.table.controlbar.clearFilters',
    defaultMessage: 'Clear filters',
    description: 'Button to clear all active filters in the table',
  },
  'authz.user.table.org.all.organizations.label': {
    id: 'authz.user.table.org.all.organizations.label',
    defaultMessage: 'All Organizations',
    description: 'Label for the "All Organizations" message on the user assignments table when a user has a django managed role assigned.',
  },
  'authz.table.controlbar.search': {
    id: 'authz.table.controlbar.search',
    defaultMessage: 'Search',
    description: 'Search placeholder for two specific fields',
  },
  'authz.user.table.scope.global.label': {
    id: 'authz.user.table.scope.global.label',
    defaultMessage: 'Global',
    description: 'Label for the "Global" scope in the user assignments table when a user has a django managed role assigned.',
  },
  'authz.table.controlbar.search.by.fields': {
    id: 'authz.table.controlbar.search.by.fields',
    defaultMessage: 'Search by {firstField} or {secondField}',
    description: 'Search placeholder for two specific fields',
  },
  'authz.table.controlbar.filterby.label': {
    id: 'authz.table.controlbar.filterby.label',
    defaultMessage: 'Filtered by: ',
    description: 'Label for active filters in the table',
  },
  'authz.table.controlbar.filters.limit.reached': {
    id: 'authz.table.controlbar.filters.limit.reached',
    defaultMessage: '10 filter limit reached. Remove one of the applied filters so you can select another one.',
    description: 'Message displayed when the user reaches the applied filters limit',
  },
  'authz.table.controlbar.filters.items.showing': {
    id: 'authz.table.controlbar.filters.limit.reached',
    defaultMessage: 'Showing {current} of {total}.',
    description: 'Message displayed when the user reaches the applied filters limit',
  },
  'authz.table.footer.items.showing.text': {
    id: 'authz.table.footer.items.showing.text',
    defaultMessage: 'Showing {pageSize} of {itemCount}.',
    description: 'Message displayed when the user reaches the applied filters limit',
  },
  'authz.table.username.current': {
    id: 'authz.table.username.current',
    defaultMessage: '(Me)',
    description: 'Indicates the current user in the team members table',
  },

  'authz.table.column.actions.view.title': {
    id: 'authz.table.column.actions.view.title',
    defaultMessage: 'View',
    description: 'Team members table view action text',
  },
  'authz.team.members.table.group.courses': {
    id: 'authz.team.members.table.group.courses',
    defaultMessage: 'Courses',
    description: 'Label for the "Courses" group in the team members table filters',
  },
  'authz.team.members.table.group.libraries': {
    id: 'authz.team.members.table.group.libraries',
    defaultMessage: 'Libraries',
    description: 'Label for the "Libraries" group in the team members table filters',
  },
  'authz.team.members.table.group.global': {
    id: 'authz.team.members.table.group.global',
    defaultMessage: 'Global',
    description: 'Label for the "Global" group in the team members table filters',
  },
});

export default messages;
