import {
  useCallback,
  useContext, useEffect, useMemo, useState,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import type { AppContextType } from '@edx/frontend-platform/react';
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
  OrgCell, RoleCell, ScopeCell, PermissionsCell, ViewAllPermissionsCell,
  createActionsCell,
} from '@src/authz-module/components/TableCells';
import { useQuerySettings } from '@src/authz-module/hooks/useQuerySettings';
import { useRevokeUserRoles, useUserAssignedRoles } from '@src/authz-module/data/hooks';
import { Role } from 'types';
import { useToastManager } from 'authz-module/libraries-manager/ToastManagerContext';
import messages from './messages';
import ConfirmDeletionModal from '../components/ConfirmDeletionModal';

const AuditUserPage = () => {
  const { formatMessage } = useIntl();
  const { username } = useParams();
  const { authenticatedUser } = useContext(AppContext) as AppContextType;
  const navigate = useNavigate();
  const {
    isLoading: isLoadingUser, data: user, isError: isErrorUser, error: errorUser,
  } = useUserAccount(username);
  const { querySettings, handleTableFetch } = useQuerySettings();
  const { isLoading: isLoadingUserAssignments, data: { results: userAssignments, count } = { results: [], count: 0 } } = useUserAssignedRoles(username ?? '', querySettings);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [showConfirmDeletionModal, setShowConfirmDeletionModal] = useState(false);
  const {
    showToast, showErrorToast, Bold, Br,
  } = useToastManager();
  const { mutate: revokeUserRoles, isPending: isRevokingUserRolePending } = useRevokeUserRoles();

  const fetchData = useMemo(() => debounce(handleTableFetch, 500), [handleTableFetch]);

  useEffect(() => {
    if (!user && !isLoadingUser) {
      // @ts-ignore
      if (!isErrorUser || errorUser?.customAttributes?.httpErrorStatus === 404) {
        navigate(AUTHZ_HOME_PATH);
      }
    }
  }, [user, isLoadingUser, navigate, isErrorUser, errorUser]);

  useEffect(() => () => fetchData.cancel(), [fetchData]);

  const handleShowConfirmDeletionModal = useCallback((role: Role) => {
    if (isRevokingUserRolePending) { return; }

    setRoleToDelete(role);
    setShowConfirmDeletionModal(true);
  }, [isRevokingUserRolePending]);

  const navLinks = useMemo(() => [
    {
      label: formatMessage(baseMessages['authz.management.home.nav.link']),
      to: AUTHZ_HOME_PATH,
    },
  ], [formatMessage]);

  const additionalColumns = useMemo(() => [
    {
      id: 'view_permissions',
      Header: '',
      Cell: ViewAllPermissionsCell,
    },
    {
      id: 'action',
      Header: formatMessage(messages['authz.user.table.action.column.header']),
      Cell: createActionsCell({
        onClickDeleteButton: handleShowConfirmDeletionModal,
        isUserAuthenticatedPage: username === authenticatedUser.username,
      }),
    },
  ], [authenticatedUser.username, formatMessage, handleShowConfirmDeletionModal, username]);

  const columns = useMemo(() => [
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
  ], [formatMessage]);

  const pageCount = Math.ceil(count / TABLE_DEFAULT_PAGE_SIZE);

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

    const runRevokeRole = (variables) => {
      const variablesData = {
        data: {
          ...variables.data,
          querySettings,
        },

      };
      revokeUserRoles(variablesData, {
        onSuccess: (response) => {
          const { errors } = response;

          if (errors.length) {
            showToast({
              type: 'error',
              message: formatMessage(
                baseMessages['authz.team.toast.default.error.message'],
                { Bold, Br },
              ),
            });
            // authzQueryKeys.userRoles(username, querySettings),
            return;
          }

          const remainingRolesCount = count ? count - 1 : 0;
          showToast({
            message: formatMessage(
              baseMessages['authz.team.remove.user.toast.success.description'],
              {
                role: roleToDelete.name,
                rolesCount: remainingRolesCount,
              },
            ),
            type: 'success',
          });
          handleCloseConfirmDeletionModal();
        },
        onError: (error, retryVariables) => {
          showErrorToast(error, () => runRevokeRole(retryVariables));
        },
      });
    };

    runRevokeRole({ data });
  };

  return (
    <div className="authz-module">
      <ConfirmDeletionModal
        isOpen={showConfirmDeletionModal}
        close={handleCloseConfirmDeletionModal}
        onSave={handleRevokeUserRole}
        isDeleting={isRevokingUserRolePending}
        context={{
          userName: user?.username || '',
          scope: roleToDelete?.scope || '',
          role: roleToDelete?.name || '',
          rolesCount: count || 0,
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
            data={userAssignments}
            fetchData={fetchData}
            itemCount={count}
            pageCount={pageCount}
            initialState={{ pageSize: TABLE_DEFAULT_PAGE_SIZE }}
            additionalColumns={additionalColumns}
            columns={columns}
            isLoading={isLoadingUserAssignments}
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
