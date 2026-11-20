import { useIntl } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';
import { ContentCopy } from '@openedx/paragon/icons';
import baseMessages from '@src/authz-module/messages';

// TODO: Implement the functionality for duplicating a role when the button is clicked.
const DuplicateRoleButton = () => {
  const intl = useIntl();
  return (
    <Button
      iconBefore={ContentCopy}
      size="sm"
      variant="outline-primary"
    >
      {intl.formatMessage(baseMessages['authz.custom.role.duplicate.role'])}
    </Button>
  );
};

export default DuplicateRoleButton;
