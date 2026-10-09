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
  showDivider?: boolean;
}

export const ActionButton = ({ label, icon, onClick }: Action) => (
  <Button
    size="sm"
    iconBefore={icon}
    onClick={onClick}
  >
    {label}
  </Button>
);

const AuthZTitle = ({
  activeLabel, navLinks = [], pageTitle, pageSubtitle, actions = [], showDivider = false,
}: AuthZTitleProps) => {
  const shouldRenderBreadcrumb = activeLabel || navLinks?.length > 0;
  const isDesktop = useMediaQuery({ minWidth: breakpoints.large.minWidth });
  return (
    <div className={`page-band py-4 bg-light-100${showDivider ? ' title-border-bottom' : ''}`}>
      { shouldRenderBreadcrumb
      && (
        <Breadcrumb
          linkAs={Link}
          links={navLinks}
          activeLabel={activeLabel}
        />
      )}
      <Row>
        <Col xs={12} md={7}>
          <div className="d-flex align-items-center flex-column-sm mb-3 mb-md-0">
            <h2 className="text-primary mb-0">{pageTitle}</h2>
            {pageSubtitle && (
              <>
                <hr className="authz-action-divider mx-lg-3 my-md-0 mx-md-3" />
                {typeof pageSubtitle === 'string'
                  ? <h3 className="mb-0 font-weight-light text-gray-700">{pageSubtitle}</h3>
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
