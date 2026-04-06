import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { PermissionValidationRequest, PermissionValidationResponse } from '@src/types';
import { camelCaseObject } from '@edx/frontend-platform';
import { getApiUrl } from './utils';
import { UserAccount } from './types';

export const validateUserPermissions = async (
  validations: PermissionValidationRequest[],
): Promise<PermissionValidationResponse[]> => {
  const { data } = await getAuthenticatedHttpClient().post(getApiUrl('/api/authz/v1/permissions/validate/me'), validations);
  return data;
};

export const getUserAccount = async (username: string): Promise<UserAccount> => {
  const url = new URL(getApiUrl(`/api/user/v1/accounts/${username}`));
  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data);
};
