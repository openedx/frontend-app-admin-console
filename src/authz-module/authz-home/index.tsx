import { useIntl } from '@openedx/frontend-base';
import { Tab, Tabs } from '@openedx/paragon';
import { useLocation, useSearchParams } from 'react-router-dom';
import { TeamMembersTable } from '@src/authz-module/team-members';
import AddRoleButton from '@src/authz-module/components/AddRoleButton';
import { useViewTeamPermissions } from '@src/authz-module/hooks/useViewTeamPermissions';
import { CustomErrors } from '@src/constants';
import LoadingPage from '@src/components/LoadingPage';
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

  const {
    isCourseViewAllowed, isLibraryViewAllowed, isLoading: isLoadingPermissions,
  } = useViewTeamPermissions();

  /**
   * It gates the whole page whether the user is allowed to view the team members. If
   * the user is not allowed, an error is thrown to display the access denied message.
   *
   * Rendering is held until the check settles rather than started optimistically, so a
   * user who turns out to be denied never fires the listing and filter requests behind
   * the page. Both flags read false while it is in flight, which would otherwise deny
   * everyone for a frame.
   */
  if (isLoadingPermissions) {
    return <LoadingPage />;
  }

  if (!isCourseViewAllowed && !isLibraryViewAllowed) {
    throw new Error(CustomErrors.NO_ACCESS);
  }

  return (
    <AuthZLayout
      pageTitle={pageTitle}
      actions={
        [<AddRoleButton key="add-role-button" />]
      }
    >
      <Tabs
        variant="tabs"
        defaultActiveKey={hash ? 'permissionsRoles' : 'team'}
        className="page-band bg-light-100"
      >
        <Tab eventKey="team" title={intl.formatMessage(messages['authz.tabs.team'])} className="page-band py-3">
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
