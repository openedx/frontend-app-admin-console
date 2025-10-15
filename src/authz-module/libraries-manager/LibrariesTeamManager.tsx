import { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container, Skeleton, Tab, Tabs,
} from '@openedx/paragon';
import { useLibrary } from '@src/authz-module/data/hooks';
import { useLocation } from 'react-router-dom';
import TeamTable from './components/TeamTable';
import AuthZLayout from '../components/AuthZLayout';
import RoleCard from '../components/RoleCard';
import PermissionTable from '../components/PermissionTable';
import { useLibraryAuthZ } from './context';
import { AddNewTeamMemberTrigger } from './components/AddNewTeamMemberModal';
import { buildPermissionMatrixByResource, buildPermissionMatrixByRole } from './utils';

import messages from './messages';

const LibrariesTeamManager = () => {
  const intl = useIntl();
  const { hash } = useLocation();
  const {
    libraryId, canManageTeam, roles, permissions, resources,
  } = useLibraryAuthZ();
  const { data: library } = useLibrary(libraryId);
  const rootBradecrumb = intl.formatMessage(messages['library.authz.breadcrumb.root']) || '';
  const pageTitle = intl.formatMessage(messages['library.authz.manage.page.title']);

  const [libraryPermissionsByRole, libraryPermissionsByResource] = useMemo(() => {
    if (!roles && !permissions && !resources) { return [null, null]; }
    const permissionsByRole = buildPermissionMatrixByRole({
      roles, permissions, resources, intl,
    });
    const permissionsByResource = buildPermissionMatrixByResource({
      roles, permissions, resources, intl,
    });

    return [permissionsByRole, permissionsByResource];
  }, [roles, permissions, resources, intl]);

  return (
    <div className="authz-libraries">
      <AuthZLayout
        context={{ id: libraryId, title: library.title, org: library.org }}
        navLinks={[{ label: rootBradecrumb }]}
        activeLabel={pageTitle}
        pageTitle={pageTitle}
        pageSubtitle={libraryId}
        actions={
          canManageTeam
            ? [<AddNewTeamMemberTrigger libraryId={libraryId} />]
            : []
        }
      >
        <Tabs
          variant="tabs"
          defaultActiveKey={hash ? 'permissions' : 'team'}
          className="bg-light-100 px-5"
        >
          <Tab eventKey="team" title={intl.formatMessage(messages['library.authz.tabs.team'])} className="p-5">
            <TeamTable />
          </Tab>
          <Tab eventKey="roles" title={intl.formatMessage(messages['library.authz.tabs.roles'])}>
            <Container className="p-5">
              {!libraryPermissionsByRole ? <Skeleton count={2} height={200} />
                : libraryPermissionsByRole.map(role => (
                  <RoleCard
                    key={`${role.role}-description`}
                    title={role.name}
                    userCounter={role.userCount}
                    description={role.description}
                    permissionsByResource={role.resources as any[]}
                  />
                ))}
            </Container>
          </Tab>
          <Tab id="libraries-permissions-tab" eventKey="permissions" title={intl.formatMessage(messages['library.authz.tabs.permissions'])}>
            <Container className="p-5 container-mw-lg">
              {!libraryPermissionsByResource ? <Skeleton count={2} height={200} />
                : <PermissionTable permissionsTable={libraryPermissionsByResource} roles={roles} />}
            </Container>
          </Tab>
        </Tabs>
      </AuthZLayout>
    </div>
  );
};

export default LibrariesTeamManager;
