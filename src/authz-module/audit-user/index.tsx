import React, { useMemo, useState } from 'react';
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
import { RoleCell } from '@src/authz-module/components/TableCells';
import { useQuerySettings } from '@src/authz-module/hooks/useQuerySettings';
import { useRevokeUserRoles, useUserAssignedRoles } from '@src/authz-module/data/hooks';
import { Role } from 'types';
import { useToastManager } from 'authz-module/libraries-manager/ToastManagerContext';
import messages from './messages';
import { ViewAllPermissionsCell, ActionsCell, PermissionsCell } from './CustomCells';
import ConfirmDeletionModal from '../components/ConfirmDeletionModal';

const dummyData = [
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
  const { username } = useParams();
  const navigate = useNavigate();
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [showConfirmDeletionModal, setShowConfirmDeletionModal] = useState(false);
  const {
    showToast, showErrorToast, Bold, Br,
  } = useToastManager();
  const { mutate: revokeUserRoles, isPending: isRevokingUserRole } = useRevokeUserRoles();
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

  const columns = [
    {
      Header: formatMessage(messages['authz.user.table.role.column.header']),
      accessor: 'role',
      Cell: RoleCell,
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

  const handleShowConfirmDeletionModal = (role: Role) => {
    if (isRevokingUserRole) { return; }

    setRoleToDelete(role);
    setShowConfirmDeletionModal(true);
  };

  const handleCloseConfirmDeletionModal = () => {
    setRoleToDelete(null);
    setShowConfirmDeletionModal(false);
  };

  const handleRevokeUserRole = () => {
    if (!user || !roleToDelete) { return; }

    const data = {
      users: user.username,
      role: roleToDelete.role,
      scope: roleToDelete.scope,
    };

    const runRevokeRole = (variables = { data }) => {
      revokeUserRoles(variables, {
        onSuccess: (response) => {
          const { errors } = response;

          if (errors.length) {
            showToast({
              type: 'error',
              message: formatMessage(
                messages['library.authz.team.toast.default.error.message'],
                { Bold, Br },
              ),
            });
            return;
          }

          const remainingRolesCount = dummyData.length - 1;
          showToast({
            message: formatMessage(
              messages['library.authz.team.remove.user.toast.success.description'],
              {
                role: roleToDelete.name,
                rolesCount: remainingRolesCount,
              },
            ),
            type: 'success',
          });
        },
        onError: (error, retryVariables) => {
          showErrorToast(error, () => runRevokeRole(retryVariables));
        },
      });
    };

    handleCloseConfirmDeletionModal();
    runRevokeRole();
  };

  // TODO:
  // eslint-disable-next-line func-names, react/no-unstable-nested-components
  const createActionsCell = (extraProps) => function (cellProps) {
    return <ActionsCell {...cellProps} {...extraProps} />;
  };

  const additionalColumns = [
    {
      id: 'view_permissions',
      Header: '',
      Cell: ViewAllPermissionsCell,
    },
    {
      id: 'action',
      Header: formatMessage(messages['authz.user.table.action.column.header']),
      Cell: createActionsCell({ onClickDeleteButton: handleShowConfirmDeletionModal }),
    },
  ];

  return (
    <div className="authz-module">
      <ConfirmDeletionModal
        isOpen={showConfirmDeletionModal}
        close={handleCloseConfirmDeletionModal}
        onSave={handleRevokeUserRole}
        isDeleting={isRevokingUserRole}
        context={{
          userName: user?.username || '',
          scope: roleToDelete?.scope || '',
          role: roleToDelete?.name || '',
          rolesCount: dummyData.length,
        }}
      />
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
            data={dummyData}
            fetchData={fetchData}
            itemCount={dummyData?.length || 0}
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
