import type { IntlShape } from '@edx/frontend-platform/i18n';
import { PutAssignTeamMembersRoleResponse } from '@src/authz-module/data/api';
import { ROLE_ASSIGNMENT_ERRORS } from './constants';
import messages from './messages';

type RoleAssignmentError = PutAssignTeamMembersRoleResponse['errors'][number];

const KNOWN_ERRORS: string[] = Object.values(ROLE_ASSIGNMENT_ERRORS);

export const formatRoleAssignmentError = (
  intl: IntlShape,
  e: RoleAssignmentError,
): string => {
  const params = { userIdentifier: e.userIdentifier, scope: e.scope };
  if (KNOWN_ERRORS.includes(e.error)) {
    return intl.formatMessage(messages[`wizard.save.error.${e.error}`], params);
  }
  return intl.formatMessage(messages['wizard.save.error.default'], { ...params, error: e.error });
};
