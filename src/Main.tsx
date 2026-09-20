import { CurrentAppProvider, PageWrap, getSiteConfig, useIntl } from '@openedx/frontend-base';
import { Container } from '@openedx/paragon';
import { Helmet } from 'react-helmet';

import { appId } from './constants';
import messages from './messages';
import AuthZModule from './authz-module';
import './style.scss';

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
        <Container size="xl" fluid className="px-0">
          <AuthZModule />
        </Container>
      </PageWrap>
    </CurrentAppProvider>
  );
};

export default Main;
