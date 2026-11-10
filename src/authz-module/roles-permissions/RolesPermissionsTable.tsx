import { useMemo, useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import {
  Alert, Container, DataTable, Spinner, TextFilter,
} from '@openedx/paragon';

import { TABLE_DEFAULT_PAGE_SIZE } from '../constants';
import { useAuthzCatalog } from '../catalog';
import type { ScopeCatalog } from '../catalog';
import MultipleChoiceFilter from '../components/TableControlBar/MultipleChoiceFilter';
import TableFooter from '../components/TableFooter/TableFooter';
import AssignRoleWizard from '../role-assignation-wizard/AssignRoleWizard';
import type { SelectedRole } from '../role-assignation-wizard/components/SelectUsersAndRoleStep';
import useAssignableRoleGroups from '../role-assignation-wizard/hooks/useAssignableRoleGroups';
import LastUpdatedCell from './components/LastUpdatedCell';
import MembersCell from './components/MembersCell';
import PermissionsGrantedCell from './components/PermissionsGrantedCell';
import ResourceTypeCell from './components/ResourceTypeCell';
import RoleActionsCell from './components/RoleActionsCell';
import RoleNameCell from './components/RoleNameCell';
import RolesTableControlBar from './components/RolesTableControlBar';
import messages from './messages';
import { RoleAssignmentContext } from './RoleAssignmentContext';
import type { RoleRow } from './types';

/** Flattens the catalog into one row per role and scope type, keeping the catalog's order. */
const buildRoleRows = (scopeCatalogs: ScopeCatalog[]): RoleRow[] => scopeCatalogs.flatMap(
  ({ scopeType, roles }) => roles.map((role) => ({
    id: `${scopeType}:${role.role}`,
    role: role.role,
    name: role.displayName,
    resourceType: scopeType,
    // TODO: read the member count and update time from the catalog once the backend API returns them.
    members: null,
    permissionCount: role.permissions.length,
    lastUpdated: null,
    isCustom: role.definitionKind === 'user_defined',
  })),
);

/**
 * Lists the roles of every scope type the user can view, read from the authz catalog
 * (`GET /api/authz/v1/roles/`, ADR 0028), so no role copy lives in the client. The
 * catalog is fetched whole, so search, filtering, sorting and pagination run client side.
 *
 * TODO: update the search and resource type filter handling once the backend API supports
 * them; filtering is done client side over the fetched catalog until then.
 */
const RolesPermissionsTable = () => {
  const { formatMessage } = useIntl();
  const {
    scopeTypes, getScopeCatalog, isLoading, isError,
  } = useAuthzCatalog();

  const roleRows = useMemo(() => buildRoleRows(
    scopeTypes.map(getScopeCatalog).filter((scopeCatalog) => scopeCatalog !== undefined),
  ), [scopeTypes, getScopeCatalog]);

  const {
    roleGroups, isLoading: isLoadingAssignableRoles, isError: isAssignableRolesError,
  } = useAssignableRoleGroups();
  // The role whose "Assign role" item was clicked; the wizard is mounted only while it is set.
  const [roleToAssign, setRoleToAssign] = useState<SelectedRole | null>(null);

  const roleAssignment = useMemo(() => ({
    canAssignRole: ({ resourceType, role }: RoleRow) => roleGroups.some(({ scopeType, roles }) => (
      scopeType === resourceType && roles.some((r) => r.role === role)
    )),
    assignRole: ({ resourceType, role }: RoleRow) => setRoleToAssign({ scopeType: resourceType, role }),
  }), [roleGroups]);

  if (isLoading) {
    return (
      <Container className="d-flex py-5">
        <Spinner
          animation="border"
          variant="primary"
          className="m-auto"
          screenReaderText={formatMessage(messages['authz.tabs.permissionsRoles.loading'])}
        />
      </Container>
    );
  }

  if (isError) {
    return (
      <Alert variant="danger">
        {formatMessage(messages['authz.tabs.permissionsRoles.error'])}
      </Alert>
    );
  }

  return (
    <RoleAssignmentContext.Provider value={roleAssignment}>
      <DataTable
        className="roles-permissions-table"
        isFilterable
        isPaginated
        isSortable
        data={roleRows}
        itemCount={roleRows.length}
        initialState={{ pageSize: TABLE_DEFAULT_PAGE_SIZE }}
        additionalColumns={[
          {
            id: 'actions',
            Header: formatMessage(messages['authz.roles.table.column.actions.title']),
            Cell: RoleActionsCell,
            headerClassName: 'justify-content-center',
          },
        ]}
        columns={[
          {
            id: 'name',
            Header: formatMessage(messages['authz.roles.table.column.role.title']),
            accessor: 'name',
            Cell: RoleNameCell,
            filter: 'text',
            Filter: TextFilter,
          },
          {
            id: 'resourceType',
            Header: formatMessage(messages['authz.roles.table.column.resource.type.title']),
            accessor: 'resourceType',
            Cell: ResourceTypeCell,
            filter: 'includesValue',
            Filter: MultipleChoiceFilter,
          },
          {
            id: 'members',
            Header: formatMessage(messages['authz.roles.table.column.members.title']),
            accessor: 'members',
            Cell: MembersCell,
            sortType: 'basic',
            disableFilters: true,
          },
          {
            id: 'permissions',
            Header: formatMessage(messages['authz.roles.table.column.permissions.title']),
            accessor: 'permissionCount',
            Cell: PermissionsGrantedCell,
            disableFilters: true,
            disableSortBy: true,
          },
          {
            id: 'lastUpdated',
            Header: formatMessage(messages['authz.roles.table.column.last.updated.title']),
            accessor: 'lastUpdated',
            Cell: LastUpdatedCell,
            sortType: 'basic',
            disableFilters: true,
          },
        ]}
      >
        <RolesTableControlBar scopeTypes={scopeTypes} />
        <DataTable.Table />
        <DataTable.EmptyTable content={formatMessage(messages['authz.roles.table.empty'])} />
        <TableFooter showingMessage={messages['authz.roles.table.showing.roles.text']} />
      </DataTable>
      {/* Mounted only while open, so every opening starts from the clicked role. */}
      {roleToAssign && (
        <AssignRoleWizard
          isOpen
          onClose={() => setRoleToAssign(null)}
          initialRole={roleToAssign}
          roleGroups={roleGroups}
          isLoadingRoles={isLoadingAssignableRoles}
          isRolesError={isAssignableRolesError}
        />
      )}
    </RoleAssignmentContext.Provider>
  );
};

export default RolesPermissionsTable;
