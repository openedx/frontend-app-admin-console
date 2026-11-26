import { useMemo } from 'react';
import type { RoleAssignment } from '@src/types';
import { useLocation, useParams } from 'react-router-dom';
import { useIntl } from '@openedx/frontend-base';
import {
  Alert, Icon, IconButton, Stack, Tab, Tabs, Dropdown,
} from '@openedx/paragon';
import { MoreVert, PersonAdd } from '@openedx/paragon/icons';
import LoadingPage from '@src/components/LoadingPage';
import AuthZLayout from '@src/authz-module/components/AuthZLayout';
import ResourceTypeTags from '@src/authz-module/components/ResourceTypeTags';
import LastUpdatedTime from '@src/authz-module/components/LastUpdatedTime';
import { AUTHZ_HOME_PATH, AUTHZ_ROLES_PERMISSIONS_PATH } from '@src/authz-module/constants';
import baseMessages from '@src/authz-module/messages';
import homeMessages from '@src/authz-module/authz-home/messages';
import { isCustomRole, useAuthzCatalog } from '@src/authz-module/catalog';
import { CustomErrors } from '@src/constants';
import messages from './messages';
import AddRoleButton from '../components/AddRoleButton';
import DuplicateRoleButton from '../components/DuplicateRoleButton';
import RoleMembersTable from './members/RoleMembersTable';

// Tab keys, also used as the URL hash that opens each tab (e.g. `#comparison`).
const ROLE_DETAIL_TABS = {
  MEMBERS: 'members',
  PERMISSIONS: 'permissions',
  COMPARISON: 'comparison',
} as const;

/**
 * The tab the URL hash asks for. Comparison only exists for built-in roles, so a custom role
 * falls back to Members, as does any other hash.
 */
const getTabFromHash = (hash: string, isCustom: boolean) => {
  const tab = hash.replace('#', '');
  if (tab === ROLE_DETAIL_TABS.PERMISSIONS) return ROLE_DETAIL_TABS.PERMISSIONS;
  if (tab === ROLE_DETAIL_TABS.COMPARISON && !isCustom) return ROLE_DETAIL_TABS.COMPARISON;
  return ROLE_DETAIL_TABS.MEMBERS;
};

const RoleDetailPage = () => {
  const intl = useIntl();
  const { roleId = '' } = useParams();
  const { hash } = useLocation();
  const { getRole, isLoading, isError } = useAuthzCatalog();

  const role = getRole(roleId);

  const navLinks = useMemo(() => [
    {
      label: intl.formatMessage(baseMessages['authz.management.home.nav.link']),
      to: AUTHZ_HOME_PATH,
    },
    {
      label: intl.formatMessage(homeMessages['authz.tabs.permissionsRoles']),
      to: AUTHZ_ROLES_PERMISSIONS_PATH,
    },
  ], [intl]);

  // TODO: add delete actions on actions epic
  const handleDeleteMember = (member: RoleAssignment) => {
    console.log('Deleting member:', member);
  };

  const handleDeleteRole = () => {
    console.log('Deleting role:', roleId);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  // Checked before the role, so a failed catalog request isn't reported as a missing role.
  // Shown inline, as RolesPermissions does for the same catalog.
  if (isError) {
    return (
      <div className="authz-module page-band py-4">
        <Alert variant="danger">
          {intl.formatMessage(messages['authz.custom.role.load.error'])}
        </Alert>
      </div>
    );
  }

  /*
   * The module's ErrorBoundary renders the Not Found page.
   * Not Found covers ids that never existed, deleted custom roles (old bookmarks or shared
   * links), and roles of a scope type the user can't view — the catalog only loads the
   * viewable ones, and Not Found avoids revealing that such a role exists.
   */
  if (!role) {
    throw new Error(CustomErrors.NOT_FOUND);
  }

  const { displayName, scopeTypes, updatedAt } = role;

  const isCustom = isCustomRole(role);

  return (
    <AuthZLayout
      navLinks={navLinks}
      activeLabel={displayName}
      pageTitle={displayName}
      titleAction={isCustom && (
        <Stack direction="horizontal">
          <Dropdown>
            <Dropdown.Toggle
              id={`role-actions-${roleId}`}
              as={IconButton}
              src={MoreVert}
              iconAs={Icon}
              size="sm"
              alt={intl.formatMessage(messages['authz.custom.role.more.name.alt'])}
            />
            <Dropdown.Menu className="border-0 rounded shadow" popperConfig={{ strategy: 'fixed' }}>
              <Dropdown.Item>
                {intl.formatMessage(messages['authz.custom.role.action.duplicate'])}
              </Dropdown.Item>
              <Dropdown.Item onClick={handleDeleteRole}>
                {intl.formatMessage(messages['authz.custom.role.action.delete'])}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Stack>
      )}
      actions={[
        // Adding 2 actions as a stack since we don't want to have a divider between them
        <Stack direction="horizontal" gap={2} key="role-actions">
          {!isCustom && <DuplicateRoleButton />}
          <AddRoleButton key="add-role-button" iconBefore={PersonAdd} />
        </Stack>
      ]}
    >
      {isCustom && (
        <Stack direction="horizontal" gap={3} className="page-band pb-3 bg-light-100 flex-wrap">
          <ResourceTypeTags scopeTypes={scopeTypes} />
          <span className="small text-gray-700">
            {intl.formatMessage(messages['authz.custom.role.last.updated'], {
              date: <LastUpdatedTime updatedAt={updatedAt} />,
            })}
          </span>
        </Stack>
      )}
      <Tabs
        variant="tabs"
        defaultActiveKey={getTabFromHash(hash, isCustom)}
        className="page-band bg-light-100"
      >
        <Tab eventKey={ROLE_DETAIL_TABS.MEMBERS} title={intl.formatMessage(messages['authz.custom.role.tabs.members'])} className="page-band py-3">
          <RoleMembersTable scopeTypes={scopeTypes} onDelete={handleDeleteMember} />
        </Tab>
        <Tab id="role-permissions-tab" eventKey={ROLE_DETAIL_TABS.PERMISSIONS} title={intl.formatMessage(messages['authz.custom.role.tabs.permissions'])} className="page-band py-3">

        </Tab>
        {!isCustom && (
          <Tab id="role-comparison-tab" eventKey={ROLE_DETAIL_TABS.COMPARISON} title={intl.formatMessage(messages['authz.custom.role.tabs.comparison'])} className="page-band py-3">

          </Tab>
        )}
      </Tabs>
    </AuthZLayout>
  );
};

export default RoleDetailPage;
