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
  'authz.team.remove.user.modal.title': {
    id: 'authz.team.remove.user.modal.title',
    defaultMessage: 'Remove role?',
    description: 'AuthZ team management remove user modal title',
  },
  'authz.manage.cancel.button': {
    id: 'authz.manage.cancel.button',
    defaultMessage: 'Cancel',
    description: 'AuthZ cancel button title',
  },
  'authz.manage.remove.button': {
    id: 'authz.manage.remove.button',
    defaultMessage: 'Remove',
    description: 'AuthZ remove button title',
  },
  'authz.manage.removing.button': {
    id: 'authz.manage.removing.button',
    defaultMessage: 'Removing...',
    description: 'AuthZ removing button title',
  },
  'authz.team.remove.user.modal.body.1': {
    id: 'authz.team.remove.user.modal.body.1',
    defaultMessage: 'Are you sure you want to remove the {role} role from the user “{userName}” in the scope {scope}?',
    description: 'AuthZ team management remove user modal body',
  },
  'authz.team.remove.user.modal.body.2': {
    id: 'authz.team.remove.user.modal.body.2',
    defaultMessage: "This is the user's only role in this scope. Removing it will revoke their access completely, and they will no longer appear in the scope's member list.",
    description: 'AuthZ team management remove user modal body',
  },
  'authz.team.remove.user.modal.body.3': {
    id: 'authz.team.remove.user.modal.body.3',
    defaultMessage: 'Are you sure you want to proceed?',
    description: 'AuthZ team management remove user modal body',
  },
});

export default messages;
