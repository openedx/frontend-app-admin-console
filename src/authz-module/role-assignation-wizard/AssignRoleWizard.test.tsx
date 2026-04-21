import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import { useValidateUsers } from '../data/hooks';
import AssignRoleWizard from './AssignRoleWizard';

jest.mock('@edx/frontend-platform/logging');
jest.mock('../data/hooks', () => ({
  useValidateUsers: jest.fn(),
}));

const mockUseValidateUsers = useValidateUsers as jest.Mock;
const mockValidateMutateAsync = jest.fn();

const renderWizard = (props = {}) => renderWrapper(
  <ToastManagerProvider>
    <AssignRoleWizard onClose={jest.fn()} {...props} />
  </ToastManagerProvider>,
);

// selectors
const getUsersInput = () => screen.getByLabelText(/Add users by username or email/i);
const getRoleRadio = (name: RegExp) => screen.getByRole('radio', { name });
const getNextButton = () => screen.getByRole('button', { name: /^Next$/i });
const getCancelButton = () => screen.getByRole('button', { name: /^Cancel$/i });
const getStep2Heading = () => screen.queryByRole('heading', { name: 'Step 2' });

describe('AssignRoleWizard — Step 1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseValidateUsers.mockReturnValue({
      mutateAsync: mockValidateMutateAsync,
      isPending: false,
    });
  });

  it('Cancel returns to the previous view', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderWizard({ onClose });
    await user.click(getCancelButton());
    expect(onClose).toHaveBeenCalled();
  });

  it('opens with the user pre-populated when provided via initialUsers', () => {
    renderWizard({ initialUsers: 'alice' });
    expect(getUsersInput()).toHaveValue('alice');
  });

  it('selecting a different role replaces the previous selection', async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getRoleRadio(/Course Admin/i));
    expect(getRoleRadio(/Course Admin/i)).toBeChecked();
    expect(getRoleRadio(/Library Admin/i)).not.toBeChecked();
  });

  it('blocks progression and highlights the unknown user', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: ['ghost'], validUsers: [] });
    renderWizard();
    await user.type(getUsersInput(), 'ghost');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => {
      expect(screen.getByText(/not associated with an account/i)).toBeInTheDocument();
      expect(getStep2Heading()).not.toBeInTheDocument();
    });
  });

  it('advances to Step 2 when all users are valid', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: [], validUsers: ['alice'] });
    renderWizard();
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Step 2' })).toBeInTheDocument();
    });
  });

  it('shows a network error and blocks progression when the validation call fails', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockRejectedValue(new Error('Network error'));
    renderWizard();
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => {
      // Toast should appear with retry option
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(getStep2Heading()).not.toBeInTheDocument();
    });
  });

  it('clears the invalid user highlights when the input is edited', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: ['ghost'], validUsers: [] });
    renderWizard();
    await user.type(getUsersInput(), 'ghost');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => expect(screen.getByText(/not associated with an account/i)).toBeInTheDocument());
    await user.type(getUsersInput(), 'x');
    await waitFor(() => expect(screen.queryByText(/not associated with an account/i)).not.toBeInTheDocument());
  });

  it('allows retry when validation call fails', async () => {
    const user = userEvent.setup();
    mockValidateMutateAsync
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ invalidUsers: [], validUsers: ['alice'] });
    renderWizard();
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));

    // First attempt fails - toast appears with retry
    await user.click(getNextButton());
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    // Should advance to step 2 on retry
    await waitFor(() => {
      expect(getStep2Heading()).toBeInTheDocument();
    });
  });
});

describe('AssignRoleWizard — Step 2', () => {
  const advanceToStep2 = async (user: ReturnType<typeof userEvent.setup>) => {
    mockValidateMutateAsync.mockResolvedValue({ invalidUsers: [], validUsers: ['alice'] });
    await user.type(getUsersInput(), 'alice');
    await user.click(getRoleRadio(/Library Admin/i));
    await user.click(getNextButton());
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Step 2' })).toBeInTheDocument();
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseValidateUsers.mockReturnValue({
      mutateAsync: mockValidateMutateAsync,
      isPending: false,
    });
  });

  it('Back button returns to Step 1', async () => {
    const user = userEvent.setup();
    renderWizard();
    await advanceToStep2(user);
    await user.click(screen.getByRole('button', { name: /^Back$/i }));
    await waitFor(() => {
      expect(getUsersInput()).toBeInTheDocument();
    });
  });
});
