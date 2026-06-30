import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';
import { useNavigate } from 'react-router-dom';

import baseMessages from '@src/authz-module/messages';
import { buildWizardPath } from '@src/authz-module/constants';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from '../roles-permissions';

interface AddRoleButtonProps {
  presetUsername?: string;
  from?: string;
}

const AddRoleButton = ({ presetUsername, from }: AddRoleButtonProps) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const { data: permissionValidationResponse } = useValidateUserPermissionsNonSuspense([
    { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM },
    { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM },
  ]);
  const canAssignRole = permissionValidationResponse?.some((permission) => permission.allowed);

  const handleClick = () => {
    const path = buildWizardPath({ from, users: presetUsername });
    navigate(path);
  };

  return (
    canAssignRole ? (
      <Button
        iconBefore={Plus}
        onClick={handleClick}
      >
        {intl.formatMessage(baseMessages['authz.management.assign.role.title'])}
      </Button>
    ) : null);
};

export default AddRoleButton;
