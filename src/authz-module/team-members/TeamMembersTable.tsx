import { useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  DataTable,
  TextFilter,
} from '@openedx/paragon';

import { useToastManager } from '@src/components/ToastManager/ToastManagerContext';
import { LIBRARY_ROLE_KEYS } from '@src/authz-module/roles-permissions';
import { useViewTeamPermissions } from '@src/authz-module/hooks/useViewTeamPermissions';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import { useQuerySettings } from '@src/authz-module/hooks/useQuerySettings';
import OrgFilter from '@src/authz-module/components/TableControlBar/OrgFilter';
import RolesFilter from '@src/authz-module/components/TableControlBar/RolesFilter';
import ScopesFilter from '@src/authz-module/components/TableControlBar/ScopesFilter';
import TableControlBar from '@src/authz-module/components/TableControlBar/TableControlBar';
import { getCellHeader } from '@src/authz-module/utils';
import { EmailCell, NameCell } from '@src/authz-module/components/TableCells';
import { useTeamMembersAssignments } from '@src/authz-module/data/hooks';
import { MAX_INLINE_ASSIGNMENTS, TABLE_DEFAULT_PAGE_SIZE } from '@src/authz-module/constants';
import messages from './messages';
import TableFooter from '../components/TableFooter/TableFooter';
import AssignedRolesCell from './AssignedRolesCell';
import CollapseRowsOnChange from './CollapseRowsOnChange';
import MoreRolesToggle from './MoreRolesToggle';
import UserAssignmentsSubTable from './UserAssignmentsSubTable';
import { createTeamMemberViewActionCell } from './TeamMemberViewActionCell';

interface TeamMembersTableProps {
  presetScope?: string;
}

// Org, scope and role stay in the column set — TableControlBar derives its filter
// controls from the columns — but are hidden, since the design surfaces them inside
// each user's role breakdown instead of as top-level columns. They carry no accessor
// (a user row has no single org/scope/role), so each opts into filtering with
// `defaultCanFilter`, which react-table otherwise infers from the accessor.
const HIDDEN_FILTER_COLUMNS = ['org', 'scope', 'role'];

const TeamMembersTable = ({ presetScope }: TeamMembersTableProps) => {
  const intl = useIntl();
  const { showErrorToast } = useToastManager();
  const [columnsWithFiltersApplied, setColumnsWithFiltersApplied] = useState<string[]>([]);

  const initialQuerySettings = presetScope ? {
    scopes: presetScope,
    pageSize: TABLE_DEFAULT_PAGE_SIZE,
    pageIndex: 0,
    roles: null,
    organizations: null,
    search: null,
    order: null,
    sortBy: null,
  } : undefined;

  const { querySettings, handleTableFetch } = useQuerySettings(initialQuerySettings);

  const { isCourseViewAllowed } = useViewTeamPermissions();
  const { isCourseEnabled } = useCourseAuthoringFlag();

  const effectiveQuerySettings = useMemo(() => {
    if (isCourseViewAllowed || querySettings.roles) { return querySettings; }
    return { ...querySettings, roles: LIBRARY_ROLE_KEYS };
  }, [isCourseViewAllowed, querySettings]);

  const {
    data: { results: teamMembers, count } = { results: [], count: 0 },
    isLoading: isLoadingTeamMembers,
    error,
    refetch,
  } = useTeamMembersAssignments(effectiveQuerySettings, MAX_INLINE_ASSIGNMENTS);

  const viewActionCell = useMemo(() => createTeamMemberViewActionCell({ isCourseEnabled }), [isCourseEnabled]);

  const initialFilters = presetScope ? [{ id: 'scope', value: [presetScope] }] : [];

  useEffect(() => {
    if (error) {
      showErrorToast(error, refetch);
    }
  }, [error, showErrorToast, refetch]);

  const pageCount = Math.ceil(count / TABLE_DEFAULT_PAGE_SIZE);

  const fetchData = useMemo(() => debounce(handleTableFetch, 500), [handleTableFetch]);

  useEffect(() => () => fetchData.cancel(), [fetchData]);

  const showingUsersLabel = intl.formatMessage(
    messages['authz.team.members.table.showing.users.text'],
    { pageSize: teamMembers.length, itemCount: count },
  );

  return (
    <div className="authz-module team-members-table">
      <DataTable
        isExpandable
        isFilterable
        isPaginated
        isSortable
        manualFilters
        manualPagination
        manualSortBy
        numBreakoutFilters={4}
        fetchData={fetchData}
        data={teamMembers}
        itemCount={count}
        pageCount={pageCount}
        initialState={{
          pageSize: TABLE_DEFAULT_PAGE_SIZE,
          filters: initialFilters,
          hiddenColumns: HIDDEN_FILTER_COLUMNS,
        }}
        isLoading={isLoadingTeamMembers}
        renderRowSubComponent={UserAssignmentsSubTable}
        additionalColumns={[
          {
            id: 'moreRoles',
            Header: '',
            Cell: MoreRolesToggle,
          },
          {
            id: 'action',
            Header: intl.formatMessage(messages['authz.team.members.table.column.actions.title']),
            Cell: viewActionCell,
          },
        ]}
        columns={
            [
              {
                id: 'username',
                Header: intl.formatMessage(messages['authz.team.members.table.column.name.title']),
                accessor: 'username',
                Cell: NameCell,
                filter: 'text',
                Filter: TextFilter,
                filterOrder: 1,
              },
              {
                Header: intl.formatMessage(messages['authz.team.members.table.column.email.title']),
                accessor: 'email',
                Cell: EmailCell,
                disableFilters: true,
                filter: 'text',
                Filter: TextFilter,
              },
              {
                id: 'assignedRoles',
                Header: intl.formatMessage(messages['authz.team.members.table.column.assigned.roles.title']),
                Cell: AssignedRolesCell,
                disableFilters: true,
                disableSortBy: true,
              },
              {
                id: 'org',
                Header: getCellHeader('org', intl.formatMessage(messages['authz.team.members.table.column.organization.title']), columnsWithFiltersApplied),
                filter: 'includesValue',
                defaultCanFilter: true,
                Filter: OrgFilter,
                filterButtonText: intl.formatMessage(messages['authz.team.members.table.column.organization.title']),
                filterOrder: 2,
              },
              {
                id: 'scope',
                Header: getCellHeader('scope', intl.formatMessage(messages['authz.team.members.table.column.scope.title']), columnsWithFiltersApplied),
                filter: 'includesValue',
                defaultCanFilter: true,
                Filter: ScopesFilter,
                filterButtonText: intl.formatMessage(messages['authz.team.members.table.column.scope.title']),
                filterOrder: 4,
              },
              {
                id: 'role',
                Header: getCellHeader('role', intl.formatMessage(messages['authz.team.members.table.column.role.title']), columnsWithFiltersApplied),
                filter: 'includesValue',
                defaultCanFilter: true,
                Filter: RolesFilter,
                filterButtonText: intl.formatMessage(messages['authz.team.members.table.column.role.title']),
                filterOrder: 3,
              },
            ]
        }
      >
        <CollapseRowsOnChange />
        <TableControlBar onFilterChange={setColumnsWithFiltersApplied} countLabel={showingUsersLabel} />
        <DataTable.Table />
        <TableFooter showingMessage={messages['authz.team.members.table.showing.users.text']} />
      </DataTable>
    </div>
  );
};

export default TeamMembersTable;
