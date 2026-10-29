import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initializeMocks, renderWithAllProviders } from '@src/testUtils';
import { authzCatalog, mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import { getScopeCatalog } from '@src/authz-module/catalog/utils';
import { SCOPE_TYPES } from '@src/authz-module/constants';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import {
  CONTENT_COURSE_PERMISSIONS,
  CONTENT_LIBRARY_PERMISSIONS,
} from '@src/authz-module/roles-permissions';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import { useValidateUsers } from '@src/authz-module/data/hooks';
import AddRoleButton from './AddRoleButton';

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
}));

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
    mockAuthzCatalog();
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
    const openWizard = async (props = {}) => {
      const user = userEvent.setup();
      renderButton(props);
      await user.click(getButton());
    };

    // Each entry maps an allowed permission to the catalog roles the wizard should
    // surface for it, from the catalog test fixture.
    const libraryRoles = ['Library Admin', 'Library Author', 'Library Contributor', 'Library User'];
    const courseRoles = ['Course Admin', 'Course Staff'];
    const scopeRoles = [
      { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, roles: libraryRoles },
      { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, roles: courseRoles },
    ];
    const allRoles = scopeRoles.flatMap(({ roles }) => roles);

    it('shows the roles for every allowed scope type, in catalog order', async () => {
      await openWizard();
      allRoles.forEach((role) => {
        expect(screen.getByText(role)).toBeInTheDocument();
      });
      expect(screen.getAllByRole('group')).toEqual([
        screen.getByRole('group', { name: 'Courses' }),
        screen.getByRole('group', { name: 'Libraries' }),
      ]);
    });

    it('lists the roles of each scope type in the catalog order', async () => {
      await openWizard();
      const catalogOrder = getScopeCatalog(authzCatalog, SCOPE_TYPES.LIBRARY).roles
        .map(({ displayName }) => displayName);
      const roleNames = Array.from(document.querySelectorAll('.role-name')).map(({ textContent }) => textContent);
      expect(roleNames.filter((name) => name?.startsWith('Library'))).toEqual(catalogOrder);
    });

    it.each(scopeRoles)('shows only the roles for the allowed scope type %#', async ({ action, roles }) => {
      mockUseValidatePermissions.mockReturnValue({
        data: scopeRoles.map((scope) => ({ action: scope.action, allowed: scope.action === action })),
        isLoading: false,
      });
      await openWizard();

      roles.forEach((role) => {
        expect(screen.getByText(role)).toBeInTheDocument();
      });
      allRoles
        .filter((role) => !roles.includes(role))
        .forEach((role) => {
          expect(screen.queryByText(role)).not.toBeInTheDocument();
        });
    });

    it('announces that the roles are loading while the catalog loads', async () => {
      mockAuthzCatalog({ isLoading: true });
      await openWizard({ presetUsername: 'alice' });
      expect(screen.getByRole('status')).toHaveTextContent('Loading roles...');
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    it('alerts that the roles could not be loaded when the catalog fails', async () => {
      mockAuthzCatalog({ isError: true });
      await openWizard({ presetUsername: 'alice' });
      expect(screen.getByRole('alert')).toHaveTextContent('The roles could not be loaded. Please try again later.');
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    it('ignores allowed permissions whose action is not a known role scope', async () => {
      mockUseValidatePermissions.mockReturnValue({
        data: [{ action: 'some.unrelated.permission', allowed: true }],
        isLoading: false,
      });
      await openWizard();
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });

    it('hides course roles when the course-authoring flag is disabled even if MANAGE_COURSE_TEAM is allowed', async () => {
      mockUseCourseAuthoringFlag.mockReturnValue({
        isCourseAuthoringEnabled: false,
        isCourseEnabled: () => false,
        isLoading: false,
      });
      await openWizard();
      courseRoles.forEach((role) => {
        expect(screen.queryByText(role)).not.toBeInTheDocument();
      });
      libraryRoles.forEach((role) => {
        expect(screen.getByText(role)).toBeInTheDocument();
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
