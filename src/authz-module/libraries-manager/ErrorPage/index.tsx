import { useState } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Container, Hyperlink, Row,
} from '@openedx/paragon';
import {
  CustomErrors, ERROR_STATUS, STATUS_400, STATUS_404,
} from '@src/constants';

import messages from './messages';

const getErrorConfig = ({ errorMessage, errorStatus }) => {
  if (errorMessage === CustomErrors.NO_ACCESS || ERROR_STATUS.NO_ACCESS.includes(errorStatus)) {
    return ({
      title: messages['error.page.title.noAccess'],
      description: messages['error.page.message.noAccess'],
      statusCode: errorStatus || ERROR_STATUS.NO_ACCESS[0],
      showBackButton: true,
    });
  }
  // 400 errors are handled as 404 Not Found to avoid exposing potential sensitive information
  // about the existence of resources and handling malformed library ids in the URL
  if (errorMessage === CustomErrors.NOT_FOUND || ERROR_STATUS.NOT_FOUND.includes(errorStatus)) {
    const statusCode = errorStatus === STATUS_400 ? STATUS_404 : errorStatus;
    return ({
      title: messages['error.page.title.notFound'],
      description: messages['error.page.message.notFound'],
      statusCode: statusCode || STATUS_404,
      showBackButton: true,
    });
  }
  if (errorMessage === CustomErrors.SERVER_ERROR || ERROR_STATUS.SERVER_ERROR.includes(errorStatus)) {
    return ({
      title: messages['error.page.title.server'],
      description: messages['error.page.message.server'],
      statusCode: errorStatus || ERROR_STATUS.SERVER_ERROR[0],
      showBackButton: true,
      showReloadButton: true,
    });
  }
  return ({
    title: messages['error.page.title.generic'],
    description: messages['error.page.message.generic'],
    showBackButton: true,
    showReloadButton: true,
  });
};

const ErrorPage = ({ error, resetErrorBoundary }: FallbackProps) => {
  const intl = useIntl();
  const [reloading, setReloading] = useState(false);

  const errorStatus: number = error?.customAttributes?.httpErrorStatus;
  const errorMessage: string = error?.message;
  const {
    title, description, statusCode, showBackButton, showReloadButton,
  } = getErrorConfig({ errorMessage, errorStatus });

  const handleReload = () => {
    setReloading(true);
    resetErrorBoundary();
  };
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light-200">
      <h1 className="display-4 text-primary-200">{statusCode}</h1>
      <h1 className="text-primary">{intl.formatMessage(title)}</h1>
      <p>{intl.formatMessage(description)}</p>
      <Row>
        {showReloadButton && (
        <Button
          className="m-2"
          disabled={reloading}
          onClick={handleReload}
        >
          {intl.formatMessage(messages['error.page.action.reload'])}
        </Button>
        )}
        {showBackButton && (
        <Button
          as={Hyperlink}
          destination={`${getConfig().COURSE_AUTHORING_MICROFRONTEND_URL}/libraries`}
          className="m-2"
          variant={showReloadButton ? 'outline-primary' : 'primary'}
        >
          {intl.formatMessage(messages['error.page.action.back'])}
        </Button>
        )}

      </Row>
    </Container>
  );
};

const LibrariesErrorFallback = (props: FallbackProps) => <ErrorPage {...props} />;
export default LibrariesErrorFallback;
