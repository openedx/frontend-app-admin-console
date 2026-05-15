import type { IntlShape } from '@edx/frontend-platform/i18n';
import { PutAssignTeamMembersRoleResponse } from '@src/authz-module/data/api';
import { ROLE_ASSIGNMENT_ERRORS } from './constants';
import messages from './messages';

type RoleAssignmentError = PutAssignTeamMembersRoleResponse['errors'][number];

export const formatRoleAssignmentError = (
  intl: IntlShape,
  e: RoleAssignmentError,
): string => {
  const params = { userIdentifier: e.userIdentifier, scope: e.scope };
  if (e.error === ROLE_ASSIGNMENT_ERRORS.USER_ALREADY_HAS_ROLE) {
    return intl.formatMessage(messages['wizard.save.error.user_already_has_role'], params);
  }
  if (e.error === ROLE_ASSIGNMENT_ERRORS.USER_NOT_FOUND) {
    return intl.formatMessage(messages['wizard.save.error.user_not_found'], params);
  }
  if (e.error === ROLE_ASSIGNMENT_ERRORS.ROLE_ASSIGNMENT_ERROR) {
    return intl.formatMessage(messages['wizard.save.error.role_assignment_error'], params);
  }
  return intl.formatMessage(messages['wizard.save.error.default'], { ...params, error: e.error });
};
