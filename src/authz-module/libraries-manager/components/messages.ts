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
  'libraries.authz.manage.add.member.title': {
    id: 'libraries.authz.manage.add.member.title',
    defaultMessage: 'Add New Team Member',
    description: 'Title for the add new team member modal',
  },
  'libraries.authz.manage.add.member.users.label': {
    id: 'libraries.authz.manage.add.member.users.label',
    defaultMessage: 'Add users by username or email',
    description: 'Label for the users input field in the add new team member modal',
  },
  'libraries.authz.manage.add.member.roles.label': {
    id: 'libraries.authz.manage.add.member.roles.label',
    defaultMessage: 'Roles',
    description: 'Label for the roles select field in the add new team member modal',
  },
  'libraries.authz.manage.add.member.invalid.users': {
    id: 'libraries.authz.manage.add.member.invalid.users',
    defaultMessage: 'The following users could not be found:',
    description: 'Error message for invalid users in the add new team member modal',
  },
  'libraries.authz.manage.add.member.select.default': {
    id: 'libraries.authz.manage.add.member.select.default',
    defaultMessage: 'Select a role',
    description: 'Default option for the roles select field in the add new team member modal',
  },
  'libraries.authz.manage.cancel.button': {
    id: 'libraries.authz.manage.cancel.button',
    defaultMessage: 'Cancel',
    description: 'Libraries AuthZ cancel button title',
  },
  'libraries.authz.manage.saving.button': {
    id: 'libraries.authz.manage.saving.button',
    defaultMessage: 'Saving...',
    description: 'Libraries AuthZ saving button title',
  },
  'libraries.authz.manage.save.button': {
    id: 'libraries.authz.manage.save.button',
    defaultMessage: 'Save',
    description: 'Libraries AuthZ save button title',
  },
  'libraries.authz.manage.add.member.description': {
    id: 'libraries.authz.manage.add.member.description',
    defaultMessage: 'Add new members to this library\'s team and assign them a role to define their permissions.',
    description: 'Description for the add new team member modal',
  },
  'libraries.authz.manage.add.member.success': {
    id: 'libraries.authz.manage.add.member.success',
    defaultMessage: '{count, plural, one {# team member added successfully.} other {# team members added successfully.}}',
    description: 'Success message when adding new team members',
  },
  'libraries.authz.manage.add.member.failure': {
    id: 'libraries.authz.manage.add.member.failure',
    defaultMessage: 'We couldn\'t find a user for {count, plural, one {# email address or username.} other {# email addresses or usernames.}} Please check the values and try again, or invite them to join your organization first.',
    description: 'Error message when adding new team members',
  },
});

export default messages;
