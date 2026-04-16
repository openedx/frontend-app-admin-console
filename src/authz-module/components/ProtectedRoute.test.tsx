import { render, screen } from '@testing-library/react';
import { useValidateUserPermissions } from '@src/data/hooks';
import { ProtectedRoute } from './ProtectedRoute';

// Mock the hooks
jest.mock('@src/data/hooks', () => ({
  useValidateUserPermissions: jest.fn(),
}));

jest.mock('@src/components/LoadingPage', () => function LoadingPage() {
  return <div>Loading...</div>;
});

const mockUseValidateUserPermissions = useValidateUserPermissions as jest.Mock;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseValidateUserPermissions.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(
      <ProtectedRoute>
        <div>Child Component</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders children when user has access', () => {
    mockUseValidateUserPermissions.mockReturnValue({
      data: [{ allowed: true }],
      isLoading: false,
      isError: false,
    });

    render(
      <ProtectedRoute>
        <div>Child Component</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('renders fallback when error and fallback provided', () => {
    mockUseValidateUserPermissions.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(
      <ProtectedRoute fallback={<div>Error Fallback</div>}>
        <div>Child Component</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Error Fallback')).toBeInTheDocument();
  });
});
