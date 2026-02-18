import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from 'react-error-boundary';
import { renderWrapper } from '@src/setupTest';
import LibrariesErrorFallback from './index';

const ThrowError = ({ error }: { error:Error }) => {
  throw error;
  return null;
};

describe('LibrariesErrorFallback', () => {
  it('renders Access Denied for 401', () => {
    const error = { name: '', message: 'NO_ACCESS', customAttributes: { httpErrorStatus: 401 } };
    renderWrapper(
      <ErrorBoundary FallbackComponent={LibrariesErrorFallback}>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Libraries/i)).toBeInTheDocument();
  });

  it('renders Not Found for 400 error', () => {
    const error = { name: '', message: 'Axios Error (Response): 400', customAttributes: { httpErrorStatus: 400 } };
    renderWrapper(
      <ErrorBoundary FallbackComponent={LibrariesErrorFallback}>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Libraries/i)).toBeInTheDocument();
  });

  it('renders Not Found for 404', () => {
    const error = { name: '', message: 'NOT_FOUND', customAttributes: { httpErrorStatus: 404 } };
    renderWrapper(
      <ErrorBoundary FallbackComponent={LibrariesErrorFallback}>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Libraries/i)).toBeInTheDocument();
  });

  it('renders Server Error for 500 and shows reload', async () => {
    const error = { name: '', message: 'SERVER_ERROR', customAttributes: { httpErrorStatus: 500 } };
    renderWrapper(
      <ErrorBoundary FallbackComponent={LibrariesErrorFallback}>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Reload Page/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Libraries/i)).toBeInTheDocument();
  });

  it('renders generic error for other error error', () => {
    const error = { name: '', message: 'SOMETHING_ELSE', customAttributes: { httpErrorStatus: 418 } };
    renderWrapper(
      <ErrorBoundary FallbackComponent={LibrariesErrorFallback}>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Libraries/i)).toBeInTheDocument();
  });

  it('calls reload action if present', async () => {
    // Simulate error with a refetch function
    const refetch = jest.fn();
    const error = {
      name: '', message: 'SERVER_ERROR', customAttributes: { httpErrorStatus: 500 }, refetch,
    };
    renderWrapper(
      <ErrorBoundary FallbackComponent={LibrariesErrorFallback} onReset={refetch}>
        <ThrowError error={error} />
      </ErrorBoundary>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByText(/Reload Page/i));
    expect(refetch).toHaveBeenCalled();
  });
});
