import { ComponentType } from 'react';
import {
  Chip, Col, Row,
} from '@openedx/paragon';
import { actionsDictionary, ActionKey } from './constants';

interface Action {
  key: string;
  label?: string;
  disabled?: boolean;
}

interface PermissionRowProps {
  resourceLabel: string;
  actions: Action[];
}

const PermissionRow = ({ resourceLabel, actions }: PermissionRowProps) => (
  <Row className="row align-items-center border px-2 py-2">
    <Col md={3}>
      <span className="small font-weight-bold">{resourceLabel}</span>
    </Col>
    <Col>
      <div className="w-100 d-flex flex-wrap">
        {actions.map(action => (
          <Chip
            key={action.key}
            iconBefore={actionsDictionary[action.key as ActionKey] as ComponentType}
            disabled={action.disabled}
            className="mr-4 my-2 px-3 bg-primary-100 border-0 permission-chip"
            variant="light"
          >
            {action.label}
          </Chip>
        ))}
      </div>
    </Col>
  </Row>
);

export default PermissionRow;
