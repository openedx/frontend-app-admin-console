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
  handleDelete?: () => void;
  permissionsByResource: any[];
}

const CardTitle = ({ title, userCounter = null }: CardTitleProps) => (
  <div className="d-flex align-items-center">
    <span className="mr-4 text-primary">{title}</span>
    {userCounter !== null && (
      <span className="d-flex align-items-center font-weight-normal">
        <Icon src={Person} className="mr-1" />
        {userCounter}
      </span>
    )}
  </div>
);

const RoleCard = ({
  title, objectName, description, handleDelete, permissionsByResource, userCounter,
}: RoleCardProps) => {
  const intl = useIntl();

  return (
    <Card className="container-mw-lg mx-auto mb-4">
      <Card.Header
        title={<CardTitle title={title} userCounter={userCounter} />}
        subtitle={(objectName && <span className="text-info-400 lead">{objectName}</span>) || ''}
        actions={
          handleDelete && (
            <IconButton variant="danger" onClick={handleDelete} alt={intl.formatMessage(messages['authz.role.card.delete.action.alt'])} src={Delete} />
          )
        }
      />
      <Card.Section>
        {description}
      </Card.Section>
      <Collapsible
        title={intl.formatMessage(messages['authz.permissions.title'])}
      >
        <Container>
          {permissionsByResource.map((resourceGroup) => (
            <PermissionRow
              key={`${title}-${resourceGroup.key}`}
              resource={resourceGroup}
            />
          ))}
        </Container>
      </Collapsible>
    </Card>
  );
};

export default RoleCard;
