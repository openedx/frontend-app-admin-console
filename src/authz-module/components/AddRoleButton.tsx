import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';
import { useNavigate } from 'react-router-dom';

import baseMessages from '@src/authz-module/messages';
import { buildWizardPath } from '@src/authz-module/constants';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { MANAGE_TEAM_PERMISSIONS } from '../roles-permissions';

interface AddRoleButtonProps {
  presetUsername?: string;
  from?: string;
}

const AddRoleButton = ({ presetUsername, from }: AddRoleButtonProps) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const { data: permissionValidationResponse } = useValidateUserPermissionsNonSuspense(MANAGE_TEAM_PERMISSIONS);
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
