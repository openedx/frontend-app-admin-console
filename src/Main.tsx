import { CurrentAppProvider, PageWrap, getSiteConfig, useIntl } from '@openedx/frontend-base';
import { Helmet } from 'react-helmet';

import { appId } from './constants';
import messages from './messages';
import AuthZModule from './authz-module';

const Main = () => {
  const { formatMessage } = useIntl();

  return (
    <CurrentAppProvider appId={appId}>
      <Helmet>
        <title>
          {formatMessage(messages['admin.console.page.title'], {
            siteName: getSiteConfig().siteName,
          })}
        </title>
      </Helmet>
      <PageWrap>
        <AuthZModule />
      </PageWrap>
    </CurrentAppProvider>
  );
};

export default Main;
