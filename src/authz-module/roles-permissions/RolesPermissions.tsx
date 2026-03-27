import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Button,
  ButtonGroup,
  Container, Hyperlink, Skeleton,
} from '@openedx/paragon';

import AnchorButton from '../components/AnchorButton';
import PermissionTable from '../components/PermissionTable';

import { buildPermissionMatrixByResource } from '../libraries/utils';

import messages from '../libraries/messages';
import { coursePermissions, courseResourceTypes, rolesObject } from '../courses/constants';
import { rolesLibraryObject, libraryPermissions, libraryResourceTypes } from '../libraries/constants';

const RolesPermissions = () => {
  const intl = useIntl();
  const [active, setActive] = useState('courses');

  const [libraryPermissionsByResource] = useMemo(() => {
    const permissionsByResource = buildPermissionMatrixByResource({
      roles: rolesLibraryObject,
      permissions: libraryPermissions,
      resources: libraryResourceTypes,
      intl,
    });

    return [permissionsByResource];
  }, [intl]);

  const [CoursePermissionsByResource] = useMemo(() => {
    const permissionsByResource = buildPermissionMatrixByResource({
      roles: rolesObject,
      permissions: coursePermissions,
      resources: courseResourceTypes,
      intl,
    });

    return [permissionsByResource];
  }, [intl]);

  return (
    <Container className="p-5">
      <Container className="pb-5">
        <ButtonGroup size="lg" className="mb-2">
          <Button
            onClick={() => setActive('courses')}
            variant={`${active === 'courses' ? 'primary' : 'outline-primary'}`}
          >
            {intl.formatMessage(messages['library.authz.tabs.permissionsRoles.courses.tab']) }
          </Button>
          <Button
            onClick={() => setActive('libraries')}
            variant={`${active === 'libraries' ? 'primary' : 'outline-primary'}`}
          >
            {intl.formatMessage(messages['library.authz.tabs.permissionsRoles.libraries.tab']) }
          </Button>
        </ButtonGroup>
      </Container>
      {/* Courses */}
      { active === 'courses' && (
        !CoursePermissionsByResource ? <Skeleton count={2} height={200} />
          : (
            <div className="position-relative">
              <PermissionTable
                permissionsTable={CoursePermissionsByResource}
                roles={rolesObject}
                title={intl.formatMessage(messages['library.authz.tabs.permissionsRoles.courses.tab.title'])}
              />
              <Alert
                variant="info"
                className="mt-5"
              >
                <div className="row align-items-center">
                  <div className="col col-7">
                    <p className="text-primary font-weight-bold h4">{intl.formatMessage(messages['library.authz.tabs.permissionsRoles.courses.alert.title'])}</p>
                    <span>
                      <span className="font-weight-bold">{intl.formatMessage(messages['library.authz.tabs.permissionsRoles.courses.alert.note'])}</span>
                      {intl.formatMessage(messages['library.authz.tabs.permissionsRoles.courses.alert.description'])}
                    </span>
                  </div>
                  <div className="col col-5">
                    <Hyperlink className="d-block text-right h5 font-weight-normal" destination="https://docs.openedx.org/en/latest/educators/references/course_development/course_team_roles.html" target="_blank" showLaunchIcon={false} isInline>
                      {intl.formatMessage(messages['library.authz.tabs.permissionsRoles.courses.alert.link'])}
                    </Hyperlink>
                  </div>
                </div>
              </Alert>
              <AnchorButton />
            </div>
          )
      )}
      {/*  Libraries */}
      { active === 'libraries' && (
        !libraryPermissionsByResource ? <Skeleton count={2} height={200} />
          : (
            <PermissionTable
              permissionsTable={libraryPermissionsByResource}
              roles={rolesLibraryObject}
              title={intl.formatMessage(messages['library.authz.tabs.permissionsRoles.libraries.tab.title'])}
            />
          )
      )}
    </Container>
  );
};

export default RolesPermissions;
