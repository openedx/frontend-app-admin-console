import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import AssignRoleWizard from './AssignRoleWizard';
import {
  CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS, courseRolesMetadata, libraryRolesMetadata,
  MANAGE_TEAM_PERMISSIONS,
} from '@src/authz-module/roles-permissions';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';

interface AssignRoleWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Comma-separated usernames or emails to pre-fill the first step with. */
  initialUsers?: string;
}

/**
 * Resolves which roles the current admin may hand out and hands them to the wizard.
 *
 * This lives apart from the wizard so that the wizard stays a presentation concern, and
 * apart from the trigger button so that a host only has to own the open/closed state.
 */
const AssignRoleWizardModal = ({ isOpen, onClose, initialUsers = '' }: AssignRoleWizardModalProps) => {
  const { data: managePermissions } = useValidateUserPermissionsNonSuspense(MANAGE_TEAM_PERMISSIONS);
  const { isCourseAuthoringEnabled } = useCourseAuthoringFlag();

  const rolesAssignable = managePermissions?.flatMap((p) => {
    if (!p.allowed) return [];
    if (p.action === CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM) return libraryRolesMetadata;
    if (p.action === CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM) {
      // Course (authoring) roles are only assignable when the course-authoring flag is enabled.
      return isCourseAuthoringEnabled ? courseRolesMetadata : [];
    }
    return [];
  });

  return (
    <AssignRoleWizard
      isOpen={isOpen}
      onClose={onClose}
      initialUsers={initialUsers}
      roles={rolesAssignable}
    />
  );
};

export default AssignRoleWizardModal;
