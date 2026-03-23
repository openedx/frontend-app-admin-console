import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Button,
  ButtonGroup,
  Container, Hyperlink, Skeleton, Tab, Tabs,
} from '@openedx/paragon';

import { useLocation } from 'react-router-dom';
import AnchorButton from 'authz-module/components/AnchorButton';
import AuthZLayout from '../components/AuthZLayout';
import PermissionTable from '../components/PermissionTable';

import { buildPermissionMatrixByResource } from '../libraries-manager/utils';

import messages from '../libraries-manager/messages';
import { coursePermissions, courseResourceTypes, rolesObject } from '../courses/constants';
import { rolesLibraryObject, libraryPermissions, libraryResourceTypes } from '../libraries-manager/constants';

const RolesPermissions = () => {
  const intl = useIntl();
  const { hash } = useLocation();

  const rootBreadcrumb = intl.formatMessage(messages['library.authz.breadcrumb.root']) || '';
  const pageTitle = intl.formatMessage(messages['library.authz.manage.page.title']);
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
    <div className="authz-libraries">
      <AuthZLayout
        context={{ id: '', title: '', org: '' }}
        // Temporarily setting '/authz/libraries/:libraryId' as the URL for Manage Access breadcrumb for now as
        // currently we do not have a dedicated page. TODO: Update when such page is created.
        navLinks={[{ label: rootBreadcrumb }]}
        activeLabel={pageTitle}
        pageTitle={pageTitle}
        pageSubtitle=""
        actions={
          []
          // this needs to be enable again once is refactored to be used outside of library context
          // [
          //   <AddNewTeamMemberTrigger libraryId="" key="add-new-member" />,
          // ]
        }
      >
        <Tabs
          variant="tabs"
          defaultActiveKey={hash ? 'permissionsRoles' : 'team'}
          className="bg-light-100 px-5"
        >
          <Tab eventKey="team" title={intl.formatMessage(messages['library.authz.tabs.team'])} className="p-5">
            {/* TODO: once TeamTable is refactored we can call it here. For now, this tab will be empty. */}
            {/* <TeamTable /> */}
          </Tab>
          <Tab id="libraries-permissions-roles-tab" eventKey="permissionsRoles" title={intl.formatMessage(messages['library.authz.tabs.permissionsRoles'])}>
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
          </Tab>
        </Tabs>
      </AuthZLayout>
    </div>
  );
};

export default RolesPermissions;
