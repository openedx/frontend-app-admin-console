import { useIntl } from '@edx/frontend-platform/i18n';
import type { DataTableRow } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import ViewMoreLink from '@src/authz-module/components/ViewMoreLink';
import { useExclusiveRowExpansion } from '@src/authz-module/hooks/useExclusiveRowExpansion';
import type { TeamMember } from '@src/types';
import messages from '../messages';

interface MoreRolesToggleProps {
  row: DataTableRow<TeamMember>;
}

/**
 * Expands a team member row to reveal their full role breakdown.
 *
 * The count is `assignmentCount - 1`: the collapsed row already shows the first role, so
 * only the remaining ones are "more". Renders nothing when the user has a single role,
 * since there is nothing further to reveal.
 */
const MoreRolesToggle = ({ row }: MoreRolesToggleProps) => {
  const { formatMessage } = useIntl();
  const toggleExpanded = useExclusiveRowExpansion(row);
  const { assignmentCount } = row.original;

  if (!assignmentCount || assignmentCount <= 1) {
    return null;
  }

  return (
    <ViewMoreLink
      label={row.isExpanded
        ? formatMessage(messages['authz.team.members.table.hide.roles'])
        : formatMessage(messages['authz.team.members.table.more.roles'], { count: assignmentCount - 1 })}
      onClick={toggleExpanded}
      iconSrc={row.isExpanded ? ExpandLess : ExpandMore}
    />
  );
};

export default MoreRolesToggle;
