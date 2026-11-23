import { useState } from 'react';
import type { ComponentProps } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';
import { PersonAdd } from '@openedx/paragon/icons';

import baseMessages from '@src/authz-module/messages';
import { AssignRoleWizard, useAssignableRoleGroups } from '@src/authz-module/role-assignation-wizard';

interface AddRoleButtonProps {
  presetUsername?: string;
  variant?: ComponentProps<typeof Button>['variant'];
}

/**
 * Opens the role assignation wizard, hosting it so the admin stays on the current page.
 * `useAssignableRoleGroups` answers both whether this button shows and which roles the
 * wizard may offer, which keeps the wizard free of data concerns.
 *
 * The wizard is mounted only while open, never hidden: each opening gets its own state
 * and its own request state
 */
const AddRoleButton = ({ presetUsername, variant = 'primary' }: AddRoleButtonProps) => {
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
        iconBefore={PersonAdd}
        onClick={() => setIsWizardOpen(true)}
        variant={variant}
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
