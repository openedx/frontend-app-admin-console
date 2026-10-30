import { useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';

import baseMessages from '@src/authz-module/messages';
import AssignRoleWizardModal from '@src/authz-module/role-assignation-wizard/AssignRoleWizardModal';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { MANAGE_TEAM_PERMISSIONS } from '@src/authz-module/roles-permissions';

interface AddRoleButtonProps {
  presetUsername?: string;
}

/**
 * Header action that opens the role assignation wizard.
 *
 * The wizard is a full-screen modal rather than a page, so the trigger hosts it: that
 * keeps the admin on the page they started from, and keeps the permission check that
 * decides whether assigning is possible at all in one place.
 */
const AddRoleButton = ({ presetUsername }: AddRoleButtonProps) => {
  const intl = useIntl();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const { data: permissionValidationResponse } = useValidateUserPermissionsNonSuspense(MANAGE_TEAM_PERMISSIONS);
  const canAssignRole = permissionValidationResponse?.some((permission) => permission.allowed);

  if (!canAssignRole) {
    return null;
  }

  return (
    <>
      <Button
        size="sm"
        iconBefore={Plus}
        onClick={() => setIsWizardOpen(true)}
      >
        {intl.formatMessage(baseMessages['authz.management.assign.role.title'])}
      </Button>
      <AssignRoleWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        initialUsers={presetUsername}
      />
    </>
  );
};

export default AddRoleButton;
