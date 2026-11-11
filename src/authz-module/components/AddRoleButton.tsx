import { useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';

import baseMessages from '@src/authz-module/messages';
import AssignRoleWizard from '@src/authz-module/role-assignation-wizard/AssignRoleWizard';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import {
  MANAGE_TEAM_ACTIONS, MANAGE_TEAM_PERMISSIONS, SCOPE_TYPES,
} from '@src/authz-module/constants';
import { useAuthzCatalog } from '@src/authz-module/catalog';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';

interface AddRoleButtonProps {
  presetUsername?: string;
}

/**
 * Opens the role assignation wizard, hosting it so the admin stays on the current page.
 * One permissions query answers both whether this button shows and which roles the
 * wizard may offer, which keeps the wizard free of data concerns.
 *
 * The wizard is mounted only while open, never hidden: each opening gets its own state
 * and its own request state
 */
const AddRoleButton = ({ presetUsername }: AddRoleButtonProps) => {
  const intl = useIntl();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const { data: managePermissions } = useValidateUserPermissionsNonSuspense(MANAGE_TEAM_PERMISSIONS);
  const { isCourseAuthoringEnabled } = useCourseAuthoringFlag();
  const {
    scopeTypes, getScopeCatalog, isLoading: isLoadingRoles, isError: isRolesError,
  } = useAuthzCatalog();

  const canAssignRole = managePermissions?.some((permission) => permission.allowed);

  // The catalog roles of the scope types where the user can manage the team, in catalog order.
  const roleGroups = scopeTypes
    .filter((scopeType) => managePermissions?.some(
      ({ action, allowed }) => allowed && action === MANAGE_TEAM_ACTIONS[scopeType],
    ))
    // Course (authoring) roles are only assignable when the course-authoring flag is enabled.
    .filter((scopeType) => scopeType !== SCOPE_TYPES.COURSE || isCourseAuthoringEnabled)
    .map(getScopeCatalog)
    .filter((scopeCatalog) => scopeCatalog !== undefined);

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
