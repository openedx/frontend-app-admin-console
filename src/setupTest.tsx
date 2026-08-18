import '@testing-library/jest-dom';
import siteConfig from 'site.config';
import {
  addAppConfigs, configureLogging, mergeSiteConfig, MockLoggingService,
} from '@openedx/frontend-base';
import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SiteContext } from '@openedx/frontend-base';
import type { SiteConfig } from '@openedx/frontend-base';
import { IntlProvider } from '@openedx/frontend-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

mergeSiteConfig(siteConfig);
addAppConfigs();
// Ensures logError/logInfo don't crash on a null `service` when tests
// don't call initializeMockApp themselves.
configureLogging(MockLoggingService, { config: siteConfig });

// Lazy so each test file's own `jest.mock('@edx/frontend-platform/auth', ...)`
// (which is hoisted above this setup file's imports) is in effect by the time
// callers do `mockHttpClient().mockReturnValue(...)`.
export const mockHttpClient = (): jest.Mock => jest.requireMock('@openedx/frontend-base').getAuthenticatedHttpClient;

export const mockAppContext = {
  authenticatedUser: {
    userId: 1,
    username: 'testuser',
    email: 'testuser@example.com',
    name: 'Test User',
    avatar: '',
    roles: [],
    administrator: false,
  },
  siteConfig: {
    ...process.env,
  } as unknown as SiteConfig, // check this type later
  locale: 'en',
};

interface WrapperProps {
  children: ReactNode;
}

export const renderWithAllProviders = (ui, options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SiteContext.Provider value={mockAppContext}>
          <IntlProvider locale="en">
            {children}
          </IntlProvider>
        </SiteContext.Provider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

export const intlWrapper = ({ children }: WrapperProps) => (
  <IntlProvider locale="en">{children}</IntlProvider>
);

export const renderWrapper = (ui, options = {}) => {
  const Wrapper = ({ children }: WrapperProps) => (
    <BrowserRouter>
      <SiteContext.Provider value={mockAppContext}>
        <IntlProvider locale="en">{children}</IntlProvider>
      </SiteContext.Provider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

class ResizeObserver {
  observe() { }

  unobserve() { }

  disconnect() { }
}

global.ResizeObserver = ResizeObserver;

// jsdom does not implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();
