import { useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';

import baseMessages from '@src/authz-module/messages';
import AssignRoleWizard from '@src/authz-module/role-assignation-wizard/AssignRoleWizard';
import useAssignableRoleGroups from '@src/authz-module/role-assignation-wizard/hooks/useAssignableRoleGroups';

interface AddRoleButtonProps {
  presetUsername?: string;
}

/**
 * Opens the role assignation wizard, hosting it so the admin stays on the current page.
 * `useAssignableRoleGroups` answers both whether this button shows and which roles the
 * wizard may offer, which keeps the wizard free of data concerns.
 *
 * The wizard is mounted only while open, never hidden: each opening gets its own state
 * and its own request state
 */
const AddRoleButton = ({ presetUsername }: AddRoleButtonProps) => {
  const intl = useIntl();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const {
    canAssignRole, roleGroups, isLoading: isLoadingRoles, isError: isRolesError,
  } = useAssignableRoleGroups();

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
      {isWizardOpen && (
        <AssignRoleWizard
          isOpen
          onClose={() => setIsWizardOpen(false)}
          initialUsers={presetUsername}
          roleGroups={roleGroups}
          isLoadingRoles={isLoadingRoles}
          isRolesError={isRolesError}
        />
      )}
    </>
  );
};

export default AddRoleButton;
