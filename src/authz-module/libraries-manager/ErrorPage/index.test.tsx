import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import { renderWrapper } from '@src/setupTest';
import LibrariesErrorFallback from './index';

const ThrowError = ({ error }) => {
  throw error;
  return null
}

describe('LibrariesErrorFallback', () => {
  it('renders Access Denied for 401', () => {
    const error = { message: 'NO_ACCESS', customAtributtes: { httpErrorStatus: 401 } };
    renderWrapper(
      <ErrorBoundary FallbackComponent={LibrariesErrorFallback}>
        <ThrowError error={error} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Libraries/i)).toBeInTheDocument();
  });

  it('renders Not Found for 404', () => {
    const error = { message: 'NOT_FOUND', customAtributtes: { httpErrorStatus: 404 } };
    renderWrapper(
      <ErrorBoundary FallbackComponent={LibrariesErrorFallback}>
        <ThrowError error={error} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Libraries/i)).toBeInTheDocument();
  });

  it('renders Server Error for 500 and shows reload', async () => {
    const error = { message: 'SERVER_ERROR', customAtributtes: { httpErrorStatus: 500 } };
    renderWrapper(
      <ErrorBoundary FallbackComponent={LibrariesErrorFallback}>
        <ThrowError error={error} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Reload Page/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Libraries/i)).toBeInTheDocument();
  });

  it('renders generic error for other error error', () => {
    const error = { message: 'SOMETHING_ELSE', customAtributtes: { httpErrorStatus: 418 } };
    renderWrapper(
      <ErrorBoundary FallbackComponent={LibrariesErrorFallback}>
        <ThrowError error={error} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Libraries/i)).toBeInTheDocument();
  });

  it('calls reload action if present', async () => {
    // Simulate error with a refetch function
    const refetch = jest.fn();
    const error = { message: 'SERVER_ERROR', customAtributtes: { httpErrorStatus: 500 }, refetch };
    renderWrapper(
      <ErrorBoundary FallbackComponent={LibrariesErrorFallback} onReset={refetch}>
        <ThrowError error={error} />
      </ErrorBoundary>
    );
    const reloadBtn = screen.getByText(/Reload Page/i);
    fireEvent.click(reloadBtn);
    // If your ErrorPage uses error.refetch, this will be called
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });
});
