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
  'authz.anchor.button.alt': {
    id: 'authz.anchor.button.alt',
    defaultMessage: 'Scroll to top',
    description: 'Alt text for the scroll to top anchor button',
  },
});

export default messages;
