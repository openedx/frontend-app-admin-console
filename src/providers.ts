import { AppProvider } from '@openedx/frontend-base';
import { ToastManagerProvider } from '@src/components/ToastManager/ToastManagerContext';

const providers: AppProvider[] = [ToastManagerProvider];

export default providers;
