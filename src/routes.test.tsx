import { screen } from '@testing-library/react';
import { authenticatedLoader } from '@openedx/frontend-base';
import { renderWrapper, initializeMocks } from '@src/testUtils';
import routes from './routes';

jest.mock('./authz-module', () => ({
  __esModule: true,
  default: () => <div data-testid="authz-module" />,
}));

describe('routes', () => {
  describe('shape', () => {
    it('exports a single route', () => {
      expect(routes).toHaveLength(1);
    });

    it('has the expected id and path', () => {
      expect(routes[0].id).toBe('org.openedx.frontend.route.adminConsole.main');
      expect(routes[0].path).toBe('/admin-console/authz/*');
    });

    it('is labelled with the admin console role', () => {
      expect(routes[0].handle).toEqual({ roles: ['org.openedx.frontend.role.adminConsole'] });
    });

    it('requires authentication via the authenticated loader', () => {
      expect(routes[0].loader).toBe(authenticatedLoader);
    });
  });

  describe('lazy', () => {
    beforeEach(() => {
      initializeMocks();
    });

    it('resolves Main as the route Component', async () => {
      const { Component } = await routes[0].lazy();
      renderWrapper(<Component />);
      expect(await screen.findByTestId('authz-module')).toBeInTheDocument();
    });
  });
});
