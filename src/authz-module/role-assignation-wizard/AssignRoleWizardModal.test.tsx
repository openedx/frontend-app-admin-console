import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders } from '@src/testUtils';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { useValidateUsers } from '@src/authz-module/data/hooks';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import {
  CONTENT_COURSE_PERMISSIONS,
  CONTENT_LIBRARY_PERMISSIONS,
  courseRolesMetadata,
  libraryRolesMetadata,
} from '@src/authz-module/roles-permissions';
import AssignRoleWizardModal from './AssignRoleWizardModal';

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

jest.mock('@src/data/hooks', () => ({
  ...jest.requireActual('@src/data/hooks'),
  useValidateUserPermissionsNonSuspense: jest.fn(),
}));

jest.mock('../hooks/useCourseAuthoringFlag', () => ({
  useCourseAuthoringFlag: jest.fn(),
}));

const mockUseValidateUsers = useValidateUsers as jest.Mock;
const mockUseValidatePermissions = useValidateUserPermissionsNonSuspense as jest.Mock;
const mockUseCourseAuthoringFlag = useCourseAuthoringFlag as jest.Mock;
const allowAllPermissions = {
  data: [
    { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, allowed: true },
    { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, allowed: true },
  ],
  isLoading: false,
};

const mockPermissions = (
  manageData: typeof allowAllPermissions,
) => () => manageData;

const renderModal = (props = {}) => renderWithAllProviders(
  <ToastManagerProvider>
    <AssignRoleWizardModal isOpen onClose={jest.fn()} {...props} />
  </ToastManagerProvider>,
);

describe('AssignRoleWizardModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseValidateUsers.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
    mockUseValidatePermissions.mockImplementation(mockPermissions(allowAllPermissions));
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: true,
      isCourseEnabled: () => true,
      isLoading: false,
    });
  });

  it('shows the wizard in a modal titled "Assign Role"', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: 'Assign Role' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Add users by username or email/i)).toBeInTheDocument();
  });

  it('renders nothing while closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('passes initialUsers to the wizard', () => {
    renderModal({ initialUsers: 'alice,bob' });
    expect(screen.getByLabelText(/Add users by username or email/i)).toHaveValue('alice,bob');
  });

  it('calls onClose when the wizard is cancelled, leaving the host page in place', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    renderModal({ onClose });
    await user.click(screen.getByRole('button', { name: /^Cancel$/i }));
    expect(onClose).toHaveBeenCalled();
  });

  describe('assignable roles', () => {
    // Each entry maps an allowed permission to the role metadata the wizard should
    // surface for it. Add a row here as more scopes/roles are introduced.
    const scopeRoles = [
      { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, roles: libraryRolesMetadata },
      { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, roles: courseRolesMetadata },
    ];
    const allRoles = scopeRoles.flatMap(({ roles }) => roles);

    it('shows the roles for every allowed scope', () => {
      renderModal();
      allRoles.forEach((role) => {
        expect(screen.getByText(role.name)).toBeInTheDocument();
      });
    });

    it.each(scopeRoles)('shows only the roles for the allowed scope %#', ({ action, roles }) => {
      mockUseValidatePermissions.mockImplementation(mockPermissions({
        data: scopeRoles.map((scope) => ({ action: scope.action, allowed: scope.action === action })),
        isLoading: false,
      }));
      renderModal();

      roles.forEach((role) => {
        expect(screen.getByText(role.name)).toBeInTheDocument();
      });
      allRoles
        .filter((role) => !roles.includes(role))
        .forEach((role) => {
          expect(screen.queryByText(role.name)).not.toBeInTheDocument();
        });
    });

    it('shows no roles when no scope is allowed', () => {
      mockUseValidatePermissions.mockImplementation(mockPermissions({
        data: scopeRoles.map(({ action }) => ({ action, allowed: false })),
        isLoading: false,
      }));
      renderModal();
      allRoles.forEach((role) => {
        expect(screen.queryByText(role.name)).not.toBeInTheDocument();
      });
    });

    it('ignores allowed permissions whose action is not a known role scope', () => {
      mockUseValidatePermissions.mockImplementation(mockPermissions({
        data: [{ action: 'some.unrelated.permission', allowed: true }],
        isLoading: false,
      }));
      renderModal();
      allRoles.forEach((role) => {
        expect(screen.queryByText(role.name)).not.toBeInTheDocument();
      });
    });

    it('hides course roles when the course-authoring flag is disabled even if MANAGE_COURSE_TEAM is allowed', () => {
      mockUseCourseAuthoringFlag.mockReturnValue({
        isCourseAuthoringEnabled: false,
        isCourseEnabled: () => false,
        isLoading: false,
      });
      renderModal();
      courseRolesMetadata.forEach((role) => {
        expect(screen.queryByText(role.name)).not.toBeInTheDocument();
      });
      libraryRolesMetadata.forEach((role) => {
        expect(screen.getByText(role.name)).toBeInTheDocument();
      });
    });
  });
});
