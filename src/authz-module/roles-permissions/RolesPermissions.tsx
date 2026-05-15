import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Button,
  ButtonGroup,
  Container, Hyperlink,
} from '@openedx/paragon';

import {
  coursePermissions,
  courseResourceTypes,
  rolesObject,
  rolesLibraryObject,
  libraryPermissions,
  libraryResourceTypes,
} from '@src/authz-module/roles-permissions';
import AnchorButton from '../components/AnchorButton';
import PermissionTable from '../components/PermissionTable';

import { buildPermissionMatrixByResource } from './library/utils';

import messages from './library/messages';

const RolesPermissions = () => {
  const intl = useIntl();
  const [active, setActive] = useState('courses');

  const libraryPermissionsByResource = useMemo(() => {
    const permissionsByResource = buildPermissionMatrixByResource({
      roles: rolesLibraryObject,
      permissions: libraryPermissions,
      resources: libraryResourceTypes,
      intl,
    });

    return permissionsByResource;
  }, [intl]);

  const coursePermissionsByResource = useMemo(() => {
    const permissionsByResource = buildPermissionMatrixByResource({
      roles: rolesObject,
      permissions: coursePermissions,
      resources: courseResourceTypes,
      intl,
    });

    return permissionsByResource;
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
        <div className="position-relative">
          <PermissionTable
            permissionsTable={coursePermissionsByResource}
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
        </div>
      )}
      {/*  Libraries */}
      { active === 'libraries' && (
        <PermissionTable
          permissionsTable={libraryPermissionsByResource}
          roles={rolesLibraryObject}
          title={intl.formatMessage(messages['library.authz.tabs.permissionsRoles.libraries.tab.title'])}
        />
      )}
      <AnchorButton />
    </Container>
  );
};

export default RolesPermissions;
