import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders } from '@src/setupTest';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';
import { useValidateUserPermissionsNonSuspense } from '@src/data/hooks';
import { useValidateUsers } from '../data/hooks';
import { useCourseAuthoringFlag } from '../hooks/useCourseAuthoringFlag';
import {
  CONTENT_COURSE_PERMISSIONS,
  CONTENT_LIBRARY_PERMISSIONS,
  courseRolesMetadata,
  libraryRolesMetadata,
} from '../roles-permissions';
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

const renderPage = () => renderWithAllProviders(
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
    mockUseValidatePermissions.mockImplementation(mockPermissions(allowAllPermissions));
    mockUseCourseAuthoringFlag.mockReturnValue({
      isCourseAuthoringEnabled: true,
      isCourseEnabled: () => true,
      isLoading: false,
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

  describe('assignable roles', () => {
    // Each entry maps an allowed permission to the role metadata the wizard should
    // surface for it. Add a row here as more scopes/roles are introduced.
    const scopeRoles = [
      { action: CONTENT_LIBRARY_PERMISSIONS.MANAGE_LIBRARY_TEAM, roles: libraryRolesMetadata },
      { action: CONTENT_COURSE_PERMISSIONS.MANAGE_COURSE_TEAM, roles: courseRolesMetadata },
    ];
    const allRoles = scopeRoles.flatMap(({ roles }) => roles);

    it('shows the roles for every allowed scope', () => {
      setupMocks();
      renderPage();
      allRoles.forEach((role) => {
        expect(screen.getByText(role.name)).toBeInTheDocument();
      });
    });

    it.each(scopeRoles)('shows only the roles for the allowed scope %#', ({ action, roles }) => {
      mockUseValidatePermissions.mockImplementation(mockPermissions({
        data: scopeRoles.map((scope) => ({ action: scope.action, allowed: scope.action === action })),
        isLoading: false,
      }));
      setupMocks();
      renderPage();

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
      setupMocks();
      renderPage();
      allRoles.forEach((role) => {
        expect(screen.queryByText(role.name)).not.toBeInTheDocument();
      });
    });

    it('ignores allowed permissions whose action is not a known role scope', () => {
      mockUseValidatePermissions.mockImplementation(mockPermissions({
        data: [{ action: 'some.unrelated.permission', allowed: true }],
        isLoading: false,
      }));
      setupMocks();
      renderPage();
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
      setupMocks();
      renderPage();
      courseRolesMetadata.forEach((role) => {
        expect(screen.queryByText(role.name)).not.toBeInTheDocument();
      });
      libraryRolesMetadata.forEach((role) => {
        expect(screen.getByText(role.name)).toBeInTheDocument();
      });
    });
  });
});
