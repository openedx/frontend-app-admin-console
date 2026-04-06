import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'authz.role.card.permission.for.role.status.granted': {
    id: 'authz.role.card.permission.for.role.status.granted',
    defaultMessage: 'Permission granted in {roleName} role',
    description: 'Label for granted status of a permission in the permissions table',
  },
  'authz.role.card.permission.for.role.status.denied': {
    id: 'authz.role.card.permission.for.role.status.denied',
    defaultMessage: 'Permission denied in {roleName} role',
    description: 'Label for denied status of a permission in the permissions table',
  },
  'authz.table.footer.items.showing.text': {
    id: 'authz.table.footer.items.showing.text',
    defaultMessage: 'Showing {pageSize} of {itemCount} users.',
    description: 'Message displayed when the user reaches the applied filters limit',
  },
  'authz.table.controlbar.clearFilters': {
    id: 'authz.table.controlbar.clearFilters',
    defaultMessage: 'Clear filters',
    description: 'Button to clear all active filters in the table',
  },
  'authz.table.controlbar.search': {
    id: 'authz.table.controlbar.search',
    defaultMessage: 'Search',
    description: 'Search placeholder for two specific fields',
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
    id: 'authz.table.controlbar.filters.items.showing',
    defaultMessage: 'Showing {current} of {total}.',
    description: 'Message displayed when the user reaches the applied filters limit',
  },
});

export default messages;
