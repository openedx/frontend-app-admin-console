import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card, Collapsible, Container, Icon, IconButton,
} from '@openedx/paragon';
import { Delete, Person } from '@openedx/paragon/icons';
import PermissionRow from './PermissionsRow';
import messages from './messages';

interface CardTitleProps {
  title: string;
  userCounter?: number | null;
}
interface RoleCardProps extends CardTitleProps {
  objectName?: string | null;
  description: string;
  showDelete?: boolean;
  permissions: any[];
}

const CardTitle = ({ title, userCounter }: CardTitleProps) => (
  <div className="d-flex align-items-center">
    <span className="mr-4 text-primary">{title}</span>
    {userCounter !== null && userCounter !== undefined && (
      <span className="d-flex align-items-center font-weight-normal">
        <Icon src={Person} className="mr-1" />
        {userCounter}
      </span>
    )}
  </div>
);

const RoleCard = ({
  title, objectName, description, showDelete, permissions, userCounter,
}: RoleCardProps) => {
  const intl = useIntl();

  return (
    <Card className="container-mw-lg mx-auto mb-4">
      <Card.Header
        title={<CardTitle title={title} userCounter={userCounter} />}
        subtitle={(objectName && <span className="text-info-400 lead">{objectName}</span>) || ''}
        actions={
          showDelete && <IconButton variant="danger" alt="Delete role action" src={Delete} />
        }
      />
      <Card.Section>
        {description}
      </Card.Section>
      <Collapsible
        title={intl.formatMessage(messages['authz.permissions.title'])}
      >
        <Container>
          {permissions.map(({ key, label, actions }) => (
            <PermissionRow
              key={`${title}-${key}`}
              resourceLabel={label}
              actions={actions}
            />

          ))}
        </Container>
      </Collapsible>
    </Card>
  );
};

export default RoleCard;
