import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import debounce from 'lodash.debounce';
import {
  Container, DataTable,
} from '@openedx/paragon';
import TableFooter from '@src/authz-module/components/TableFooter/TableFooter';
import { TABLE_DEFAULT_PAGE_SIZE } from '@src/authz-module/constants';
import AuthZLayout from '@src/authz-module/components/AuthZLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserAccount } from '@src/data/hooks';
import baseMessages from '@src/authz-module/messages';
import AddRoleButton from '@src/authz-module/components/AddRoleButton';
import { RoleCell } from '@src/authz-module/components/TableCells';
import { useQuerySettings } from '@src/authz-module/hooks/useQuerySettings';
import { useUserAssignedRoles } from '@src/authz-module/data/hooks';
import TableControlBar from '@src/authz-module/components/TableControlBar/TableControlBar';
import RolesFilter from 'authz-module/components/TableControlBar/RolesFilter';
import OrgFilter from 'authz-module/components/TableControlBar/OrgFilter';
import ScopesFilter from 'authz-module/components/TableControlBar/ScopesFilter';
import { ViewAllPermissionsCell, ActionsCell, PermissionsCell } from './CustomCells';
import messages from './messages';
import { getCellHeader } from './utils';

const dummyData = [
  {
    role: 'Course Admin',
    organization: 'edX',
    scope: 'Course: Demo Course',
    permissions: ['View', 'Edit', 'Delete'],
  },
  {
    role: 'Course Auditor',
    organization: 'edX',
    scope: 'Course: Demo Course 2',
    permissions: ['View', 'Edit'],
  },
  {
    role: 'Super Admin',
    organization: 'edX',
    scope: 'Course: Demo Course',
    permissions: ['View', 'Edit', 'Delete'],
  },
  {
    role: 'Course Auditor',
    organization: 'edX',
    scope: 'Course: Demo Course 2',
    permissions: ['View', 'Edit'],
  },
  {
    role: 'Global Staff',
    organization: 'edX',
    scope: 'Course: Demo Course',
    permissions: ['View', 'Edit', 'Delete'],
  },
  {
    role: 'Course Auditor',
    organization: 'edX',
    scope: 'Course: Demo Course 2',
    permissions: ['View', 'Edit'],
  },
  {
    role: 'Course Admin',
    organization: 'edX',
    scope: 'Course: Demo Course',
    permissions: ['View', 'Edit', 'Delete'],
  },
  {
    role: 'Course Auditor',
    organization: 'edX',
    scope: 'Course: Demo Course 2',
    permissions: ['View', 'Edit'],
  },
  {
    role: 'Course Admin',
    organization: 'edX',
    scope: 'Course: Demo Course',
    permissions: ['View', 'Edit', 'Delete'],
  },
  {
    role: 'Course Auditor',
    organization: 'edX',
    scope: 'Course: Demo Course 2',
    permissions: ['View', 'Edit'],
  },
  {
    role: 'Course Admin',
    organization: 'edX',
    scope: 'Course: Demo Course',
    permissions: ['View', 'Edit', 'Delete'],
  },
  {
    role: 'Course Auditor',
    organization: 'edX',
    scope: 'Course: Demo Course 2',
    permissions: ['View', 'Edit'],
  },
  {
    role: 'Course Admin',
    organization: 'edX',
    scope: 'Course: Demo Course',
    permissions: ['View', 'Edit', 'Delete'],
  },
  {
    role: 'Course Auditor',
    organization: 'edX',
    scope: 'Course: Demo Course 2',
    permissions: ['View', 'Edit'],
  },
];

const AuditUserPage = () => {
  const { formatMessage } = useIntl();
  const [columnsWithFiltersApplied, setColumnsWithFiltersApplied] = useState<string[]>([]);
  const { username } = useParams();
  const navigate = useNavigate();
  const { isLoading: isLoadingUser, data: user } = useUserAccount(username ?? '');
  const { querySettings, handleTableFetch } = useQuerySettings();
  // TODO: use actual assigned roles data when API is ready, currently using dummy data for development purpose
  const { data: _userAssignedRoles } = useUserAssignedRoles(username ?? '', querySettings);
  const authzHomePath = '/authz';
  if (!user && !isLoadingUser) {
    navigate(authzHomePath);
  }
  const navLinks = [
    {
      label: formatMessage(baseMessages['authz.management.home.nav.link']),
      to: authzHomePath,
    },
  ];
  const additionalColumns = [
    {
      id: 'view_permissions',
      Header: '',
      Cell: ViewAllPermissionsCell,
    },
    {
      id: 'action',
      Header: formatMessage(messages['authz.user.table.action.column.header']),
      Cell: ActionsCell,
    },
  ];
  const columns = [
    {
      Header: getCellHeader('role', formatMessage(messages['authz.user.table.role.column.header']), columnsWithFiltersApplied),
      accessor: 'role',
      Cell: RoleCell,
      filter: 'includesValue',
      Filter: RolesFilter,
      filterButtonText: formatMessage(messages['authz.user.table.role.column.header']),
      filterOrder: 2,
    },
    {
      Header: getCellHeader('organization', formatMessage(messages['authz.user.table.organization.column.header']), columnsWithFiltersApplied),
      accessor: 'organization',
      filter: 'includesValue',
      Filter: OrgFilter,
      filterButtonText: formatMessage(messages['authz.user.table.organization.column.header']),
      filterOrder: 1,

    },
    {
      Header: getCellHeader('scope', formatMessage(messages['authz.user.table.scope.column.header']), columnsWithFiltersApplied),
      accessor: 'scope',
      disableFilters: true,

    },
    {
      Header: formatMessage(messages['authz.user.table.permissions.column.header']),
      Cell: PermissionsCell,
      disableFilters: true,
      disableSortBy: true,
    },
  ];
  const pageCount = dummyData?.length ? Math.ceil(dummyData.length / TABLE_DEFAULT_PAGE_SIZE) : 1;

  const fetchData = useMemo(() => debounce(handleTableFetch, 500), [handleTableFetch]);

  return (
    <div className="authz-module">
      <AuthZLayout
        context={{
          id: '',
          org: '',
          title: '',
        }}
        navLinks={navLinks}
        activeLabel={username || ''}
        pageTitle={user?.username || ''}
        pageSubtitle={user?.email || ''}
        actions={
          [
            <AddRoleButton presetUsername={user?.username} key="add-role-button" />,
          ]
        }
      >
        <Container className="bg-light-200 p-5">
          <DataTable
            isPaginated
            isFilterable
            isSortable
            manualPagination
            manualFilters
            manualSortBy
            data={dummyData}
            fetchData={fetchData}
            itemCount={dummyData?.length || 0}
            pageCount={pageCount}
            initialState={{ pageSize: TABLE_DEFAULT_PAGE_SIZE }}
            additionalColumns={additionalColumns}
            columns={columns}
          >
            <TableControlBar onFilterChange={setColumnsWithFiltersApplied} />
            <DataTable.Table />
            <TableFooter />
          </DataTable>

        </Container>
      </AuthZLayout>
    </div>
  );
};

export default AuditUserPage;
