import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from '@openedx/frontend-base';
import { DataTable, TextFilter } from '@openedx/paragon';
import TableControlBar from '@src/authz-module/components/TableControlBar/TableControlBar';
import TableFooter from '@src/authz-module/components/TableFooter/TableFooter';
import ScopesFilter from '@src/authz-module/components/TableControlBar/ScopesFilter';
import messages from '@src/authz-module/role-detail/messages';
import { TABLE_DEFAULT_PAGE_SIZE } from '@src/authz-module/constants';
import { useTeamMembersAssignments } from '@src/authz-module/data/hooks';
import { useQuerySettings } from '@src/authz-module/hooks/useQuerySettings';
import { EMPTY_ASSIGNMENTS } from '@src/authz-module/constants';
import { EmailCell, NameCell } from '@src/authz-module/team-members/components/TeamMemberCells';
import { ScopeSummaryCell } from '@src/authz-module/components/TableCells';
import { getCellHeader } from '@src/authz-module/utils';
import type { TeamMember, TeamMemberAssignment } from '@src/types';
import MemberActionCell from './MemberActionCell';

interface RoleMembersTableProps {
  onDelete: (member: FlattenedMember) => void;
}

export interface FlattenedMember extends TeamMemberAssignment {
  username: string;
  fullName: string;
  email: string;
}

// Transform TeamMember[] with nested assignments into flat array of FlattenedMember
const flattenMembers = (teamMembers: TeamMember[]): FlattenedMember[] => {
  return teamMembers.flatMap(member =>
    member.assignments.map(assignment => ({
      ...assignment,
      username: member.username,
      fullName: member.fullName,
      email: member.email,
    }))
  );
};

const RoleMembersTable = ({ onDelete }: RoleMembersTableProps) => {
  const intl = useIntl();
  const { roleId = '' } = useParams();
  const [columnsWithFiltersApplied, setColumnsWithFiltersApplied] = useState<string[]>([]);

  const { querySettings: baseQuerySettings, handleTableFetch } = useQuerySettings();

  // Merge roleId into querySettings
  const querySettings = useMemo(() => ({
    ...baseQuerySettings,
    roles: roleId,
  }), [baseQuerySettings, roleId]);

  const {
    data: { results: members = [], count = 0 } = EMPTY_ASSIGNMENTS,
    isLoading
  } = useTeamMembersAssignments(querySettings, true);

  const pageCount = Math.ceil(count / TABLE_DEFAULT_PAGE_SIZE);

  // Flatten members array: each assignment becomes a row
  const flattenedMembers = useMemo(() => flattenMembers(members), [members]);

  const showingLabel = intl.formatMessage(
    messages['authz.custom.role.members.table.showing.message'],
    { pageSize: flattenedMembers.length, itemCount: count },
  );

  const handleShowConfirmDeletionModal = useCallback((member: FlattenedMember) => {
    onDelete(member);
  }, [onDelete]);

  const columns = useMemo(() => [
    {
      Header: intl.formatMessage(messages['authz.custom.role.members.table.column.header.username']),
      accessor: 'username',
      Cell: NameCell,
      filter: 'text',
      Filter: TextFilter,
      filterOrder: 1,
    },
    {
      Header: intl.formatMessage(messages['authz.custom.role.members.table.column.header.email']),
      accessor: 'email',
      Cell: EmailCell,
      disableFilters: true,
    },
    {
      id: 'scope',
      Header: getCellHeader('scope', intl.formatMessage(messages['authz.custom.role.members.table.column.header.scope']), columnsWithFiltersApplied),
      accessor: 'scope',
      Cell: ScopeSummaryCell,
      filter: 'includesValue',
      disableSortBy: true,
      defaultCanFilter: true,
      Filter: ScopesFilter,
      filterButtonText: intl.formatMessage(messages['authz.custom.role.members.table.column.header.scope']),
      filterOrder: 2,
    },
  ], [intl, columnsWithFiltersApplied]);

  const additionalColumns = useMemo(() => [
    {
      id: 'actions',
      Header: intl.formatMessage(messages['authz.custom.role.members.table.column.header.actions']),
      Cell: (cellProps) => <MemberActionCell {...cellProps} onClickDeleteButton={handleShowConfirmDeletionModal} />,
      cellClassName: 'text-center',
      headerClassName: 'authz-col-actions justify-content-center',
    },
  ], [intl, handleShowConfirmDeletionModal]);

  return (
    <DataTable
      additionalColumns={additionalColumns}
      columns={columns}
      data={flattenedMembers}
      fetchData={handleTableFetch}
      initialState={{ pageSize: TABLE_DEFAULT_PAGE_SIZE }}
      isFilterable
      isLoading={isLoading}
      isPaginated
      isSortable
      itemCount={count}
      manualFilters
      manualPagination
      manualSortBy
      pageCount={pageCount}
      pageSize={TABLE_DEFAULT_PAGE_SIZE}
    >
      <TableControlBar onFilterChange={setColumnsWithFiltersApplied} countLabel={showingLabel} />
      <DataTable.Table />
      <DataTable.EmptyTable
        content={intl.formatMessage(messages['authz.custom.role.members.table.empty'])}
      />
      <TableFooter showingMessage={messages['authz.custom.role.members.table.showing.message']} />
    </DataTable>
  );
};

export default RoleMembersTable;
