/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom';
import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import type { ConfigDocument } from '@edx/frontend-platform/config';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Lazy so each test file's own `jest.mock('@edx/frontend-platform/auth', ...)`
// (which is hoisted above this setup file's imports) is in effect by the time
// callers do `mockHttpClient().mockReturnValue(...)`.
export const mockHttpClient = (): jest.Mock => {
  // eslint-disable-next-line global-require
  const { getAuthenticatedHttpClient } = require('@edx/frontend-platform/auth');
  return getAuthenticatedHttpClient as jest.Mock;
};

const mockAppContext = {
  authenticatedUser: {
    userId: 1,
    username: 'testuser',
    email: 'testuser@example.com',
    roles: [],
    administrator: false,
  },
  config: {
    ...process.env,
  } as ConfigDocument,
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
        <AppContext.Provider value={mockAppContext}>
          <IntlProvider locale="en">
            {children}
          </IntlProvider>
        </AppContext.Provider>
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
      <AppContext.Provider value={mockAppContext}>
        <IntlProvider locale="en">{children}</IntlProvider>
      </AppContext.Provider>
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
