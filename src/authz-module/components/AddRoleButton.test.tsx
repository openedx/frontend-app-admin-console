import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initializeMocks, renderWithAllProviders } from '@src/testUtils';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import {
  CONTENT_COURSE_PERMISSIONS,
  CONTENT_LIBRARY_PERMISSIONS,
  courseRolesMetadata,
  libraryRolesMetadata,
} from '@src/authz-module/roles-permissions';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import { useValidateUsers } from '@src/authz-module/data/hooks';
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
  useCourseAuthoringFlag: jest.fn(),
}));

const mockUseValidatePermissions = useValidateUserPermissionsNonSuspense as jest.Mock;
const mockUseCourseAuthoringFlag = useCourseAuthoringFlag as jest.Mock;
const mockUseValidateUsers = useValidateUsers as jest.Mock;
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
    // Restated here because `mockImplementation` outlives `clearAllMocks`.
    mockUseValidateUsers.mockImplementation(() => ({ mutateAsync: jest.fn(), isPending: false }));
    mockUseValidatePermissions.mockReturnValue(allowAllPermissions);
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: true,
      isCourseEnabled: () => true,
      isOrgAuthoringEnabled: () => true,
      isLoading: false,
    });
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

    // The wizard is mounted only while open. Hiding it instead would carry one
    // instance across openings, and with it the request state of the opening the
    // admin already abandoned. `useValidateUsers` keeps `isPending` per hook
    // instance, so the mock does too: that is the property the unmount relies on.
    it('does not leave a reopened wizard waiting on the abandoned request', async () => {
      const user = userEvent.setup();
      mockUseValidateUsers.mockImplementation(() => {
        const [isPending, setIsPending] = useState(false);
        return {
          isPending,
          mutateAsync: () => {
            setIsPending(true);
            // Never settles: the slow connection from the repro.
            return new Promise(() => {});
          },
        };
      });
      renderButton({ presetUsername: 'alice' });

      await user.click(getButton());
      await user.click(screen.getByRole('radio', { name: /Library Admin/i }));
      await user.click(screen.getByRole('button', { name: /^Next$/i }));
      expect(screen.getByRole('button', { name: /Validating/i })).toBeDisabled();

      await user.click(screen.getByRole('button', { name: /^Cancel$/i }));
      await user.click(getButton());

      expect(screen.queryByRole('button', { name: /Validating/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Next$/i })).toBeInTheDocument();
    });

    it('gives each opening a fresh form rather than reviving the last one', async () => {
      const user = userEvent.setup();
      renderButton();

      await user.click(getButton());
      await user.type(screen.getByLabelText(/Add users by username or email/i), 'abandoned');
      await user.click(screen.getByRole('button', { name: /^Cancel$/i }));

      await user.click(getButton());
      expect(screen.getByLabelText(/Add users by username or email/i)).toHaveValue('');
      expect(screen.getByRole('button', { name: /^Next$/i })).toBeDisabled();
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

  describe('assignable roles', () => {
    // Each entry maps an allowed permission to the role metadata the wizard should
    // surface for it. Add a row here as more scopes/roles are introduced.
    const scopeRoles = [
      { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, roles: libraryRolesMetadata },
      { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, roles: courseRolesMetadata },
    ];
    const allRoles = scopeRoles.flatMap(({ roles }) => roles);

    const openWizard = async () => {
      const user = userEvent.setup();
      renderButton();
      await user.click(getButton());
    };

    it('offers the roles for every allowed scope', async () => {
      await openWizard();

      allRoles.forEach((role) => {
        expect(screen.getByText(role.name)).toBeInTheDocument();
      });
    });

    it.each(scopeRoles)('offers only the roles for the allowed scope %#', async ({ action, roles }) => {
      mockUseValidatePermissions.mockReturnValue({
        data: scopeRoles.map((scope) => ({ action: scope.action, allowed: scope.action === action })),
        isLoading: false,
      });
      await openWizard();

      roles.forEach((role) => {
        expect(screen.getByText(role.name)).toBeInTheDocument();
      });
      allRoles
        .filter((role) => !roles.includes(role))
        .forEach((role) => {
          expect(screen.queryByText(role.name)).not.toBeInTheDocument();
        });
    });

    it('ignores allowed permissions whose action is not a known role scope', async () => {
      mockUseValidatePermissions.mockReturnValue({
        data: [{ action: 'some.unrelated.permission', allowed: true }],
        isLoading: false,
      });
      await openWizard();

      allRoles.forEach((role) => {
        expect(screen.queryByText(role.name)).not.toBeInTheDocument();
      });
    });

    it('hides course roles when the course-authoring flag is disabled even if MANAGE_COURSE_TEAM is allowed', async () => {
      mockUseCourseAuthoringFlag.mockReturnValue({
        isCourseAuthoringEnabled: false,
        isCourseEnabled: () => false,
        isOrgAuthoringEnabled: () => false,
        isLoading: false,
      });
      await openWizard();

      courseRolesMetadata.forEach((role) => {
        expect(screen.queryByText(role.name)).not.toBeInTheDocument();
      });
      libraryRolesMetadata.forEach((role) => {
        expect(screen.getByText(role.name)).toBeInTheDocument();
      });
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
