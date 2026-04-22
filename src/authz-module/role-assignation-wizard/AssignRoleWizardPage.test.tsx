import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import { useValidateUsers } from '../data/hooks';
import AssignRoleWizardPage from './AssignRoleWizardPage';

jest.mock('@edx/frontend-platform/logging');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  useValidateUsers: jest.fn(),
  useAssignTeamMembersRole: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
  })),
}));

jest.mock('@edx/frontend-component-header', () => ({
  StudioHeader: () => null,
}));

const mockUseValidateUsers = useValidateUsers as jest.Mock;

const setupMocks = ({ users = '', from = '' } = {}) => {
  const { useSearchParams, useNavigate } = jest.requireMock('react-router-dom');
  const params = new URLSearchParams();
  if (users) { params.set('users', users); }
  if (from) { params.set('from', from); }
  useSearchParams.mockReturnValue([params]);
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  return { navigate };
};

const renderPage = () => renderWrapper(
  <ToastManagerProvider>
    <AssignRoleWizardPage />
  </ToastManagerProvider>,
);

describe('AssignRoleWizardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseValidateUsers.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it('renders the page with the wizard and title', () => {
    setupMocks();
    renderPage();
    expect(screen.getByRole('heading', { name: 'Assign Role' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Add users by username or email/i)).toBeInTheDocument();
  });

  it('passes initialUsers from search params to the wizard', () => {
    setupMocks({ users: 'alice,bob' });
    renderPage();
    expect(screen.getByLabelText(/Add users by username or email/i)).toHaveValue('alice,bob');
  });

  it('navigates to home path when the wizard Cancel is clicked', async () => {
    const { navigate } = setupMocks();
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(navigate).toHaveBeenCalledWith('/authz');
  });

  it('navigates to the from= path when Cancel is clicked and a from param is present', async () => {
    const { navigate } = setupMocks({ from: '/authz/libraries/lib:123/alice' });
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(navigate).toHaveBeenCalledWith('/authz/libraries/lib:123/alice');
  });

  it('navigates to home path when from is an external URL', async () => {
    const { navigate } = setupMocks({ from: 'https://evil.com' });
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(navigate).toHaveBeenCalledWith('/authz');
  });

  it('navigates to the user-specific view when a single preset user is set', async () => {
    const { navigate } = setupMocks({ users: 'alice' });
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(navigate).toHaveBeenCalledWith('/authz/user/alice');
  });

  it('navigates to returnTo when multiple preset users are set', async () => {
    const { navigate } = setupMocks({ users: 'alice,bob', from: '/authz/team' });
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(navigate).toHaveBeenCalledWith('/authz/team');
  });
});
