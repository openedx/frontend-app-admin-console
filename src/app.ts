import { App } from '@openedx/frontend-base';
import { appId } from './constants';
import routes from './routes';
import providers from './providers';

const app: App = {
  appId,
  routes,
  providers,
  config: {
    COURSE_AUTHORING_MICROFRONTEND_URL: 'http://apps.local.openedx.io:2001/authoring/home',
  },
};

export default app;
