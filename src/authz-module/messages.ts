import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages(
  {
    'authz.management.home.nav.link': {
      id: 'authz.management.home.nav.link',
      defaultMessage: 'Roles and Permissions Management',
      description: 'Text for the roles and permissions management home page title navigation link',
    },
    'authz.management.specific.user.nav.link': {
      id: 'authz.management.specific.user.nav.link',
      defaultMessage: 'Specific User',
      description: 'Text for the specific user page navigation link',
    },
    'authz.management.assign.role.title': {
      id: 'authz.management.assign.role.title',
      defaultMessage: 'Assign Role',
      description: 'Text for the assign role button',
    },
  },
);

export default messages;
