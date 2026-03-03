import { ComponentType } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Chip, Col, Row,
} from '@openedx/paragon';
import { RoleResourceGroup } from '@src/types';
import { actionsDictionary, ActionKey } from './constants';
import ResourceTooltip from '../ResourceTooltip';
import messages from './messages';

type PermissionRowProps = {
  resource: RoleResourceGroup;
};

const PermissionRow = ({ resource }: PermissionRowProps) => {
  const { formatMessage } = useIntl();
  return (
    <Row className="row align-items-center border px-2 py-2">
      <Col md={2}>
        <span className="small font-weight-bold">{resource.label}</span>
        <ResourceTooltip resourceGroup={resource} />
      </Col>
      <Col>
        <div className="w-100 d-flex flex-wrap align-items-center">
          {resource.permissions.map((action, index) => (
            <>
              <Chip
                key={action.key}
                iconBefore={actionsDictionary[action.actionKey as ActionKey] as ComponentType}
                disabled={action.disabled}
                className="mx-3 my-2 px-3 bg-primary-100 border-0 permission-chip"
                variant="light"
                aria-label={formatMessage(messages['authz.role.card.permissions.ariaLabel'], {
                  permissionName: action.label,
                  permissionStatus: formatMessage(messages[`authz.role.card.permissions.status.${action.disabled ? 'denied' : 'granted'}`]),
                })}
              >
                {action.label}
              </Chip>
              {(index === resource.permissions.length - 1) ? null
                : (<hr className="border-right mx-2" style={{ height: '24px' }} />)}
            </>
          ))}
        </div>
      </Col>
    </Row>
  );
};

export default PermissionRow;
