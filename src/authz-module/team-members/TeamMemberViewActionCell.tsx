import { useIntl } from '@edx/frontend-platform/i18n';
import { IconButton } from '@openedx/paragon';
import { Visibility } from '@openedx/paragon/icons';
import { useNavigate } from 'react-router-dom';
import { buildUserPath, DJANGO_MANAGED_ROLES } from '@src/authz-module/constants';
import { DisabledCourseActionButton } from '@src/authz-module/components/TableCells';
import componentMessages from '@src/authz-module/components/messages';
import type { TeamMember, TeamMemberAssignment } from '@src/types';

interface TeamMemberViewActionCellProps {
  row: { original: TeamMember };
  isCourseEnabled?: (scope: string) => boolean;
}

const isViewable = (assignment: TeamMemberAssignment, isCourseEnabled?: (scope: string) => boolean) => {
  const isCourseScope = !assignment.role?.startsWith('lib')
    && !DJANGO_MANAGED_ROLES.includes(assignment.role);
  if (!isCourseScope || isCourseEnabled === undefined) {
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
 * new roles experience. Note `assignments` is capped by `assignments_limit`, so this reads
 * the assignments actually returned, not necessarily the user's full set.
 */
const TeamMemberViewActionCell = ({ row, isCourseEnabled }: TeamMemberViewActionCellProps) => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const { assignments = [], username } = row.original;

  const hasViewableAssignment = assignments.length === 0
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

export const createTeamMemberViewActionCell = (
  extraProps: { isCourseEnabled: (scope: string) => boolean },
) => function customTeamMemberViewActionCell(cellProps) {
  return <TeamMemberViewActionCell {...cellProps} {...extraProps} />;
};

export default TeamMemberViewActionCell;
