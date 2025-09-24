import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';

import messages from './i18n';

import './index.scss';
import AuthZModule from 'authz-module';

const queryClient = new QueryClient();

subscribe(APP_READY, () => {
  const root = createRoot(document.getElementById('root') as HTMLElement);

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <Routes>
            <Route path="/authz/*" element={<AuthZModule />} />
          </Routes>
        </ AppProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  const root = createRoot(document.getElementById('root') as HTMLElement);

  root.render(
    <StrictMode>
      <ErrorPage message={error.message} />
    </StrictMode>,
  );
});

initialize({
  messages,
  requireAuthenticatedUser: true,
});
