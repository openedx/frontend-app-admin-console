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
    // Aggregate scope labels. Shared: the wizard offers these scopes when assigning a
    // role, and the team members table names them when displaying one already assigned.
    'authz.scope.aggregate.platform.course': {
      id: 'authz.scope.aggregate.platform.course',
      defaultMessage: 'All courses on the platform',
      description: 'Label for the scope covering every course on the platform',
    },
    'authz.scope.aggregate.platform.library': {
      id: 'authz.scope.aggregate.platform.library',
      defaultMessage: 'All libraries on the platform',
      description: 'Label for the scope covering every library on the platform',
    },
    'authz.scope.aggregate.org.course': {
      id: 'authz.scope.aggregate.org.course',
      defaultMessage: 'All courses in this organization',
      description: 'Label for the scope covering every course within one organization',
    },
    'authz.scope.aggregate.org.library': {
      id: 'authz.scope.aggregate.org.library',
      defaultMessage: 'All libraries in this organization',
      description: 'Label for the scope covering every library within one organization',
    },
    'authz.team.toast.retry.label': {
      id: 'authz.team.toast.retry.label',
      defaultMessage: 'Retry',
      description: 'Label for retry button.',
    },
  },
);

export default messages;
