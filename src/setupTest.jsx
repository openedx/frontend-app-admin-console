/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AppProvider } from '@edx/frontend-platform/react';

export const renderWrapper = (children) => render(
  <AppProvider>
    {children}
  </AppProvider>,
);
