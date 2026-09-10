import { useIntl } from '@edx/frontend-platform/i18n';
import { IconButton } from '@openedx/paragon';
import { Visibility } from '@openedx/paragon/icons';
import { useNavigate } from 'react-router-dom';
import { buildUserPath, CONTEXT_TYPES, getScopeContextType } from '@src/authz-module/constants';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import { DisabledCourseActionButton } from '@src/authz-module/components/TableCells';
import componentMessages from '@src/authz-module/components/messages';
import type { TeamMember, TeamMemberAssignment } from '@src/types';

interface TeamMemberViewActionCellProps {
  row: { original: TeamMember };
}

const isViewable = (assignment: TeamMemberAssignment, isCourseEnabled: (scope: string) => boolean) => {
  if (getScopeContextType(assignment.scope) === CONTEXT_TYPES.LIBRARY) {
    return true;
  }
  return isCourseEnabled(assignment.scope);
};

/**
 * Opens a team member's audit page.
 *
 * Rows are users rather than single assignments, so the course-authoring flag is evaluated
 * across the user's assignments: the action stays enabled while at least one of them is
 * viewable, and is only disabled when every one sits in a course that hasn't moved to the
 * new roles experience. `assignments` is capped by `assignments_limit`, so a user whose
 * total exceeds the returned slice may hold viewable roles it does not contain; those rows
 * stay enabled rather than being blocked on incomplete evidence.
 */
const TeamMemberViewActionCell = ({ row }: TeamMemberViewActionCellProps) => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  // Read here rather than threaded down from the table: the flag is a react-query query,
  // so every row shares one request no matter how many cells ask for it.
  const { isCourseEnabled } = useCourseAuthoringFlag();
  const { assignments = [], assignmentCount, username } = row.original;

  const hasViewableAssignment = assignments.length === 0
    || assignmentCount > assignments.length
    || assignments.some((assignment) => isViewable(assignment, isCourseEnabled));

  if (!hasViewableAssignment) {
    return (
      <DisabledCourseActionButton
        src={Visibility}
        alt={formatMessage(componentMessages['authz.table.column.actions.view.title'])}
        size="sm"
      />
    );
  }

  return (
    <IconButton
      src={Visibility}
      alt={formatMessage(componentMessages['authz.table.column.actions.view.title'])}
      size="sm"
      onClick={() => navigate(buildUserPath(username))}
    />
  );
};

export default TeamMemberViewActionCell;
