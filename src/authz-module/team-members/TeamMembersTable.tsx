import { useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  DataTable,
  TextFilter,
} from '@openedx/paragon';

import { useToastManager } from '@src/authz-module/libraries-manager/ToastManagerContext';
import { useQuerySettings } from '@src/authz-module/hooks/useQuerySettings';
import { TeamMember } from 'types';
import OrgFilter from '@src/authz-module/components/TableControlBar/OrgFilter';
import RolesFilter from '@src/authz-module/components/TableControlBar/RolesFilter';
import ScopesFilter from '@src/authz-module/components/TableControlBar/ScopesFilter';
import TableControlBar from '@src/authz-module/components/TableControlBar/TableControlBar';
import { getCellHeader } from 'authz-module/components/utils';
import {
  ActionCell, NameCell, RoleCell, ScopeCell,
} from '@src/authz-module/components/TableCells';
import messages from './messages';
import TableFooter from '../components/TableFooter/TableFooter';

const DEFAULT_PAGE_SIZE = 10;
// TODO: use the actual data from the API
const teamMembersMockedList: TeamMember[] = [
  {
    username: 'admin',
    fullName: 'Alice Johnson',
    email: 'alice.johnson@example.edu',
    createdAt: '2024-01-15T08:30:00Z',
    scope: { resource: 'CS101', type: 'COURSE' },
    organization: 'MIT',
    role: 'Course Admin',
    roles: [],
  },
  {
    username: 'bob.smith',
    fullName: 'Robert Smith',
    email: 'bob.smith@university.org',
    createdAt: '2024-02-10T14:22:00Z',
    scope: { resource: 'math-library', type: 'LIBRARY' },
    organization: 'Stanford',
    role: 'Library Author',
    roles: [],
  },
  {
    username: 'carol.davis',
    fullName: 'Carol Davis',
    email: 'c.davis@adminpanel.edu',
    createdAt: '2023-12-05T09:15:00Z',
    scope: { resource: 'system', type: 'GLOBAL' },
    organization: 'Harvard',
    role: 'Super Admin',
    roles: [],
  },
  {
    username: 'david.wilson',
    fullName: 'David Wilson',
    email: 'david.w@teaching.com',
    createdAt: '2024-03-01T16:45:00Z',
    scope: { resource: 'PHYS201', type: 'COURSE' },
    organization: 'Caltech',
    role: 'Course Staff',
    roles: [],
  },
  {
    username: 'emma.brown',
    fullName: 'Emma Brown',
    email: 'emma.brown@lib.edu',
    createdAt: '2024-01-28T11:30:00Z',
    scope: { resource: 'science-resources', type: 'LIBRARY' },
    organization: 'Berkeley',
    role: 'Library Admin',
    roles: [],
  },
  {
    username: 'frank.miller',
    fullName: 'Franklin Miller',
    email: 'f.miller@global.org',
    createdAt: '2023-11-20T13:00:00Z',
    scope: { resource: 'platform', type: 'GLOBAL' },
    organization: 'Yale',
    role: 'Global Staff',
    roles: [],
  },
  {
    username: 'grace.lee',
    fullName: 'Grace Lee',
    email: 'grace.lee@courses.edu',
    createdAt: '2024-02-14T10:15:00Z',
    scope: { resource: 'HIST150', type: 'COURSE' },
    organization: 'Princeton',
    role: 'Course Admin',
    roles: [],
  },
  {
    username: 'henry.taylor',
    fullName: 'Henry Taylor',
    email: 'h.taylor@library.net',
    createdAt: '2024-01-08T15:20:00Z',
    scope: { resource: 'literature-collection', type: 'LIBRARY' },
    organization: 'Columbia',
    role: 'Library Author',
    roles: [],
  },
  {
    username: 'isabel.garcia',
    fullName: 'Isabel Garcia',
    email: 'i.garcia@admin.edu',
    createdAt: '2023-10-12T07:45:00Z',
    scope: { resource: 'system', type: 'GLOBAL' },
    organization: 'MIT',
    role: 'Super Admin',
    roles: [],
  },
  {
    username: 'jack.anderson',
    fullName: 'Jack Anderson',
    email: 'jack.a@support.com',
    createdAt: '2024-02-25T12:10:00Z',
    scope: { resource: 'CHEM301', type: 'COURSE' },
    organization: 'Northwestern',
    role: 'Course Staff',
    roles: [],
  },
];

interface TeamMembersTableProps {
  presetScope?: string;
}

const TeamMembersTable = ({ presetScope }: TeamMembersTableProps) => {
  const intl = useIntl();
  const { showErrorToast } = useToastManager();
  const [columnsWithFiltersApplied, setColumnsWithFiltersApplied] = useState<string[]>([]);

  // TODO: add querySettings to the dependencies of useTeamMembers and handleTableFetch once the API integration is done
  // const { querySettings, handleTableFetch } = useQuerySettings();
  const { handleTableFetch } = useQuerySettings();

  // TODO: use the actual data from the API once the integration is done
  /* const {
    data: teamMembers, isError, error, refetch,
  } = useTeamMembers(libraryId, querySettings);
   */
  const initialFilters = presetScope ? [{ id: 'scope', value: [presetScope] }] : [];
  const error = null;
  const refetch = () => {};

  if (error) {
    showErrorToast(error, refetch);
  }

  // const rows = isError ? [] : (teamMembers?.results || SKELETON_ROWS);
  const pageCount = teamMembersMockedList?.length ? Math.ceil(teamMembersMockedList.length / DEFAULT_PAGE_SIZE) : 1;

  const fetchData = useMemo(() => debounce(handleTableFetch, 500), [handleTableFetch]);

  useEffect(() => () => fetchData.cancel(), [fetchData]);

  return (
    <div className="authz-module">
      <DataTable
        isFilterable
        isPaginated
        isSortable
        manualFilters
        manualPagination
        manualSortBy
        numBreakoutFilters={4}
        fetchData={fetchData}
        data={teamMembersMockedList}
        itemCount={teamMembersMockedList?.length || 0}
        pageCount={pageCount}
        initialState={{ pageSize: DEFAULT_PAGE_SIZE }}
        additionalColumns={[
          {
            id: 'action',
            Header: intl.formatMessage(messages['authz.team.members.table.column.actions.title']),
            Cell: ActionCell,
          },
        ]}
        columns={
            [
              {
                Header: intl.formatMessage(messages['authz.team.members.table.column.name.title']),
                accessor: 'name',
                Cell: NameCell,
                filter: 'text',
                Filter: TextFilter,
                filterOrder: 1,
              },
              {
                Header: intl.formatMessage(messages['authz.team.members.table.column.email.title']),
                accessor: 'email',
                disableFilters: true,
                filter: 'text',
                Filter: TextFilter,
              },
              {
                Header: getCellHeader('organization', intl.formatMessage(messages['authz.team.members.table.column.organization.title']), columnsWithFiltersApplied),
                accessor: 'organization',
                filter: 'includesValue',
                Filter: OrgFilter,
                filterButtonText: intl.formatMessage(messages['authz.team.members.table.column.organization.title']),
                filterOrder: 2,
              },
              {
                Header: getCellHeader('scope', intl.formatMessage(messages['authz.team.members.table.column.scope.title']), columnsWithFiltersApplied),
                accessor: 'scope',
                Cell: ScopeCell,
                filter: 'includesValue',
                Filter: ScopesFilter,
                filterButtonText: intl.formatMessage(messages['authz.team.members.table.column.scope.title']),
                filterOrder: 4,
              },
              {
                Header: getCellHeader('role', intl.formatMessage(messages['authz.team.members.table.column.role.title']), columnsWithFiltersApplied),
                accessor: 'role',
                filter: 'includesValue',
                Cell: RoleCell,
                Filter: RolesFilter,
                filterButtonText: intl.formatMessage(messages['authz.team.members.table.column.role.title']),
                filterOrder: 3,
              },
            ]
        }
      >
        <TableControlBar onFilterChange={setColumnsWithFiltersApplied} initialFilters={initialFilters} />
        <DataTable.Table />
        <TableFooter />
      </DataTable>
    </div>
  );
};

export default TeamMembersTable;
