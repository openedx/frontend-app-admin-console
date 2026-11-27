import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import debounce from 'lodash.debounce';
import { useParams } from 'react-router-dom';
import { useIntl } from '@openedx/frontend-base';
import { DataTable, TextFilter } from '@openedx/paragon';
import TableControlBar from '@src/authz-module/components/TableControlBar/TableControlBar';
import TableFooter from '@src/authz-module/components/TableFooter/TableFooter';
import ScopesFilter from '@src/authz-module/components/TableControlBar/ScopesFilter';
import messages from '@src/authz-module/role-detail/messages';
import { EMPTY_ROLE_ASSIGNMENTS, TABLE_DEFAULT_PAGE_SIZE } from '@src/authz-module/constants';
import { useRoleAssignments } from '@src/authz-module/data/hooks';
import { useToastManager } from '@src/components/ToastManager/ToastManagerContext';
import { useQuerySettings } from '@src/authz-module/hooks/useQuerySettings';
import { EmailCell, NameCell } from '@src/authz-module/team-members/components/TeamMemberCells';
import { ScopeSummaryCell } from '@src/authz-module/components/TableCells';
import { getCellHeader } from '@src/authz-module/utils';
import type { RoleAssignment } from '@src/types';
import MemberActionCell from './MemberActionCell';

interface RoleMembersTableProps {
  scopeTypes: string[];
  onDelete: (assignment: RoleAssignment) => void;
}

const toastedErrors = new WeakSet<Error>();

/**
 * The members of the role in the URL, one row per assignment: a user holding the role in
 * several scopes gets a row per scope. Rows, pages and the count are all assignments, as
 * the endpoint returns them, so none are cut and the count matches what is listed.
 */
const RoleMembersTable = ({ scopeTypes, onDelete }: RoleMembersTableProps) => {
  const intl = useIntl();
  const { showErrorToast } = useToastManager();
  const { roleId = '' } = useParams();
  const [columnsWithFiltersApplied, setColumnsWithFiltersApplied] = useState<string[]>([]);

  const { querySettings, handleTableFetch } = useQuerySettings();

  // The role is passed apart from the table's settings, so no table state can widen the
  // listing to other roles; the hook stays idle until there is one.
  const {
    data: { results: assignments, count } = EMPTY_ROLE_ASSIGNMENTS,
    isLoading,
    error,
    refetch,
  } = useRoleAssignments(roleId, querySettings);

  // Without this a failed request would read as "No users assigned to this role". Each error
  // is toasted once, as in TeamMembersTable, so re-renders don't stack duplicate toasts.
  useEffect(() => {
    if (error && !toastedErrors.has(error)) {
      toastedErrors.add(error);
      showErrorToast(error, refetch);
    }
  }, [error, showErrorToast, refetch]);

  const pageCount = Math.ceil(count / TABLE_DEFAULT_PAGE_SIZE);

  const fetchData = useMemo(() => debounce(handleTableFetch, 500), [handleTableFetch]);

  useEffect(() => () => fetchData.cancel(), [fetchData]);

  const showingLabel = intl.formatMessage(
    messages['authz.custom.role.members.table.showing.message'],
    { pageSize: assignments.length, itemCount: count },
  );

  const handleShowConfirmDeletionModal = useCallback((assignment: RoleAssignment) => {
    onDelete(assignment);
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
      filter: 'text',
      Filter: TextFilter,
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
      scopeTypes,
      filterButtonText: intl.formatMessage(messages['authz.custom.role.members.table.column.header.scope']),
      filterOrder: 2,
    },
  ], [intl, columnsWithFiltersApplied, scopeTypes]);

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
      data={assignments}
      fetchData={fetchData}
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
