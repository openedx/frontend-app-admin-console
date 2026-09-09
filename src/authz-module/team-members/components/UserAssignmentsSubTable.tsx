import { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card, DataTable, Icon, TableFooter,
} from '@openedx/paragon';
import { ArrowForward, Business } from '@openedx/paragon/icons';
import { Link } from 'react-router-dom';
import {
  ALL_ORGS_KEY, buildUserPath, getAggregateScopeType, getScopeContextType,
} from '@src/authz-module/constants';
import { getScopeResourceIcon } from '@src/authz-module/utils';
import componentMessages from '@src/authz-module/components/messages';
import type { TeamMember, TeamMemberAssignment } from '@src/types';
import { AGGREGATE_SCOPE_LABELS } from '@src/authz-module/messages';
import messages from '../messages';
import { RoleBadge } from './AssignedRolesCell';

interface UserAssignmentsSubTableProps {
  row: { original: TeamMember };
}

type AssignmentCellProps = { row: { original: TeamMemberAssignment } };

// Same badge as the collapsed row above, so the breakdown reads consistently.
const RoleBadgeCell = ({ row: assignmentRow }: AssignmentCellProps) => (
  <RoleBadge role={assignmentRow.original.role} />
);

const ScopeNameCell = ({ row: assignmentRow }: AssignmentCellProps) => {
  const { formatMessage } = useIntl();
  const { scope, scopeDisplayName, org } = assignmentRow.original;
  const aggregateType = getAggregateScopeType(scope, org);
  const scopeText = aggregateType
    ? formatMessage(AGGREGATE_SCOPE_LABELS[aggregateType][getScopeContextType(scope)])
    : scopeDisplayName || scope;

  return (
    <span className="d-flex align-items-center">
      <Icon color="primary" src={getScopeResourceIcon(scope)} className="mr-2 flex-shrink-0" size="xs" />
      <span className="text-truncate" title={scopeText}>{scopeText}</span>
    </span>
  );
};

// Mirrors ScopeNameCell's icon treatment so all three columns read alike. A platform-wide
// aggregate carries no single org, so it shows the all-organizations label instead.
const OrgIconCell = ({ row: assignmentRow }: AssignmentCellProps) => {
  const { formatMessage } = useIntl();
  const { org } = assignmentRow.original;
  const orgText = org === ALL_ORGS_KEY
    ? formatMessage(componentMessages['authz.user.table.org.all.organizations.label'])
    : org;

  return (
    <span className="d-flex align-items-center">
      <Icon color="primary" src={Business} className="mr-2 flex-shrink-0" size="xs" />
      <span className="text-truncate" title={orgText}>{orgText}</span>
    </span>
  );
};

/**
 * Role breakdown revealed when a team member row is expanded.
 *
 * Lists the assignments the API returned, in order, so the first entry matches the badge
 * still shown in the collapsed row above. The footer total is the user's absolute role
 * count, which is unaffected by any active filter and may exceed the rows listed here —
 * `View all roles` leads to the audit page when it does.
 */
const UserAssignmentsSubTable = ({ row }: UserAssignmentsSubTableProps) => {
  const { formatMessage } = useIntl();
  const { assignments = [], assignmentCount, username } = row.original;
  const hasMoreAssignments = assignmentCount > assignments.length;

  const columns = useMemo(() => [
    {
      id: 'role',
      Header: formatMessage(messages['authz.team.members.subtable.column.role.title']),
      accessor: 'role',
      Cell: RoleBadgeCell,
    },
    {
      id: 'scope',
      Header: formatMessage(messages['authz.team.members.subtable.column.scope.title']),
      accessor: 'scope',
      Cell: ScopeNameCell,
    },
    {
      id: 'org',
      Header: formatMessage(messages['authz.team.members.subtable.column.organization.title']),
      accessor: 'org',
      Cell: OrgIconCell,
    },
  ], [formatMessage]);

  return (
    <Card className="team-members-table__subtable my-3">
      <DataTable
        columns={columns}
        data={assignments}
        itemCount={assignments.length}
      >
        <DataTable.Table isStriped={false} />
        <TableFooter>
          <div className="d-flex align-items-center justify-content-center w-100">
            <span className="text-gray-500">
              {formatMessage(messages['authz.team.members.subtable.showing.text'], {
                shown: String(assignments.length).padStart(2, '0'),
                total: String(assignmentCount).padStart(2, '0'),
              })}
            </span>
            {hasMoreAssignments && (
              <>
                {/* Reuses the module's vertical `hr` divider (see index.scss). */}
                <hr className="mx-3" />
                <Link className="d-inline-flex align-items-center" to={buildUserPath(username)}>
                  {formatMessage(messages['authz.team.members.subtable.view.all.roles'])}
                  <Icon src={ArrowForward} size="xs" className="ml-1" />
                </Link>
              </>
            )}
          </div>
        </TableFooter>
      </DataTable>
    </Card>
  );
};

export default UserAssignmentsSubTable;
