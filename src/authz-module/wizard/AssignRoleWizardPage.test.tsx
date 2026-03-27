import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { useLibrary } from '../data/hooks';
import AssignRoleWizardPage from './AssignRoleWizardPage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  useLibrary: jest.fn(),
}));

jest.mock('./AssignRoleWizard', () => ({
  __esModule: true,
  default: ({ scope, initialUsers, onClose }: { scope: string; initialUsers?: string; onClose: () => void }) => (
    <div data-testid="assign-role-wizard" data-scope={scope} data-users={initialUsers}>
      <button type="button" data-testid="wizard-close" onClick={onClose}>Close</button>
      Assign Role Wizard
    </div>
  ),
}));

jest.mock('../components/AuthZLayout', () => ({
  __esModule: true,
  default: ({ children, pageTitle }: { children: React.ReactNode; pageTitle: string }) => (
    <div data-testid="authz-layout">
      <h1>{pageTitle}</h1>
      {children}
    </div>
  ),
}));

const mockUseLibrary = useLibrary as jest.Mock;

const setupMocks = ({
  scope = 'lib:123',
  users = '',
  library = {
    id: 'lib:123', title: 'Test Library', org: 'org', slug: 'test-lib',
  },
} = {}) => {
  const { useSearchParams, useNavigate } = jest.requireMock('react-router-dom');
  useSearchParams.mockReturnValue([new URLSearchParams(`scope=${scope}&users=${users}`)]);
  useNavigate.mockReturnValue(jest.fn());
  mockUseLibrary.mockReturnValue({ data: library });
};

describe('AssignRoleWizardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when scope is missing from search params', () => {
    const { useSearchParams, useNavigate } = jest.requireMock('react-router-dom');
    useSearchParams.mockReturnValue([new URLSearchParams('')]);
    useNavigate.mockReturnValue(jest.fn());
    mockUseLibrary.mockReturnValue({ data: null });

    const { container } = renderWrapper(<AssignRoleWizardPage />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when library data is not available', () => {
    const { useSearchParams, useNavigate } = jest.requireMock('react-router-dom');
    useSearchParams.mockReturnValue([new URLSearchParams('scope=lib:123')]);
    useNavigate.mockReturnValue(jest.fn());
    mockUseLibrary.mockReturnValue({ data: null });

    const { container } = renderWrapper(<AssignRoleWizardPage />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the wizard when scope and library are present', () => {
    setupMocks();
    renderWrapper(<AssignRoleWizardPage />);
    expect(screen.getByTestId('assign-role-wizard')).toBeInTheDocument();
  });

  it('passes scope to the wizard', () => {
    setupMocks({ scope: 'lib:456' });
    renderWrapper(<AssignRoleWizardPage />);
    expect(screen.getByTestId('assign-role-wizard')).toHaveAttribute('data-scope', 'lib:456');
  });

  it('passes initialUsers from search params to the wizard', () => {
    setupMocks({ users: 'alice,bob' });
    renderWrapper(<AssignRoleWizardPage />);
    expect(screen.getByTestId('assign-role-wizard')).toHaveAttribute('data-users', 'alice,bob');
  });

  it('renders the layout with Assign Role title', () => {
    setupMocks();
    renderWrapper(<AssignRoleWizardPage />);
    expect(screen.getByRole('heading', { name: 'Assign Role' })).toBeInTheDocument();
  });

  it('navigates to team members path when wizard onClose is triggered', async () => {
    setupMocks();
    const mockNavigate = jest.fn();
    const { useNavigate } = jest.requireMock('react-router-dom');
    useNavigate.mockReturnValue(mockNavigate);

    const user = userEvent.setup();
    renderWrapper(<AssignRoleWizardPage />);
    await user.click(screen.getByTestId('wizard-close'));

    expect(mockNavigate).toHaveBeenCalledWith('/authz/libraries/lib:123');
  });
});
