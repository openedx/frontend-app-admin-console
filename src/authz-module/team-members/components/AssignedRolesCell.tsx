import { FormattedMessage } from '@openedx/frontend-base';
import { Icon } from '@openedx/paragon';
import { Person } from '@openedx/paragon/icons';
import { useAuthzCatalog } from '@src/authz-module/catalog';
import ScopeSummary from '@src/authz-module/components/ScopeSummary';
import type { TeamMember } from '@src/types';
import messages from '../messages';

interface AssignedRolesCellProps {
  row: { original: TeamMember };
}

/** The role pill: a light rounded block with the person icon, not a Paragon Chip. */
export const RoleBadge = ({ role }: { role: string }) => {
  const { getRole } = useAuthzCatalog();
  return (
    <div className="authz-role-badge d-inline-flex align-items-center flex-shrink-0 text-nowrap rounded bg-gray-100 text-gray-700 mr-3 px-2 py-1">
      <Icon src={Person} size="xs" className="mr-1" />
      {getRole(role)?.displayName ?? role}
    </div>
  );
};

/**
 * Collapsed-row cell: the user's first assignment, as "[Role] In <scope>" with the
 * organization on a subline.
 *
 * Renders `assignments[0]` exactly as the API returns it — the sub-table's first row must
 * match it, so no client-side reordering happens here. The badge stays visible while the
 * row is expanded, for visual continuity.
 */
const AssignedRolesCell = ({ row }: AssignedRolesCellProps) => {
  const [assignment] = row.original.assignments ?? [];

  if (!assignment) {
    return null;
  }

  const {
    role, scope, scopeDisplayName, org,
  } = assignment;

  return (
    <div className="authz-assigned-roles d-flex align-items-center text-gray-500">
      <FormattedMessage
        {...messages['authz.team.members.table.assigned.roles']}
        values={{
          role: <RoleBadge role={role} />,
          scope: <ScopeSummary className="ml-3" scope={scope} scopeDisplayName={scopeDisplayName} org={org} />,
        }}
      />
    </div>
  );
};

export default AssignedRolesCell;
