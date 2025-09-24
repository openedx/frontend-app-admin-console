import { useSuspenseQuery } from "@tanstack/react-query";
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getApiUrl } from './utils';

export interface PermissionValidationRequest {
    action: string;
    object?: string;
    scope?: string;
}

export interface PermissionValidationResponse extends PermissionValidationRequest{
    allowed: boolean;
}

const validateUserPermissions = async (validations: PermissionValidationRequest[]): Promise<PermissionValidationResponse[]> => {
  const { data } = await getAuthenticatedHttpClient().post(getApiUrl(`/api/authz/v1/permissions/validate/me`), validations);
  return data;
};


/**
 * React Query hook to validate if the current user has permissions over a certain object in the instance.
 * It  helps to:
 * - Determine whether the current user can access certain object.
 * - Provide role-based rendering logic for UI components.
 *
 * @param permissions - The array of objects and actions to validate.
 *
 * @example
 * const { data } = useValidateTeamMember([{
           "action": "act:read",
           "object": "lib:test-lib",
           "scope": "org:OpenedX"
       }]);
 * if (data[0].allowed) { ... }
 *
 */
export const useValidateUserPermissions = (permissions: PermissionValidationRequest[])  => {
  return useSuspenseQuery<PermissionValidationResponse[], Error>({
    queryKey: ['validate-user-permissions', permissions],
    queryFn: () => validateUserPermissions(permissions),
    retry: false,
  });
}