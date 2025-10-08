import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'error.page.title.noAccess': {
    id: 'error.page.tile.noAccess',
    defaultMessage: 'Access Denied',
    description: 'Title error when user does not have access to view',
  },
  'error.page.message.noAccess': {
    id: 'error.page.message.noAccess',
    defaultMessage: 'You do not have permission to view this page.',
    description: 'Error message when user does not have access to view',
  },
  'error.page.title.notFound': {
    id: 'error.page.tile.notFound',
    defaultMessage: 'Page Not Found',
    description: 'Error the resource is not found',
  },
  'error.page.message.notFound': {
    id: 'error.page.message.notFound',
    defaultMessage: 'The library you are looking for could not be found.',
    description: 'Error message when the resource is not found',
  },
  'error.page.title.server': {
    id: 'error.page.tile.server',
    defaultMessage: 'Something went wrong',
    description: 'Title for server error',
  },
  'error.page.message.server': {
    id: 'error.page.message.server.error',
    defaultMessage: 'We\'re experiencing an internal server problem. Please try again later',
    description: 'Server error message for unexpected errors',
  },
  'error.page.title.generic': {
    id: 'error.page.tile.generic',
    defaultMessage: 'Something went wrong',
    description: 'Title for unexpected error',
  },
  'error.page.message.generic': {
    id: 'error.page.message.server',
    defaultMessage: 'An unexpected error occurred. Please click the button below to refresh the page.',
    description: 'Error message for unexpected errors',
  },
  'error.page.action.reload': {
    id: 'error.page.action.reload',
    defaultMessage: 'Reload Page',
    description: 'Label for reload action',
  },
  'error.page.action.back': {
    id: 'error.page.action.back',
    defaultMessage: 'Back to Libraries',
    description: 'Label for return to libraries action',
  },
});

export default messages;
