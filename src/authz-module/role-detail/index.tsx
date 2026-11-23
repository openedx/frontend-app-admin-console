import { useMemo } from 'react';
import type { FlattenedMember } from './members/RoleMembersTable';
import { useLocation, useParams } from 'react-router-dom';
import { useIntl } from '@openedx/frontend-base';
import { Icon, IconButton, Stack, Tab, Tabs, Dropdown } from '@openedx/paragon';
import { Edit, MoreVert, PersonAdd } from '@openedx/paragon/icons';
import LoadingPage from '@src/components/LoadingPage';
import AuthZLayout from '@src/authz-module/components/AuthZLayout';
import { AUTHZ_HOME_PATH, AUTHZ_ROLES_PERMISSIONS_PATH } from '@src/authz-module/constants';
import baseMessages from '@src/authz-module/messages';
import homeMessages from '@src/authz-module/authz-home/messages';
import { useAuthzCatalog } from '@src/authz-module/catalog';
import messages from './messages';
import AddRoleButton from '../components/AddRoleButton';
import DuplicateRoleButton from '../components/DuplicateRoleButton';
import MembersTable from './members/RoleMembersTable';

const RoleDetailPage = () => {
  const intl = useIntl();
  const { roleId = '' } = useParams();
  const { hash } = useLocation();
  const { getRole, isLoading } = useAuthzCatalog();

  const role = getRole(roleId);
  const { displayName = '', definitionKind } = role || {};
  const isCustomRole = definitionKind === 'user_defined';

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
  const handleDeleteMember = (member: FlattenedMember) => {
    console.log('Deleting member:', member);
  };

  const handleDeleteRole = () => {
    console.log('Deleting role:', roleId);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <AuthZLayout
      navLinks={navLinks}
      activeLabel={displayName}
      pageTitle={displayName}
      titleAction={isCustomRole && (
        <Stack direction="horizontal">
          <IconButton
            className="role-detail-action-button"
            src={Edit}
            iconAs={Icon}
            size="sm"
            alt={intl.formatMessage(messages['authz.custom.role.edit.name.alt'])}
          />
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
          {!isCustomRole && <DuplicateRoleButton />}
          <AddRoleButton key="add-role-button" iconBefore={PersonAdd} />
        </Stack>
      ]}
    >
      <Tabs
        variant="tabs"
        defaultActiveKey={hash ? 'permissions' : 'members'}
        className="page-band bg-light-100"
      >
        <Tab eventKey="members" title={intl.formatMessage(messages['authz.custom.role.tabs.members'])} className="page-band py-3">
          <MembersTable onDelete={handleDeleteMember} />
        </Tab>
        <Tab id="role-permissions-tab" eventKey="permissions" title={intl.formatMessage(messages['authz.custom.role.tabs.permissions'])} className="page-band py-3">

        </Tab>
      </Tabs>
    </AuthZLayout>
  );
};

export default RoleDetailPage;
