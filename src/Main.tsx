import { CurrentAppProvider, PageWrap } from '@openedx/frontend-base';

import { appId } from './constants';
import AuthZModule from './authz-module';

const Main = () => (
  <CurrentAppProvider appId={appId}>
    <PageWrap>
      <AuthZModule />
    </PageWrap>
  </CurrentAppProvider>
);

export default Main;
