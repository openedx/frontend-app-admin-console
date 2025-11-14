import { Spinner, Container } from '@openedx/paragon';

const LoadingPage = () => (
  <Container className="d-flex vh-100">
    <Spinner
      variant="primary"
      animation="border"
      role="status"
      className="mb-3 m-auto"
    />
  </Container>
);

export default LoadingPage;
