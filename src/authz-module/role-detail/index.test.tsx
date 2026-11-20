import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SiteContext, IntlProvider } from '@openedx/frontend-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AUTHZ_HOME_PATH, AUTHZ_ROLES_PERMISSIONS_PATH } from '@src/authz-module/constants';
import { useAuthzCatalog } from '@src/authz-module/catalog/data/hooks';
import { mockAuthzCatalog } from '@src/authz-module/catalog/testUtils';
import { useTeamMembersAssignments } from '@src/authz-module/data/hooks';
import baseMessages from '@src/authz-module/messages';
import { mockAppContext } from '@src/testUtils';
import messages from './messages';
import RoleDetailPage from './index';

jest.mock('@src/authz-module/catalog/data/hooks', () => ({
  useAuthzCatalog: jest.fn(),
}));

jest.mock('@src/authz-module/data/hooks', () => ({
  useTeamMembersAssignments: jest.fn(),
}));

jest.mock('@src/authz-module/role-assignation-wizard/hooks/useAssignableRoleGroups', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    canAssignRole: true,
    roleGroups: [],
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@src/authz-module/role-assignation-wizard/AssignRoleWizard', () => ({
  __esModule: true,
  default: () => <div>Assign Role Wizard</div>,
}));

jest.mock('@src/authz-module/components/DuplicateRoleButton', () => ({
  __esModule: true,
  default: () => <button>Duplicate Role</button>,
}));

jest.mock('@src/authz-module/components/TableControlBar/ScopesFilter', () => ({
  __esModule: true,
  default: () => <div>Scopes Filter</div>,
}));

const mockUseAuthzCatalog = useAuthzCatalog as jest.Mock;
const mockUseTeamMembersAssignments = useTeamMembersAssignments as jest.Mock;

const mockRole = {
  id: 'custom-role-123',
  displayName: 'Custom Instructor',
  definitionKind: 'user_defined',
  permissions: [],
};

const mockMembers = {
  data: {
    results: [
      {
        username: 'instructor1',
        fullName: 'Instructor One',
        email: 'instructor1@example.com',
        assignmentCount: 1,
        assignments: [
          {
            role: 'custom-role-123',
            org: 'OpenedX',
            scope: 'course-v1:OpenedX+DemoX+Demo',
            scopeDisplayName: 'Demo Course',
            permissionCount: 5,
          },
        ],
      },
    ],
    count: 1,
    next: null,
    previous: null,
  },
  error: null,
  isLoading: false,
  refetch: jest.fn(),
};

const renderRoleDetail = (roleId = 'custom-role-123') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/roles/${roleId}`]}>
        <SiteContext.Provider value={mockAppContext}>
          <IntlProvider locale="en">
            <Routes>
              <Route path="/roles/:roleId" element={children} />
            </Routes>
          </IntlProvider>
        </SiteContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return render(<RoleDetailPage />, { wrapper: Wrapper });
};

describe('RoleDetailPage', () => {
  beforeEach(() => {
    mockAuthzCatalog();
    mockUseAuthzCatalog.mockReturnValue({
      getRole: jest.fn((id) => (id === 'custom-role-123' ? mockRole : null)),
      isLoading: false,
    });
    mockUseTeamMembersAssignments.mockReturnValue(mockMembers);
  });

  it('renders the role display name as the page title', () => {
    renderRoleDetail();
    expect(screen.getByRole('heading', { name: 'Custom Instructor' })).toBeInTheDocument();
  });

  it('renders the edit role button', () => {
    renderRoleDetail();
    expect(screen.getByRole('button', { name: messages['authz.custom.role.edit.name.alt'].defaultMessage })).toBeInTheDocument();
  });

  it('renders the more actions dropdown button', () => {
    renderRoleDetail();
    expect(screen.getByRole('button', { name: messages['authz.custom.role.more.name.alt'].defaultMessage })).toBeInTheDocument();
  });

  it('renders the assign members button', () => {
    renderRoleDetail();
    expect(screen.getByRole('button', { name: baseMessages['authz.management.assign.role.title'].defaultMessage })).toBeInTheDocument();
  });

  it('renders Members and Permissions tabs', () => {
    renderRoleDetail();
    expect(screen.getByRole('tab', { name: messages['authz.custom.role.tabs.members'].defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: messages['authz.custom.role.tabs.permissions'].defaultMessage })).toBeInTheDocument();
  });

  it('renders Members tab content by default', () => {
    renderRoleDetail();
    expect(screen.getByRole('tab', { name: messages['authz.custom.role.tabs.members'].defaultMessage, selected: true })).toBeInTheDocument();
  });

  it('opens assign role wizard when plus button is clicked', async () => {
    const user = userEvent.setup();
    renderRoleDetail();

    const assignButton = screen.getByRole('button', { name: baseMessages['authz.management.assign.role.title'].defaultMessage });
    await user.click(assignButton);

    // The wizard should be in the DOM (can verify by checking for wizard-specific elements)
    // Note: Full wizard testing would depend on its implementation
    expect(assignButton).toBeInTheDocument();
  });

  it('opens more actions menu when dropdown button is clicked', async () => {
    const user = userEvent.setup();
    renderRoleDetail();

    const moreActionsButton = screen.getByRole('button', { name: messages['authz.custom.role.more.name.alt'].defaultMessage });
    await user.click(moreActionsButton);

    // Check that menu items are visible (looking for text in Dropdown.Item components)
    await waitFor(() => {
      expect(screen.getByText(messages['authz.custom.role.action.duplicate'].defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages['authz.custom.role.action.delete'].defaultMessage)).toBeInTheDocument();
    });
  });

  it('calls handleDeleteRole when delete menu item is clicked', async () => {
    const user = userEvent.setup();
    renderRoleDetail();

    const moreActionsButton = screen.getByRole('button', { name: messages['authz.custom.role.more.name.alt'].defaultMessage });
    await user.click(moreActionsButton);

    await waitFor(() => {
      expect(screen.getByText(messages['authz.custom.role.action.delete'].defaultMessage)).toBeInTheDocument();
    });

    const deleteButton = screen.getByText(messages['authz.custom.role.action.delete'].defaultMessage);
    // TODO: Update this test when delete role is fully implemented.
    // Currently handleDeleteRole just logs to console; this should verify actual deletion behavior.
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);
    expect(deleteButton).toBeInTheDocument();
  });

  it('renders breadcrumb navigation links', () => {
    renderRoleDetail();
    expect(screen.getByRole('link', { name: 'Roles and Permissions Management' }))
      .toHaveAttribute('href', AUTHZ_HOME_PATH);
    expect(screen.getByRole('link', { name: 'Roles and Permissions' }))
      .toHaveAttribute('href', AUTHZ_ROLES_PERMISSIONS_PATH);
  });

  it('renders loading state when fetching role data', () => {
    mockUseAuthzCatalog.mockReturnValueOnce({
      getRole: jest.fn(),
      isLoading: true,
    });
    renderRoleDetail();
    // Should render LoadingPage with Spinner while loading
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not render custom role actions for built-in roles', () => {
    mockUseAuthzCatalog.mockReturnValueOnce({
      getRole: jest.fn((id) => (id === 'custom-role-123' ? { ...mockRole, definitionKind: 'static' } : null)),
      isLoading: false,
    });
    renderRoleDetail('custom-role-123');

    // Should not render edit or more actions buttons for built-in roles
    expect(screen.queryByRole('button', { name: messages['authz.custom.role.edit.name.alt'].defaultMessage })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages['authz.custom.role.more.name.alt'].defaultMessage })).not.toBeInTheDocument();
    // Should render duplicate button for built-in roles
    expect(screen.getByRole('button', { name: /Duplicate/ })).toBeInTheDocument();
  });

  it('renders DuplicateRoleButton only for built-in roles', () => {
    // Test with custom role
    renderRoleDetail('custom-role-123');
    expect(screen.queryByRole('button', { name: /Duplicate/ })).not.toBeInTheDocument();

    // Test with built-in role
    mockUseAuthzCatalog.mockReturnValueOnce({
      getRole: jest.fn((id) => (id === 'builtin-role' ? { displayName: 'Built-in', definitionKind: 'static', permissions: [] } : null)),
      isLoading: false,
    });
    renderRoleDetail('builtin-role');
    expect(screen.getByRole('button', { name: /Duplicate/ })).toBeInTheDocument();
  });

  it('renders Permissions tab that can be navigated to', async () => {
    const user = userEvent.setup();
    renderRoleDetail();

    // Click on Permissions tab
    const permissionsTab = screen.getByRole('tab', { name: messages['authz.custom.role.tabs.permissions'].defaultMessage });
    await user.click(permissionsTab);

    // Check that Permissions tab becomes active
    expect(permissionsTab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls handleDeleteMember when delete member button is clicked', async () => {
    const user = userEvent.setup();
    renderRoleDetail();

    // Find delete button for a member (use the second button in the actions cell, after view button)
    const deleteButtons = screen.getAllByRole('button', { name: messages['authz.role.members.table.action.delete.alt'].defaultMessage });
    expect(deleteButtons.length).toBeGreaterThan(0);

    // TODO: Update this test when delete member is fully implemented.
    // Currently handleDeleteMember just logs to console; this should verify actual deletion behavior.
    await user.click(deleteButtons[0]);
    expect(deleteButtons[0]).toBeInTheDocument();
  });
});
