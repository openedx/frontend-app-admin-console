import { useIntl } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';
import { ContentCopy } from '@openedx/paragon/icons';
import messages from './messages';

// TODO: Implement the functionality for duplicating a role when the button is clicked.
const DuplicateRoleButton = () => {
  const intl = useIntl();
  return (
    <Button
      iconBefore={ContentCopy}
      size="sm"
      variant="outline-primary"
    >
      {intl.formatMessage(messages['authz.action.duplicate.role'])}
    </Button>
  );
};

export default DuplicateRoleButton;
