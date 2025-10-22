import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'library.authz.team.table.username': {
    id: 'library.authz.team.table.username',
    defaultMessage: 'Username',
    description: 'Libraries team management table username column header',
  },
  'library.authz.team.table.username.current': {
    id: 'library.authz.team.table.username.current',
    defaultMessage: ' (Me)',
    description: 'Libraries team management table indicative of current user',
  },
  'library.authz.team.table.email': {
    id: 'library.team.table.email',
    defaultMessage: 'Email',
    description: 'Libraries team management table email column header',
  },
  'library.authz.team.table.roles': {
    id: 'library.authz.team.table.roles',
    defaultMessage: 'Roles',
    description: 'Libraries team management table roles column header',
  },
  'library.authz.team.table.action': {
    id: 'library.authz.team.table.action',
    defaultMessage: 'Action',
    description: 'Libraries team management table action column header',
  },
  'authz.libraries.team.table.edit.action': {
    id: 'authz.libraries.team.table.edit.action',
    defaultMessage: 'Edit',
    description: 'Edit action',
  },
  'authz.libraries.team.table.search': {
    id: 'authz.libraries.team.table.search',
    defaultMessage: 'Search by {firstField} or {secondField}',
    description: 'Search placeholder for two specific fields',
  },
  'authz.libraries.team.table.sort.name-a-z': {
    id: 'authz.libraries.team.table.sort.name-a-z',
    defaultMessage: 'Name A-Z',
    description: 'Sort by name A-Z',
  },
  'authz.libraries.team.table.sort.name-z-a': {
    id: 'authz.libraries.team.table.sort.name-z-a',
    defaultMessage: 'Name Z-A',
    description: 'Sort by name Z-A',
  },
  'authz.libraries.team.table.clearFilters': {
    id: 'authz.libraries.team.table.clearFilters',
    defaultMessage: 'Clear filters',
    description: 'Button to clear all active filters in the table',
  },
});

export default messages;
