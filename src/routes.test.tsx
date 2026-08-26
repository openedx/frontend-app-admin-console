import { Suspense } from 'react';
import { screen } from '@testing-library/react';
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
      expect(routes[0].path).toBe('/authz/*');
    });

    it('is guarded by the admin console role', () => {
      expect(routes[0].handle).toEqual({ role: 'org.openedx.frontend.role.adminConsole' });
    });

    it('provides a Component for the route', () => {
      expect(routes[0].Component).toBeDefined();
    });
  });

  describe('Component', () => {
    beforeEach(() => {
      initializeMocks();
    });

    it('lazily loads Main', async () => {
      const { Component } = routes[0];
      renderWrapper(
        <Suspense fallback={<div>loading</div>}>
          <Component />
        </Suspense>,
      );
      expect(await screen.findByTestId('authz-module')).toBeInTheDocument();
    });
  });
});
