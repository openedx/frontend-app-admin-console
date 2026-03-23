import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthzHome from './index';

jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }) => defaultMessage || 'mocked text',
  }),
}));

jest.mock('react-router-dom', () => ({
  useLocation: () => ({
    hash: '',
  }),
}));

// Mock messages
jest.mock('../libraries-manager/messages', () => ({
  'library.authz.breadcrumb.root': {
    id: 'library.authz.breadcrumb.root',
    defaultMessage: 'Administration',
  },
  'library.authz.manage.page.title': {
    id: 'library.authz.manage.page.title',
    defaultMessage: 'Manage Authorization',
  },
  'library.authz.tabs.team': {
    id: 'library.authz.tabs.team',
    defaultMessage: 'Team',
  },
  'library.authz.tabs.permissionsRoles': {
    id: 'library.authz.tabs.permissionsRoles',
    defaultMessage: 'Permissions & Roles',
  },
}));

jest.mock('../components/AuthZLayout', () => function MockAuthZLayout({ children }: { children: React.ReactNode }) {
  return <div data-testid="authz-layout">{children}</div>;
});

jest.mock('../roles-permissions/RolesPermissions', () => function MockRolesPermissions() {
  return <div data-testid="roles-permissions">Roles & Permissions Content</div>;
});

jest.mock('@openedx/paragon', () => ({
  Tab: ({ children, title } : { children: React.ReactNode, title: string }) => <div data-testid="tab" role="tabpanel">{title}: {children}</div>,
  Tabs: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs">{children}</div>,
}));

describe('AuthzHome', () => {
  it('renders without crashing', () => {
    render(<AuthzHome />);
  });

  it('renders the main layout and tabs', () => {
    render(<AuthzHome />);
    expect(screen.getByTestId('authz-layout')).toBeInTheDocument();
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
  });

  it('renders both tab panels', () => {
    render(<AuthzHome />);
    const tabs = screen.getAllByTestId('tab');
    expect(tabs).toHaveLength(2);
    expect(screen.getByText(/Team/)).toBeInTheDocument();
    expect(screen.getByText(/Permissions & Roles/)).toBeInTheDocument();
  });

  it('renders the RolesPermissions component in the permissions tab', () => {
    render(<AuthzHome />);
    expect(screen.getByTestId('roles-permissions')).toBeInTheDocument();
  });
});
