import { useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';
import { Plus } from '@openedx/paragon/icons';

import baseMessages from '@src/authz-module/messages';
import AssignRoleWizard from '@src/authz-module/role-assignation-wizard/AssignRoleWizard';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import {
  CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS, courseRolesMetadata, libraryRolesMetadata,
  MANAGE_TEAM_PERMISSIONS,
} from '@src/authz-module/roles-permissions';
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

  const canAssignRole = managePermissions?.some((permission) => permission.allowed);

  const rolesAssignable = managePermissions?.flatMap((p) => {
    if (!p.allowed) return [];
    if (p.action === CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM) return libraryRolesMetadata;
    if (p.action === CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM) {
      // Course (authoring) roles are only assignable when the course-authoring flag is enabled.
      return isCourseAuthoringEnabled ? courseRolesMetadata : [];
    }
    return [];
  });

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
          roles={rolesAssignable}
        />
      )}
    </>
  );
};

export default AddRoleButton;
