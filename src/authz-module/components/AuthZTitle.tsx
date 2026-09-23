import {
  ComponentType, isValidElement, ReactNode, Fragment,
} from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb, Col, Row, Button,
  Stack,
  useMediaQuery,
  breakpoints,
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
  activeLabel?: string;
  pageTitle: string;
  pageSubtitle?: string | ReactNode;
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
}: AuthZTitleProps) => {
  const isDesktop = useMediaQuery({ minWidth: breakpoints.large.minWidth });
  return (
    <div className="page-band py-5 bg-light-100">
      <Breadcrumb
        linkAs={Link}
        links={navLinks}
        activeLabel={activeLabel}
      />
      <Row className="mt-4">
        <Col xs={12} md={7} className="mb-4">
          <div className="d-flex align-items-center flex-column-sm">
            <h2 className="text-primary mb-0">{pageTitle}</h2>
            {pageSubtitle && (
              <>
                <hr className="authz-action-divider mx-lg-3" />
                {typeof pageSubtitle === 'string'
                  ? <h3 className="mb-0 py-2 font-weight-light text-gray-700">{pageSubtitle}</h3>
                  : <div className="mb-0">{pageSubtitle}</div>}
              </>
            )}

          </div>
        </Col>
        <Col xs={12} md={5}>
          <Stack className="justify-content-end" direction={isDesktop ? 'horizontal' : 'vertical'}>
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
                      : (<hr className="authz-action-divider mx-lg-5" />)}
                  </Fragment>
                );
              })
            }
          </Stack>
        </Col>
      </Row>
    </div>
  );
};

export default AuthZTitle;
