import {
  ComponentType, isValidElement, ReactNode, Fragment,
} from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb, Col, Container, Row, Button, Badge,
  Stack,
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

export const ActionButton = ({ label, icon, onClick }: Action) => (
  <Button
    iconBefore={icon}
    onClick={onClick}
  >
    {label}
  </Button>
);

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
      <Col xs={12} md={7} className="mb-4">
        <h1 className="text-primary">{pageTitle}</h1>
        {typeof pageSubtitle === 'string'
          ? <h3><Badge className="py-2 px-3 font-weight-normal" variant="light">{pageSubtitle}</Badge></h3>
          : pageSubtitle}
      </Col>
      <Col xs={12} md={5}>
        <Stack gap={3} direction="horizontal">
          {
            actions.map((action, index) => {
              const content = isValidElement(action)
                ? action
                : <ActionButton {...action as Action} />;
              const key = isValidElement(action)
                ? action.key
                : (action as Action).label;
              return (
                <Fragment key={`authz-header-action-${key}`}>
                  {content}
                  {(index === actions.length - 1) ? null
                    : (<hr className="border-right" />)}
                </Fragment>
              );
            })
          }
        </Stack>
      </Col>
    </Row>
  </Container>
);

export default AuthZTitle;
