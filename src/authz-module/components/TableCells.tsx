import { useIntl } from '@openedx/frontend-base';
import {
  Delete,
  Info,
  Person,
} from '@openedx/paragon/icons';
import type { UserRoleWithPermissions, RoleToDelete, TeamMemberAssignment } from '@src/types';
import type { ComponentProps } from 'react';
import {
  ADMIN_ROLES, ALL_ORGS_KEY, DJANGO_MANAGED_ROLES, getAggregateScopeType,
  getScopeContextType, MAP_ROLE_KEY_TO_LABEL,
} from '@src/authz-module/constants';
import {
  Icon, IconButton, OverlayTrigger, Tooltip,
  type DataTableCellProps,
} from '@openedx/paragon';
import { useExclusiveRowExpansion } from '@src/authz-module/hooks/useExclusiveRowExpansion';
import { getScopeResourceIcon } from '@src/authz-module/utils';
import { AGGREGATE_SCOPE_LABELS } from '@src/authz-module/messages';
import { RESOURCE_ICONS } from './constants';
import messages from './messages';
import ExpandableButton from './ExpandableButton';

type CellProps = DataTableCellProps<UserRoleWithPermissions>;
interface AssignmentCellProps {
  row: { original: Pick<TeamMemberAssignment, 'role' | 'scope' | 'scopeDisplayName' | 'org'> };
}

interface ActionsCellExtraProps {
  onClickDeleteButton: (role: RoleToDelete) => void;
  isUserAuthenticatedPage: boolean;
  isCourseEnabled?: (scope: string) => boolean;
}

type ActionsCellProps = CellProps & ActionsCellExtraProps;

type DisabledCourseActionButtonProps = Pick<ComponentProps<typeof IconButton>, 'src' | 'alt' | 'size' | 'variant'>;

// A disabled button can't trigger its own tooltip (Paragon sets pointer-events: none on it),
// so the OverlayTrigger must live on a wrapper element that still receives hover events.
export const DisabledCourseActionButton = ({
  src, alt, size, variant,
}: DisabledCourseActionButtonProps) => {
  const { formatMessage } = useIntl();
  return (
    <OverlayTrigger
      placement="left"
      overlay={(
        <Tooltip variant="light" id="tooltip-left">
          {formatMessage(messages['authz.table.actions.course.disabled.tooltip'])}
        </Tooltip>
      )}
    >
      <span className="d-inline-block">
        <IconButton
          src={src}
          alt={alt}
          size={size}
          variant={variant}
          disabled
        />
      </span>
    </OverlayTrigger>
  );
};

/** The role pill: a light rounded block with the person icon, not a Paragon Chip. */
const RoleBadge = ({ role }: { role: string }) => (
  <div className="authz-role-badge d-inline-flex align-items-center flex-shrink-0 text-nowrap rounded bg-light-300 text-gray-700 mr-3 px-2 py-1">
    <Icon src={Person} size="xs" className="mr-1" />
    {MAP_ROLE_KEY_TO_LABEL[role] || role}
  </div>
);

// The role, scope and org cells below are shared by the user assignments table and the
// team members role breakdown, so both tables read alike.
const RoleBadgeCell = ({ row }: AssignmentCellProps) => (
  <RoleBadge role={row.original.role} />
);

const ScopeNameCell = ({ row }: AssignmentCellProps) => {
  const { formatMessage } = useIntl();
  const { scope, scopeDisplayName, org } = row.original;
  const aggregateType = getAggregateScopeType(scope, org);
  const scopeText = aggregateType
    ? formatMessage(AGGREGATE_SCOPE_LABELS[getScopeContextType(scope)])
    : scopeDisplayName || scope;

  return (
    <span className="d-flex align-items-center">
      <Icon src={getScopeResourceIcon(scope)} className="mr-2 flex-shrink-0 text-primary" size="xs" />
      <span className="text-truncate" title={scopeText}>{scopeText}</span>
    </span>
  );
};

// Mirrors ScopeNameCell's icon treatment. A wildcard org reaches past any one
// organization, so it gets the globe and the "All platform" label.
const OrgIconCell = ({ row }: AssignmentCellProps) => {
  const { formatMessage } = useIntl();
  const { org } = row.original;
  const isAllOrgs = org === ALL_ORGS_KEY;
  const orgText = isAllOrgs
    ? formatMessage(messages['authz.user.table.org.all.organizations.label'])
    : org;

  return (
    <span className="d-flex align-items-center">
      <Icon src={isAllOrgs ? RESOURCE_ICONS.GLOBAL : RESOURCE_ICONS.ORGANIZATION} className="mr-2 flex-shrink-0 text-primary" size="xs" />
      <span className="text-truncate" title={orgText}>{orgText}</span>
    </span>
  );
};

const PermissionsCell = ({ row }: CellProps) => {
  const { formatMessage } = useIntl();
  const { role, permissionCount: count } = row.original;
  const isDjangoRole = DJANGO_MANAGED_ROLES.includes(role);
  return (
    <span>
      { isDjangoRole
        ? formatMessage(
            messages['authz.user.table.permissions.access.label'],
            { accessType: role === 'django.superuser' ? 'total' : 'partial' },
          )
        : formatMessage(messages['authz.user.table.permissions.available.count'], { count })}
    </span>
  );
};

const ViewAllPermissionsCell = ({ row }: CellProps) => {
  const { formatMessage } = useIntl();
  const toggleExpanded = useExclusiveRowExpansion(row);

  return (
    <ExpandableButton
      label={formatMessage(
        row.isExpanded
          ? messages['authz.user.table.view_all_permissions.link.text.close']
          : messages['authz.user.table.view_all_permissions.link.text.open'],
      )}
      onClick={toggleExpanded}
      isExpanded={!!row.isExpanded}
    />
  );
};

const ActionsCell = ({
  row, onClickDeleteButton, isUserAuthenticatedPage, isCourseEnabled,
}: ActionsCellProps) => {
  const { formatMessage } = useIntl();
  const { role, canManageScope } = row.original;

  const handleDelete = () => {
    const roleToDelete = {
      role,
      scope: row.original.scope,
      name: MAP_ROLE_KEY_TO_LABEL[role] || '',
    } as RoleToDelete;
    onClickDeleteButton(roleToDelete);
  };

  if (DJANGO_MANAGED_ROLES.includes(role)) {
    return (
      <OverlayTrigger
        placement="left"
        overlay={(
          <Tooltip variant="light" id="tooltip-left">
            {formatMessage(messages['authz.user.table.delete.action.djangorole.tooltip'])}
          </Tooltip>
        )}
      >
        <Icon
          className="mx-2 pl-1"
          src={Info}
        />
      </OverlayTrigger>
    );
  }

  if (ADMIN_ROLES.includes(role) && isUserAuthenticatedPage) {
    return (
      <OverlayTrigger
        placement="left"
        overlay={(
          <Tooltip variant="light" id="tooltip-left">
            {formatMessage(messages['authz.user.table.delete.action.adminrole.tooltip'])}
          </Tooltip>
        )}
      >
        <Icon
          className="mx-2 pl-1 text-light-500"
          src={Delete}
        />
      </OverlayTrigger>
    );
  }

  const isCourseScope = !role?.startsWith('lib');
  const isCourseAuthoringDisabled = isCourseEnabled !== undefined
    && isCourseScope && !isCourseEnabled(row.original.scope);

  if (isCourseAuthoringDisabled) {
    return (
      <DisabledCourseActionButton
        src={Delete}
        alt={formatMessage(messages['authz.user.table.delete.action.alt'])}
        variant="light"
      />
    );
  }

  return (
    <IconButton
      disabled={!canManageScope}
      variant={canManageScope ? 'danger' : 'light'}
      onClick={handleDelete}
      alt={formatMessage(messages['authz.user.table.delete.action.alt'])}
      src={Delete}
    />
  );
};

const createActionsCell = (extraProps: ActionsCellExtraProps) => function customActionsCell(cellProps) {
  return <ActionsCell {...cellProps} {...extraProps} />;
};

export {
  RoleBadge,
  RoleBadgeCell,
  OrgIconCell,
  ScopeNameCell,
  PermissionsCell,
  ViewAllPermissionsCell,
  createActionsCell,
};
