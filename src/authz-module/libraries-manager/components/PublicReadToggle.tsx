import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import { useLibrary, useUpdateLibrary } from '@src/authz-module/data/hooks';

import messages from './messages';

type PublicReadToggleProps = {
  libraryId: string;
};

const PublicReadToggle = ({ libraryId }:PublicReadToggleProps) => {
  const intl = useIntl();
  const { data: library } = useLibrary(libraryId);
  const { mutate: updateLibrary } = useUpdateLibrary();

  const onChangeToggle = () => updateLibrary({
    libraryId,
    updatedData: { allowPublicRead: !library.allowPublicRead },
  });

  return (
    <Form.Switch
      checked={library.allowPublicRead}
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
