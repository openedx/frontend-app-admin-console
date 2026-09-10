import { useIntl } from '@edx/frontend-platform/i18n';
import { Spinner, Container } from '@openedx/paragon';
import messages from './messages';

/**
 * Full-page loading state.
 */
const LoadingPage = () => {
  const intl = useIntl();

  return (
    <Container className="d-flex vh-100">
      <Spinner
        variant="primary"
        animation="border"
        screenReaderText={intl.formatMessage(messages['loading.page.screenreader.text'])}
        className="mb-3 m-auto"
      />
    </Container>
  );
};

export default LoadingPage;
