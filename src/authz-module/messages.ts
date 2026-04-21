import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages(
  {
    'authz.management.home.nav.link': {
      id: 'authz.management.home.nav.link',
      defaultMessage: 'Roles and Permissions Management',
      description: 'Text for the roles and permissions management home page title navigation link',
    },
    'authz.management.assign.role.title': {
      id: 'authz.management.assign.role.title',
      defaultMessage: 'Assign Role',
      description: 'Text for the assign role button',
    },
    'authz.team.toast.default.error.message': {
      id: 'authz.team.toast.default.error.message',
      defaultMessage: '<Bold>Something went wrong on our end.</Bold> <Br></Br>Please try again later.',
      description: 'Default error message',
    },
    'authz.team.remove.user.toast.success.description': {
      id: 'authz.team.remove.user.toast.success.description',
      defaultMessage: 'The {role} role has been successfully removed.{rolesCount, plural, =0 { The user no longer has access to this library and has been removed from the member list.} other {}}',
      description: 'Team management remove user toast success',
    },
    'authz.team.toast.500.error.message': {
      id: 'authz.team.toast.500.error.message',
      defaultMessage: '<Bold>We\'re experiencing technical difficulties.</Bold> <Br></Br>Please try again later.',
      description: 'Internal server error message',
    },
    'authz.team.toast.502.error.message': {
      id: 'authz.team.toast.502.error.message',
      defaultMessage: '<Bold>We\'re having trouble connecting to our services.</Bold> <Br></Br>Please try again later.',
      description: 'Bad gateway error message',
    },
    'authz.team.toast.503.error.message': {
      id: 'authz.team.toast.503.error.message',
      defaultMessage: '<Bold>The service is temporarily unavailable.</Bold> <Br></Br>Please try again in a few moments.',
      description: 'Service temporarily unavailable message',
    },
    'authz.team.toast.408.error.message': {
      id: 'authz.team.toast.408.error.message',
      defaultMessage: '<Bold>The request took too long.</Bold> <Br></Br>Please check your connection and try again.',
      description: 'Request timeout message',
    },
    'authz.team.toast.retry.label': {
      id: 'authz.team.toast.retry.label',
      defaultMessage: 'Retry',
      description: 'Label for retry button.',
    },
  },
);

export default messages;
