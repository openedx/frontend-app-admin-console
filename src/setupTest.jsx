/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

const mockAppContext = {
  authenticatedUser: {
    username: 'testuser',
    email: 'testuser@example.com',
  },
  config: {
    ...process.env,
  },
};

export const renderWrapper = (children) => render(
  <BrowserRouter>
    <AppContext.Provider value={mockAppContext}>
      <IntlProvider locale="en">
        {children}
      </IntlProvider>
    </AppContext.Provider>
  </BrowserRouter>,
);

class ResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.ResizeObserver = ResizeObserver;
