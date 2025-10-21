import { ComponentType, isValidElement, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb, Col, Container, Row, Button, Badge,
} from '@openedx/paragon';

interface BreadcrumbLink {
  label: string;
  to?: string;
}

interface Action {
  label: string;
  icon?: ComponentType;
  onClick: () => void;
}

export interface AuthZTitleProps {
  activeLabel: string;
  pageTitle: string;
  pageSubtitle: string | ReactNode;
  navLinks?: BreadcrumbLink[];
  actions?: (Action | ReactNode)[];
}

const AuthZTitle = ({
  activeLabel, navLinks = [], pageTitle, pageSubtitle, actions = [],
}: AuthZTitleProps) => (
  <Container className="p-5 bg-light-100">
    <Breadcrumb
      linkAs={Link}
      links={navLinks}
      activeLabel={activeLabel}
    />
    <Row className="mt-4">
      <Col xs={12} md={8} className="mb-4">
        <h1 className="text-primary">{pageTitle}</h1>
        {typeof pageSubtitle === 'string'
          ? <h3><Badge className="py-2 px-3 font-weight-normal" variant="light">{pageSubtitle}</Badge></h3>
          : pageSubtitle}
      </Col>
      <Col xs={12} md={4}>
        <div className="d-flex justify-content-md-end">
          {
            actions.map((action) => {
              if (isValidElement(action)) {
                return action;
              }

              const { label, icon, onClick } = action as Action;
              return (
                <Button
                  key={`authz-header-action-${label}`}
                  iconBefore={icon}
                  onClick={onClick}
                >
                  {label}
                </Button>
              );
            })
          }
        </div>
      </Col>
    </Row>
  </Container>
);

export default AuthZTitle;
