import { defineMessages } from '@openedx/frontend-base';

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
    // Aggregate scope labels, shared by every table that lists a scope beside its
    // organization. The scope column names only the kind of resource; the organization
    // column says how far it reaches. The wizard keeps its own, longer wording.
    'authz.scope.aggregate.course': {
      id: 'authz.scope.aggregate.course',
      defaultMessage: 'All courses',
      description: 'Scope column label for a role that covers every course, either across the platform or within one organization. The organization column shows which.',
    },
    'authz.scope.aggregate.library': {
      id: 'authz.scope.aggregate.library',
      defaultMessage: 'All libraries',
      description: 'Scope column label for a role that covers every library, either across the platform or within one organization. The organization column shows which.',
    },
    'authz.team.toast.retry.label': {
      id: 'authz.team.toast.retry.label',
      defaultMessage: 'Retry',
      description: 'Label for retry button.',
    },
  },
);

/** Aggregate scope labels keyed by the kind of resource the scope covers. */
export const AGGREGATE_SCOPE_LABELS = {
  course: messages['authz.scope.aggregate.course'],
  library: messages['authz.scope.aggregate.library'],
};

export default messages;
