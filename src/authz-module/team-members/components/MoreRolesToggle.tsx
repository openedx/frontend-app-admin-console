import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTableContext } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import ViewMoreLink from '@src/authz-module/components/ViewMoreLink';
import type { TeamMember } from '@src/types';
import messages from '../messages';

interface DataTableInstance {
  state?: {
    expanded?: Record<string, boolean>;
  };
  toggleRowExpanded?: (rowId: string, expanded: boolean) => void;
}

interface MoreRolesToggleProps {
  row: {
    id: string;
    isExpanded?: boolean;
    original: TeamMember;
    toggleRowExpanded?: () => void;
  };
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
  const instance = useContext(DataTableContext) as DataTableInstance;
  const { assignmentCount } = row.original;

  if (!assignmentCount || assignmentCount <= 1) {
    return null;
  }

  const handleToggleExpanded = () => {
    if (!row.isExpanded && instance) {
      // Close any other expanded row first, so only one breakdown is open at a time.
      const expanded = instance.state?.expanded || {};
      Object.keys(expanded).forEach((rowId) => {
        if (rowId !== row.id && expanded[rowId]) {
          instance.toggleRowExpanded?.(rowId, false);
        }
      });
    }
    row.toggleRowExpanded?.();
  };

  return (
    <ViewMoreLink
      label={row.isExpanded
        ? formatMessage(messages['authz.team.members.table.hide.roles'])
        : formatMessage(messages['authz.team.members.table.more.roles'], { count: assignmentCount - 1 })}
      onClick={handleToggleExpanded}
      iconSrc={row.isExpanded ? ExpandLess : ExpandMore}
    />
  );
};

export default MoreRolesToggle;
