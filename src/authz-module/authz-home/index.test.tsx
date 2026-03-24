import React from 'react';
import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import AuthzHome from './index';
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
    renderWrapper(<AuthzHome />);
  });

  it('renders the main layout and tabs', () => {
    renderWrapper(<AuthzHome />);
    expect(screen.getByTestId('authz-layout')).toBeInTheDocument();
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
  });

  it('renders both tab panels', () => {
    renderWrapper(<AuthzHome />);
    const tabs = screen.getAllByTestId('tab');
    expect(tabs).toHaveLength(2);
    expect(screen.getByText(/Team/)).toBeInTheDocument();
    expect(screen.getByText(/Permissions & Roles/)).toBeInTheDocument();
  });

  it('renders the RolesPermissions component in the permissions tab', () => {
    renderWrapper(<AuthzHome />);
    expect(screen.getByTestId('roles-permissions')).toBeInTheDocument();
  });
});
