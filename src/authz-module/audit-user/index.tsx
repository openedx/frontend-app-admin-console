import { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import debounce from 'lodash.debounce';
import {
  Container, DataTable,
} from '@openedx/paragon';
import TableFooter from '@src/authz-module/components/TableFooter/TableFooter';
import { AUTHZ_HOME_PATH, TABLE_DEFAULT_PAGE_SIZE } from '@src/authz-module/constants';
import AuthZLayout from '@src/authz-module/components/AuthZLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserAccount } from '@src/data/hooks';
import baseMessages from '@src/authz-module/messages';
import AddRoleButton from '@src/authz-module/components/AddRoleButton';
import {
  OrgCell, RoleCell, ScopeCell, PermissionsCell, ViewAllPermissionsCell, ActionsCell,
} from '@src/authz-module/components/TableCells';
import { useQuerySettings } from '@src/authz-module/hooks/useQuerySettings';
import { useUserAssignedRoles } from '@src/authz-module/data/hooks';
import messages from './messages';

const AuditUserPage = () => {
  const { formatMessage } = useIntl();
  const { username } = useParams();
  const navigate = useNavigate();
  const { isLoading: isLoadingUser, data: user } = useUserAccount(username ?? '');
  const { querySettings, handleTableFetch } = useQuerySettings();
  const { data: { results: userAssignments } = { results: [] } } = useUserAssignedRoles(username ?? '', querySettings);

  if (!user && !isLoadingUser) {
    navigate(AUTHZ_HOME_PATH);
  }
  const navLinks = [
    {
      label: formatMessage(baseMessages['authz.management.home.nav.link']),
      to: AUTHZ_HOME_PATH,
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
      Header: formatMessage(messages['authz.user.table.role.column.header']),
      accessor: 'role',
      Cell: RoleCell,
    },
    {
      Header: formatMessage(messages['authz.user.table.organization.column.header']),
      accessor: 'org',
      Cell: OrgCell,
    },
    {
      Header: formatMessage(messages['authz.user.table.scope.column.header']),
      accessor: 'scope',
      Cell: ScopeCell,
      disableFilters: true,
    },
    {
      Header: formatMessage(messages['authz.user.table.permissions.column.header']),
      Cell: PermissionsCell,
      disableFilters: true,
      disableSortBy: true,
    },
  ];
  const pageCount = userAssignments?.length ? Math.ceil(userAssignments.length / TABLE_DEFAULT_PAGE_SIZE) : 1;

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
            manualPagination
            data={userAssignments}
            fetchData={fetchData}
            itemCount={userAssignments?.length || 0}
            pageCount={pageCount}
            initialState={{ pageSize: TABLE_DEFAULT_PAGE_SIZE }}
            additionalColumns={additionalColumns}
            columns={columns}
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
