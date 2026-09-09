import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Business, Person } from '@openedx/paragon/icons';
import {
  ALL_ORGS_KEY, getAggregateScopeType, getScopeContextType, MAP_ROLE_KEY_TO_LABEL,
} from '@src/authz-module/constants';
import { getScopeResourceIcon } from '@src/authz-module/utils';
import componentMessages from '@src/authz-module/components/messages';
import type { TeamMember, TeamMemberAssignment } from '@src/types';
import { AGGREGATE_SCOPE_LABELS } from '@src/authz-module/messages';
import messages from './messages';

interface AssignedRolesCellProps {
  row: { original: TeamMember };
}

interface AssignmentSummaryProps {
  assignment: TeamMemberAssignment;
}

/** The role pill: a light rounded block with the person icon, not a Paragon Chip. */
export const RoleBadge = ({ role }: { role: string }) => (
  <div className="authz-role-badge d-inline-flex align-items-center flex-shrink-0 text-nowrap rounded bg-light-300 px-2 py-1">
    <Icon src={Person} size="xs" className="mr-1" />
    {MAP_ROLE_KEY_TO_LABEL[role] || role}
  </div>
);

/**
 * Renders one assignment as "[Role] In <scope>" with the organization on a subline.
 * Shared by the collapsed row and the nested sub-table so both read identically.
 */
export const AssignmentSummary = ({ assignment }: AssignmentSummaryProps) => {
  const { formatMessage } = useIntl();
  const {
    role, scope, scopeDisplayName, org,
  } = assignment;
  // An aggregate scope covers every course/library across the platform or within one org,
  // so it names no single resource and the API sends an empty display name for it.
  const aggregateType = getAggregateScopeType(scope, org);
  const scopeText = aggregateType
    ? formatMessage(AGGREGATE_SCOPE_LABELS[aggregateType][getScopeContextType(scope)])
    : scopeDisplayName || scope;

  const orgText = org === ALL_ORGS_KEY
    ? formatMessage(componentMessages['authz.user.table.org.all.organizations.label'])
    : org;

  return (
    <div className="authz-assigned-roles d-flex align-items-center">
      <RoleBadge role={role} />
      <span className="text-gray-500 px-3 flex-shrink-0">
        {formatMessage(messages['authz.team.members.table.assigned.roles.connector'])}
      </span>
      <div className="authz-scope-cell">
        <span className="d-flex align-items-center">
          <Icon color="primary" src={getScopeResourceIcon(scope)} className="mr-2 flex-shrink-0" size="xs" />
          <span className="text-truncate authz-scope-cell__name" title={scopeText}>{scopeText}</span>
        </span>
        <span className="d-flex align-items-center small text-gray-500 authz-scope-cell__org">
          <Icon src={Business} className="mr-2 flex-shrink-0" size="xs" />
          <span className="text-truncate" title={orgText}>{orgText}</span>
        </span>
      </div>
    </div>
  );
};

/**
 * Collapsed-row cell. Renders `assignments[0]` exactly as the API returns it — the
 * sub-table's first row must match it, so no client-side reordering happens here. The
 * badge stays visible while the row is expanded, for visual continuity.
 */
const AssignedRolesCell = ({ row }: AssignedRolesCellProps) => {
  const [firstAssignment] = row.original.assignments ?? [];

  if (!firstAssignment) {
    return null;
  }

  return <AssignmentSummary assignment={firstAssignment} />;
};

export default AssignedRolesCell;
