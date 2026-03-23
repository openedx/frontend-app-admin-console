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

import { buildPermissionMatrixByResource } from '../libraries-manager/utils';

import messages from '../libraries-manager/messages';
import { coursePermissions, courseResourceTypes, rolesObject } from '../courses/constants';
import { rolesLibraryObject, libraryPermissions, libraryResourceTypes } from '../libraries-manager/constants';

const RolesPermissions = () => {
  const intl = useIntl();
  const [active, setActive] = useState('courses');

  const [libraryPermissionsByResource] = useMemo(() => {
    if (!rolesLibraryObject && !libraryPermissions && !libraryResourceTypes) { return [null, null]; }
    const permissionsByResource = buildPermissionMatrixByResource({
      roles: rolesLibraryObject,
      permissions: libraryPermissions,
      resources: libraryResourceTypes,
      intl,
    });

    return [permissionsByResource];
  }, [intl]);

  const [CoursePermissionsByResource] = useMemo(() => {
    if (!rolesObject && !coursePermissions && !courseResourceTypes) { return [null, null]; }
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
            Courses
          </Button>
          <Button
            onClick={() => setActive('libraries')}
            variant={`${active === 'libraries' ? 'primary' : 'outline-primary'}`}
          >
            Libraries
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
                title="Course Roles"
              />
              <Alert
                variant="info"
                className="mt-5"
              >
                <div className="row align-items-center">
                  <div className="col col-7">
                    <p className="text-primary font-weight-bold h4">{intl.formatMessage(messages['library.authz.tabs.permissionsRoles.courses.alert.title'])}</p>
                    <span><span className="font-weight-bold">Note:</span>{intl.formatMessage(messages['library.authz.tabs.permissionsRoles.courses.alert.description'])}</span>
                  </div>
                  <div className="col col-5">
                    <Hyperlink className="d-block text-right h5 font-weight-normal" destination="." target="_blank" showLaunchIcon={false} isInline>
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
              title="Library Roles"
            />
          )
      )}
    </Container>
  );
};

export default RolesPermissions;
