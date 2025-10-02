import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Container } from '@openedx/paragon';
import { ROUTES } from '@src/authz-module/constants';
import AuthZLayout from '../components/AuthZLayout';
import { useLibraryAuthZ } from './context';
import RoleCard from '../components/RoleCard';
import { useLibrary, useTeamMembers } from '../data/hooks';
import { buildPermissionsByRoleMatrix } from './utils';

import messages from './messages';

const LibrariesUserManager = () => {
  const intl = useIntl();
  const { username } = useParams();
  const {
    libraryId, permissions, roles, resources,
  } = useLibraryAuthZ();
  const { data: library } = useLibrary(libraryId);
  const rootBreadcrumb = intl.formatMessage(messages['library.authz.breadcrumb.root']) || '';
  const pageManageTitle = intl.formatMessage(messages['library.authz.manage.page.title']);

  const { data: teamMembers } = useTeamMembers(libraryId);
  const user = teamMembers?.find(member => member.username === username);
  const userRoles = useMemo(() => {
    const assignedRoles = roles.filter(role => user?.roles.includes(role.role))
      .map(role => ({
        ...role,
        permissions: buildPermissionsByRoleMatrix({
          rolePermissions: role.permissions, permissions, resources, intl,
        }),
      }));
    return assignedRoles;
  }, [roles, user?.roles, permissions, resources, intl]);

  return (
    <div className="authz-libraries">
      <AuthZLayout
        context={{ id: libraryId, title: library.title, org: library.org }}
        navLinks={[{ label: rootBreadcrumb }, { label: pageManageTitle, to: `/authz/${ROUTES.LIBRARIES_TEAM_PATH.replace(':libraryId', libraryId)}` }]}
        activeLabel={user?.username || ''}
        pageTitle={user?.username || ''}
        pageSubtitle={<p>{user?.email}</p>}
        actions={[]}
      >
        <Container className="bg-light-200 p-5">
          {userRoles && userRoles.map(role => (
            <RoleCard
              key={`${role}-${username}`}
              title={role.name}
              objectName={library.title}
              description={role.description}
              showDelete
              permissions={role.permissions as any[]}
            />
          ))}
        </Container>
      </AuthZLayout>
    </div>
  );
};

export default LibrariesUserManager;
