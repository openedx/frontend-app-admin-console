import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'authz.permissions.title': {
    id: 'authz.permissions.title',
    defaultMessage: 'Permissions',
    description: 'Title for the permissions section in the role card',
  },
  'authz.permissions.actions.create': {
    id: 'authz.permissions.actions.create',
    defaultMessage: 'Create {resource}',
    description: 'Default label for the create action',
  },
  'authz.permissions.actions.edit': {
    id: 'authz.permissions.actions.edit',
    defaultMessage: 'Edit {resource}',
    description: 'Default label for the edit action',
  },
  'authz.permissions.actions.import': {
    id: 'authz.permissions.actions.import',
    defaultMessage: 'Import {resource}',
    description: 'Default label for the import action',
  },
  'authz.permissions.actions.delete': {
    id: 'authz.permissions.actions.delete',
    defaultMessage: 'Delete {resource}',
    description: 'Default label for the delete action',
  },
  'authz.permissions.actions.manage': {
    id: 'authz.permissions.actions.manage',
    defaultMessage: 'Manage {resource}',
    description: 'Default label for the manage action',
  },
  'authz.permissions.actions.publish': {
    id: 'authz.permissions.actions.publish',
    defaultMessage: 'Publish {resource}',
    description: 'Default label for the publish action',
  },
  'authz.permissions.actions.view': {
    id: 'authz.permissions.actions.view',
    defaultMessage: 'View {resource}',
    description: 'Default label for the view action',
  },
  'authz.permissions.actions.reuse': {
    id: 'authz.permissions.actions.reuse',
    defaultMessage: 'Reuse {resource}',
    description: 'Default label for the reuse action',
  },
  'authz.role.card.delete.action.alt': {
    id: 'authz.role.card.delete.action.alt',
    defaultMessage: 'Delete role action',
    description: 'Alt description for delete button',
  },
  'authz.role.card.userCounter': {
    id: 'authz.role.card.userCounter',
    defaultMessage: 'Number of users with this role',
    description: 'Screen reader text for the user counter icon in the role card header',
  },
  'authz.role.card.permissions.ariaLabel': {
    id: 'authz.role.card.permissions.ariaLabel',
    defaultMessage: '{permissionName} permission is {permissionStatus}',
    description: 'Aria label for permission chips in the role card',
  },
  'authz.role.card.permissions.status.denied': {
    id: 'authz.role.card.permissions.status.denied',
    defaultMessage: 'denied',
    description: 'Label for denied status of a permission in the role card',
  },
  'authz.role.card.permissions.status.granted': {
    id: 'authz.role.card.permissions.status.granted',
    defaultMessage: 'granted',
    description: 'Label for granted status of a permission in the role card',
  },
});

export default messages;
