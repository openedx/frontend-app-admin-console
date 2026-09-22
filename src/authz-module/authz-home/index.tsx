import { useIntl } from '@openedx/frontend-base';
import { Tab, Tabs } from '@openedx/paragon';
import { useLocation, useSearchParams } from 'react-router-dom';
import TeamMembersTable from '@src/authz-module/team-members/TeamMembersTable';
import AddRoleButton from '@src/authz-module/components/AddRoleButton';
import RolesPermissions from '@src/authz-module/roles-permissions/RolesPermissions';
import AuthZLayout from '@src/authz-module/components/AuthZLayout';

import messages from './messages';

const AuthzHome = () => {
  const { hash } = useLocation();
  const intl = useIntl();
  const [searchParams] = useSearchParams();

  /* In the authoring repository the scope is encoded but this is to Replace spaces with '+'
     to match URL encoding format in case the 'scope' parameter is provided with spaces instead of '+'
  */
  const presetScope = searchParams.get('scope')?.replace(/\s/g, '+') || undefined;

  const pageTitle = intl.formatMessage(messages['authz.manage.page.title']);

  return (
    <AuthZLayout
      pageTitle={pageTitle}
      pageSubtitle=""
      actions={
        [<AddRoleButton key="add-role-button" />]
      }
    >
      <Tabs
        variant="tabs"
        defaultActiveKey={hash ? 'permissionsRoles' : 'team'}
        className="page-band bg-light-100"
      >
        <Tab eventKey="team" title={intl.formatMessage(messages['authz.tabs.team'])} className="page-band py-5">
          <TeamMembersTable presetScope={presetScope} />
        </Tab>
        <Tab id="libraries-permissions-roles-tab" eventKey="permissionsRoles" title={intl.formatMessage(messages['authz.tabs.permissionsRoles'])} className="page-band py-5">
          <RolesPermissions />
        </Tab>
      </Tabs>
    </AuthZLayout>
  );
};

export default AuthzHome;
