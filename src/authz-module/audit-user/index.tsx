import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import debounce from 'lodash.debounce';
import {
  Container, DataTable, TableFooter,
} from '@openedx/paragon';
import { TABLE_DEFAULT_PAGE_SIZE } from '@src/authz-module/constants';
import AuthZLayout from '@src/authz-module/components/AuthZLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserAccount } from '@src/data/hooks';
import baseMessages from '@src/authz-module/messages';
import AddRoleButton from '@src/authz-module/components/AddRoleButton';
import { useQuerySettings } from '@src/authz-module/hooks/useQuerySettings';
import { useUserAssignedRoles } from '@src/authz-module/data/hooks';
import messages from './messages';
import { ViewAllPermissionsCell, ActionsCell, PermissionsCell } from './CustomCells';
import UserPermissions from './UserPermissions';

const dummyData = [
  {
    role: 'Super Admin',
    organization: 'All organizations',
    scope: 'Global',
    permissions: ['Total access'],
  },
  {
    role: 'Global Staff',
    organization: 'All organizations',
    scope: 'Global',
    permissions: ['Partial access'],
  },
  {
    role: 'Course Admin',
    organization: 'edX',
    scope: 'Course: Demo Course',
    permissions: ['View', 'Edit', 'Delete'],
  },
  {
    role: 'Course Staff',
    organization: 'edX',
    scope: 'Course: Demo Course',
    permissions: ['View', 'Edit', 'Delete'],
  },
  {
    role: 'Course Editor',
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
    role: 'Library Admin',
    organization: 'edX',
    scope: 'Course: Demo Course',
    permissions: ['View', 'Edit', 'Delete'],
  },
  {
    role: 'Library Author',
    organization: 'edX',
    scope: 'Course: Demo Course 2',
    permissions: ['View', 'Edit'],
  },
  {
    role: 'Library Contributor',
    organization: 'edX',
    scope: 'Course: Demo Course',
    permissions: ['View', 'Edit', 'Delete'],
  },
  {
    role: 'Library User',
    organization: 'edX',
    scope: 'Course: Demo Course 2',
    permissions: ['View', 'Edit'],
  },
];

const AuditUserPage = () => {
  const { formatMessage } = useIntl();
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
      Cell: ActionsCell, // call the new component from other PR to show the Info Icon when is required
    },
  ];
  const columns = [
    {
      Header: formatMessage(messages['authz.user.table.role.column.header']),
      accessor: 'role',
    },
    {
      Header: formatMessage(messages['authz.user.table.organization.column.header']),
      accessor: 'organization',
    },
    {
      Header: formatMessage(messages['authz.user.table.scope.column.header']),
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
        activeLabel={formatMessage(baseMessages['authz.management.specific.user.nav.link'])}
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
            manualPagination
            data={dummyData}
            fetchData={fetchData}
            itemCount={dummyData?.length || 0}
            pageCount={pageCount}
            initialState={{ pageSize: TABLE_DEFAULT_PAGE_SIZE }}
            additionalColumns={additionalColumns}
            columns={columns}
            isExpandable
            renderRowSubComponent={({ row }) => (
              <div>
                <UserPermissions row={row} />
              </div>
            )}
          >
            <DataTable.Table />
            <TableFooter />
          </DataTable>

        </Container>
      </AuthZLayout>
    </div>
  );
};

export default AuditUserPage;
