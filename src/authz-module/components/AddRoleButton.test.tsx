import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initializeMocks, renderWithAllProviders } from '@src/testUtils';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { CONTENT_COURSE_PERMISSIONS, CONTENT_LIBRARY_PERMISSIONS } from '@src/authz-module/roles-permissions';
import AddRoleButton from './AddRoleButton';

jest.mock('@src/data/hooks', () => ({
  ...jest.requireActual('@src/data/hooks'),
  useValidateUserPermissionsNonSuspense: jest.fn(),
}));

jest.mock('@src/authz-module/data/hooks', () => ({
  useValidateUsers: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useAssignTeamMembersRole: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
}));

jest.mock('@src/authz-module/hooks/useCourseAuthoringFlag', () => ({
  useCourseAuthoringFlag: () => ({
    isCourseAuthoringEnabled: true,
    isCourseEnabled: () => true,
    isOrgAuthoringEnabled: () => true,
    isLoading: false,
  }),
}));

const mockUseValidatePermissions = useValidateUserPermissionsNonSuspense as jest.Mock;
const allowAllPermissions = {
  data: [
    { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, allowed: true },
    { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, allowed: true },
  ],
  isLoading: false,
};

const renderButton = (props = {}) => renderWithAllProviders(
  <ToastManagerProvider>
    <AddRoleButton {...props} />
  </ToastManagerProvider>,
);

const getButton = () => screen.getByRole('button', { name: /assign role/i });
const getWizard = () => screen.queryByRole('dialog', { name: 'Assign Role' });

describe('AddRoleButton', () => {
  beforeAll(() => {
    initializeMocks();
  });

  beforeEach(() => {
    mockUseValidatePermissions.mockReturnValue(allowAllPermissions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the assign role button with correct text', () => {
      renderButton();

      expect(getButton()).toBeInTheDocument();
    });

    it('displays the plus icon', () => {
      renderButton();

      expect(getButton().querySelector('svg')).toBeInTheDocument();
    });

    it('keeps the wizard closed until the button is clicked', () => {
      renderButton();

      expect(getWizard()).not.toBeInTheDocument();
    });
  });

  describe('opening the wizard', () => {
    it('opens the assign role wizard when clicked', async () => {
      const user = userEvent.setup();
      renderButton();

      await user.click(getButton());

      expect(getWizard()).toBeInTheDocument();
    });

    it('pre-fills the wizard with presetUsername', async () => {
      const user = userEvent.setup();
      renderButton({ presetUsername: 'john.doe' });

      await user.click(getButton());

      expect(screen.getByLabelText(/Add users by username or email/i)).toHaveValue('john.doe');
    });

    it('pre-fills the wizard with an email address', async () => {
      const user = userEvent.setup();
      renderButton({ presetUsername: 'user@example.com' });

      await user.click(getButton());

      expect(screen.getByLabelText(/Add users by username or email/i)).toHaveValue('user@example.com');
    });

    it('returns to the host page when the wizard is cancelled, and reopens on a second click', async () => {
      const user = userEvent.setup();
      renderButton({ presetUsername: 'testuser' });

      await user.click(getButton());
      await user.click(screen.getByRole('button', { name: /^Cancel$/i }));
      expect(getWizard()).not.toBeInTheDocument();
      expect(getButton()).toBeInTheDocument();

      await user.click(getButton());
      expect(getWizard()).toBeInTheDocument();
      expect(screen.getByLabelText(/Add users by username or email/i)).toHaveValue('testuser');
    });
  });

  describe('user interactions', () => {
    it('responds to keyboard navigation', async () => {
      const user = userEvent.setup();
      renderButton();

      await user.tab();
      expect(getButton()).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(getWizard()).toBeInTheDocument();
    });

    it('responds to spacebar activation', async () => {
      const user = userEvent.setup();
      renderButton();

      getButton().focus();

      await user.keyboard(' ');
      expect(getWizard()).toBeInTheDocument();
    });
  });

  describe('permission gating', () => {
    it('does not render the button when the user cannot manage any team', () => {
      mockUseValidatePermissions.mockReturnValue({
        data: [
          { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, allowed: false },
          { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, allowed: false },
        ],
        isLoading: false,
      });
      renderButton();

      expect(screen.queryByRole('button', { name: /assign role/i })).not.toBeInTheDocument();
    });

    it('renders the button when at least one team-management permission is allowed', () => {
      mockUseValidatePermissions.mockReturnValue({
        data: [
          { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, allowed: false },
          { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, allowed: true },
        ],
        isLoading: false,
      });
      renderButton();

      expect(screen.getByRole('button', { name: /assign role/i })).toBeInTheDocument();
    });

    it('does not render the button while permissions are loading', () => {
      mockUseValidatePermissions.mockReturnValue({ data: undefined, isLoading: true });
      renderButton();

      expect(screen.queryByRole('button', { name: /assign role/i })).not.toBeInTheDocument();
    });
  });
});
