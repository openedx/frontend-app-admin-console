import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import { useLibrary, useUpdateLibrary } from '@src/authz-module/data/hooks';
import { useToastManager } from '../ToastManagerContext';

import messages from './messages';

type PublicReadToggleProps = {
  libraryId: string;
  canEditToggle: boolean;
};

type UpdateLibraryPublicRead = {
  libraryId: string;
  updatedData: { allowPublicRead: boolean };
};

const PublicReadToggle = ({ libraryId, canEditToggle }: PublicReadToggleProps) => {
  const intl = useIntl();
  const { data: library } = useLibrary(libraryId);
  const { mutate: updateLibrary, isPending } = useUpdateLibrary();
  const { showToast, showErrorToast } = useToastManager();

  const onChangeToggle = () => {
    const runUpdate = (variables: UpdateLibraryPublicRead = {
      libraryId,
      updatedData: { allowPublicRead: !library.allowPublicRead },
    }) => {
      updateLibrary(variables, {
        onSuccess: () => {
          showToast({
            message: intl.formatMessage(messages['libraries.authz.public.read.toggle.success']),
            type: 'success',
          });
        },
        onError: (error, retryVariables) => {
          showErrorToast(error, () => runUpdate(retryVariables as UpdateLibraryPublicRead));
        },
      });
    };

    runUpdate();
  };

  if (!library.allowPublicRead && !canEditToggle) {
    return null;
  }

  return (
    <Form.Switch
      checked={library.allowPublicRead}
      disabled={!canEditToggle || isPending}
      onChange={onChangeToggle}
      helperText={
        <span>{intl.formatMessage(messages['libraries.authz.public.read.toggle.subtext'])}</span>
      }
    >
      {intl.formatMessage(messages['libraries.authz.public.read.toggle.label'])}
    </Form.Switch>
  );
};

export default PublicReadToggle;
