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
    <Col md={2}>
      <span className="small font-weight-bold">{resourceLabel}</span>
    </Col>
    <Col>
      <div className="w-100 d-flex flex-wrap align-items-center">
        {actions.map((action, index) => (
          <>
            <Chip
              key={action.key}
              iconBefore={actionsDictionary[action.key as ActionKey] as ComponentType}
              disabled={action.disabled}
              className="mx-3 my-2 px-3 bg-primary-100 border-0 permission-chip"
              variant="light"
            >
              {action.label}
            </Chip>
            {(index === actions.length - 1) ? null
              : (<hr className="border-right mx-2" style={{ height: '24px' }} />)}
          </>
        ))}
      </div>
    </Col>
  </Row>
);

export default PermissionRow;
