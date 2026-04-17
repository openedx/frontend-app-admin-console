import React from 'react';
import { screen } from '@testing-library/react';
import { useAllRoleAssignments, useOrgs, useScopes } from '@src/authz-module/data/hooks';
import { ToastManagerProvider } from '@src/authz-module/libraries-manager/ToastManagerContext';
import { renderWithAllProviders } from '@src/setupTest';
import userEvent from '@testing-library/user-event';
import AuthzHome from './index';
import messages from './messages';

jest.mock('@src/authz-module/data/hooks', () => ({
  useAllRoleAssignments: jest.fn(),
  useOrgs: jest.fn(),
  useScopes: jest.fn(),
}));

const emptyResponse = {
  data: {
    results: [], count: 0, next: null, previous: null,
  },
  error: null,
  isLoading: false,
  refetch: jest.fn(),
};

const renderAuthzHome = () => renderWithAllProviders(
  <ToastManagerProvider>
    <AuthzHome />
  </ToastManagerProvider>,
);

describe('AuthzHome', () => {
  beforeEach(() => {
    (useAllRoleAssignments as jest.Mock).mockReturnValue(emptyResponse);
    (useOrgs as jest.Mock).mockReturnValue(emptyResponse);
    (useScopes as jest.Mock).mockReturnValue(emptyResponse);
  });

  it('renders without crashing', () => {
    renderAuthzHome();
  });

  it('renders the main layout and tabs', () => {
    renderAuthzHome();
    expect(screen.getByText(messages['authz.manage.page.title'].defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages['authz.tabs.permissionsRoles'].defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages['authz.tabs.team'].defaultMessage)).toBeInTheDocument();
  });

  it('renders both tab panels', () => {
    renderAuthzHome();
    expect(screen.getByText(messages['authz.tabs.permissionsRoles'].defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages['authz.tabs.team'].defaultMessage)).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3); // 2 + tab invisible for more...
  });

  it('renders the RolesPermissions component in the permissions tab', async () => {
    const user = userEvent.setup();
    renderAuthzHome();
    await user.click(screen.getByText(messages['authz.tabs.permissionsRoles'].defaultMessage));
    expect(screen.getByRole('button', { name: 'Courses' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Libraries' })).toBeInTheDocument();
  });

  it('renders the TeamMembersTable component in the team members tab', () => {
    renderAuthzHome();
    expect(screen.getByText(messages['authz.manage.page.title'].defaultMessage)).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getAllByText('Organization').length).toBe(2); // Header and org filter;
    expect(screen.getAllByText('Scope').length).toBe(2); // Header and scope filter;
    expect(screen.getAllByText('Role').length).toBe(2); // Header and role filter;
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
