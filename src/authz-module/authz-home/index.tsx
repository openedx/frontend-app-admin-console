import { useIntl } from '@edx/frontend-platform/i18n';
import { Tab, Tabs } from '@openedx/paragon';
import { useLocation, useSearchParams } from 'react-router-dom';
import TeamMembersTable from '@src/authz-module/team-members/TeamMembersTable';
import AddRoleButton from '@src/authz-module/components/AddRoleButton';
import RolesPermissions from '../roles-permissions/RolesPermissions';
import AuthZLayout from '../components/AuthZLayout';

import messages from './messages';

const AuthzHome = () => {
  const { hash } = useLocation();
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const presetScope = searchParams.get('scope') || undefined;

  const rootBreadcrumb = intl.formatMessage(messages['authz.breadcrumb.root']) || '';
  const pageTitle = intl.formatMessage(messages['authz.manage.page.title']);

  return (
    <div className="authz-libraries">
      <AuthZLayout
        context={{ id: '', title: '', org: '' }}
        navLinks={[{ label: rootBreadcrumb }]}
        activeLabel={pageTitle}
        pageTitle={pageTitle}
        pageSubtitle=""
        actions={
          [<AddRoleButton key="add-role-button" />]
        }
      >
        <Tabs
          variant="tabs"
          defaultActiveKey={hash ? 'permissionsRoles' : 'team'}
          className="bg-light-100 px-5"
        >
          <Tab eventKey="team" title={intl.formatMessage(messages['authz.tabs.team'])} className="p-5">
            <TeamMembersTable presetScope={presetScope} />
          </Tab>
          <Tab id="libraries-permissions-roles-tab" eventKey="permissionsRoles" title={intl.formatMessage(messages['authz.tabs.permissionsRoles'])}>
            <RolesPermissions />
          </Tab>
        </Tabs>
      </AuthZLayout>
    </div>
  );
};

export default AuthzHome;
