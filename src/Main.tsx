import { CurrentAppProvider, PageWrap } from '@openedx/frontend-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { appId } from './constants';
import AuthZModule from './authz-module';

import './index.scss';

const queryClient = new QueryClient();

const Main = () => (
  <CurrentAppProvider appId={appId}>
    <QueryClientProvider client={queryClient}>
      <PageWrap>
        <AuthZModule />
      </PageWrap>
    </QueryClientProvider>
  </CurrentAppProvider>
);

export default Main;
