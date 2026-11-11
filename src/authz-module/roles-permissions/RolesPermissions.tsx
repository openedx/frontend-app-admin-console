import { useMemo, useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import type { MessageDescriptor } from '@openedx/frontend-base';
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Container, Hyperlink, Spinner,
} from '@openedx/paragon';

import { SCOPE_TYPES } from '@src/authz-module/constants';
import { useAuthzCatalog } from '@src/authz-module/catalog';
import AnchorButton from '@src/authz-module/components/AnchorButton';
import PermissionTable from '@src/authz-module/components/PermissionTable';
import componentMessages from '@src/authz-module/components/messages';

import { buildPermissionMatrix } from './utils';

import messages from './messages';

// Category of the permissions the catalog sends without one.
const OTHER_CATEGORY_ID = 'other';

// Button label and table title of each scope type.
const SCOPE_TYPE_LABELS: Partial<Record<string, { tab: MessageDescriptor; title: MessageDescriptor }>> = {
  [SCOPE_TYPES.COURSE]: {
    tab: messages['authz.tabs.permissionsRoles.courses.tab'],
    title: messages['authz.tabs.permissionsRoles.courses.tab.title'],
  },
  [SCOPE_TYPES.LIBRARY]: {
    tab: messages['authz.tabs.permissionsRoles.libraries.tab'],
    title: messages['authz.tabs.permissionsRoles.libraries.tab.title'],
  },
};

const RolesPermissions = () => {
  const intl = useIntl();
  // The catalog only holds the scope types the user can view.
  const {
    scopeTypes, getScopeCatalog, isLoading, isError,
  } = useAuthzCatalog();
  const [selectedScopeType, setSelectedScopeType] = useState<string>();
  const activeScopeType = selectedScopeType ?? scopeTypes[0];
  const scopeCatalog = activeScopeType ? getScopeCatalog(activeScopeType) : undefined;

  const matrix = useMemo(() => (scopeCatalog ? buildPermissionMatrix(scopeCatalog, {
    id: OTHER_CATEGORY_ID,
    displayName: intl.formatMessage(componentMessages['authz.tabs.permissionsRoles.category.other']),
    description: '',
    icon: null,
  }) : []), [scopeCatalog, intl]);

  if (isLoading) {
    return (
      <Container className="d-flex py-5">
        <Spinner
          animation="border"
          variant="primary"
          className="m-auto"
          screenReaderText={intl.formatMessage(messages['authz.tabs.permissionsRoles.loading'])}
        />
      </Container>
    );
  }

  if (isError) {
    return (
      <Alert variant="danger">
        {intl.formatMessage(messages['authz.tabs.permissionsRoles.error'])}
      </Alert>
    );
  }

  if (!scopeCatalog) return null;

  const formatScopeTypeLabel = (scopeType: string, label: 'tab' | 'title') => {
    const message = SCOPE_TYPE_LABELS[scopeType]?.[label];
    return message ? intl.formatMessage(message) : scopeType;
  };

  return (
    <>
      <Card className="bg-light-200">
        <div className="px-3 py-4">
          <ButtonGroup size="md">
            {scopeTypes.map((scopeType) => (
              <Button
                key={scopeType}
                onClick={() => setSelectedScopeType(scopeType)}
                variant={scopeType === activeScopeType ? 'primary' : 'outline-primary'}
              >
                {formatScopeTypeLabel(scopeType, 'tab')}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <div className="position-relative">
          <PermissionTable
            matrix={matrix}
            roles={scopeCatalog.roles}
            title={formatScopeTypeLabel(activeScopeType, 'title')}
          />
        </div>
      </Card>
      {activeScopeType === SCOPE_TYPES.COURSE && (
        <Alert
          variant="info"
          className="mt-5"
        >
          <div className="row align-items-center">
            <div className="col-12 col-md-7">
              <p className="text-primary font-weight-bold h4">{intl.formatMessage(messages['authz.tabs.permissionsRoles.courses.alert.title'])}</p>
              <span>
                <span className="font-weight-bold">{intl.formatMessage(messages['authz.tabs.permissionsRoles.courses.alert.note'])}</span>
                {intl.formatMessage(messages['authz.tabs.permissionsRoles.courses.alert.description'])}
              </span>
            </div>
            <div className="col-12 col-md-5 mt-3 mt-md-0">
              <Hyperlink className="d-block text-right h5 font-weight-normal" destination="https://docs.openedx.org/en/latest/educators/references/course_development/course_team_roles.html" target="_blank" showLaunchIcon={false} isInline>
                {intl.formatMessage(messages['authz.tabs.permissionsRoles.courses.alert.link'])}
              </Hyperlink>
            </div>
          </div>
        </Alert>
      )}
      <AnchorButton />
    </>
  );
};

export default RolesPermissions;
