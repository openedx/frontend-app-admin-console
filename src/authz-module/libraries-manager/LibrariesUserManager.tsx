import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Container, Skeleton } from '@openedx/paragon';
import { ROUTES } from '@src/authz-module/constants';
import AuthZLayout from '../components/AuthZLayout';
import { useLibraryAuthZ } from './context';
import RoleCard from '../components/RoleCard';
import { AssignNewRoleTrigger } from './components/AssignNewRoleModal';
import { useLibrary, useTeamMembers } from '../data/hooks';
import { buildPermissionMatrixByRole } from './utils';

import messages from './messages';

const LibrariesUserManager = () => {
  const intl = useIntl();
  const { username } = useParams();
  const {
    libraryId, permissions, roles, resources, canManageTeam,
  } = useLibraryAuthZ();
  const { data: library } = useLibrary(libraryId);
  const rootBreadcrumb = intl.formatMessage(messages['library.authz.breadcrumb.root']) || '';
  const pageManageTitle = intl.formatMessage(messages['library.authz.manage.page.title']);
  const querySettings = {
    order: null,
    pageIndex: 0,
    pageSize: 1,
    roles: null,
    search: username || null,
    sortBy: null,
  };

  const { data: teamMember, isLoading: isLoadingTeamMember } = useTeamMembers(libraryId, querySettings);
  const user = teamMember?.results?.find(member => member.username === username);

  const userRoles = useMemo(() => {
    const assignedRoles = roles.filter(role => user?.roles.includes(role.role));
    return buildPermissionMatrixByRole({
      roles: assignedRoles, permissions, resources, intl,
    });
  }, [roles, user?.roles, permissions, resources, intl]);

  return (
    <div className="authz-libraries">
      <AuthZLayout
        context={{ id: libraryId, title: library.title, org: library.org }}
        navLinks={[{ label: rootBreadcrumb }, { label: pageManageTitle, to: `/authz/${ROUTES.LIBRARIES_TEAM_PATH.replace(':libraryId', libraryId)}` }]}
        activeLabel={user?.username || ''}
        pageTitle={user?.username || ''}
        pageSubtitle={<p>{user?.email}</p>}
        actions={user && canManageTeam
          ? [<AssignNewRoleTrigger
              username={user.username}
              libraryId={libraryId}
              currentUserRoles={userRoles.map(role => role.role)}
          />]
          : []}
      >
        <Container className="bg-light-200 p-5">
          {isLoadingTeamMember ? <Skeleton count={2} height={200} /> : null}
          {userRoles && userRoles.map(role => (
            <RoleCard
              key={`${role.role}-${username}`}
              title={role.name}
              objectName={library.title}
              description={role.description}
              showDelete
              permissionsByResource={role.resources as any[]}
            />
          ))}
        </Container>
      </AuthZLayout>
    </div>
  );
};

export default LibrariesUserManager;
