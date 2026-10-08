import { useMemo } from 'react';
import { useIntl } from '@openedx/frontend-base';
import {
  Card, DataTable, Icon, TableFooter,
} from '@openedx/paragon';
import { ArrowForward } from '@openedx/paragon/icons';
import { Link } from 'react-router-dom';
import { buildAuditUserPath } from '@src/authz-module/constants';
import { OrgIconCell, RoleBadgeCell, ScopeNameCell } from '@src/authz-module/components/TableCells';
import type { TeamMember } from '@src/types';
import messages from '../messages';

interface UserAssignmentsSubTableProps {
  row: { original: TeamMember };
}

/**
 * Role breakdown revealed when a team member row is expanded.
 *
 * Lists the assignments the API returned, in order, so the first entry matches the badge
 * still shown in the collapsed row above. The footer total is `assignmentCount`, which
 * may exceed the rows listed here — `View all roles` leads to the audit page when it
 * does.
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
                <Link className="d-inline-flex align-items-center" to={buildAuditUserPath(username)}>
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
