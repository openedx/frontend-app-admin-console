import { useIntl } from '@openedx/frontend-base';
import {
  Delete,
  Info,
} from '@openedx/paragon/icons';
import type { UserRoleWithPermissions, RoleToDelete, TeamMemberAssignment } from '@src/types';
import type { ComponentProps, ReactNode } from 'react';
import {
  ADMIN_ROLES, ALL_ORGS_KEY, SCOPE_TYPES, DJANGO_MANAGED_ROLES, getAggregateScopeType,
  getScopeType,
} from '@src/authz-module/constants';
import {
  Icon, IconButton, OverlayTrigger, Tooltip,
  type DataTableCellProps,
} from '@openedx/paragon';
import { useExclusiveRowExpansion } from '@src/authz-module/hooks/useExclusiveRowExpansion';
import { useCourseAuthoringFlag } from '@src/authz-module/hooks/useCourseAuthoringFlag';
import { getScopeResourceIcon } from '@src/authz-module/utils';
import { AGGREGATE_SCOPE_LABELS, DJANGO_ROLE_LABELS } from '@src/authz-module/messages';
import { useAuthzCatalog } from '@src/authz-module/catalog';
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
}

type ActionsCellProps = CellProps & ActionsCellExtraProps;

type DisabledActionButtonProps = Pick<ComponentProps<typeof IconButton>, 'src' | 'alt' | 'size' | 'variant'> & {
  tooltip: ReactNode;
};

// A disabled button can't trigger its own tooltip (Paragon sets pointer-events: none on it),
// so the OverlayTrigger must live on a wrapper element that still receives hover events.
export const DisabledActionButton = ({
  src, alt, size, variant, tooltip,
}: DisabledActionButtonProps) => (
  <OverlayTrigger
    placement="left"
    overlay={(
      <Tooltip variant="light" id="tooltip-left">
        {tooltip}
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

// The scope and org cells below are shared by the user assignments table and the
// team members role breakdown, so both tables read alike.
const ScopeNameCell = ({ row }: AssignmentCellProps) => {
  const { formatMessage } = useIntl();
  const { scope, scopeDisplayName, org } = row.original;
  const aggregateType = getAggregateScopeType(scope, org);
  const scopeText = aggregateType
    ? formatMessage(AGGREGATE_SCOPE_LABELS[getScopeType(scope)])
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

const RoleCell = ({ value }: { value: string }) => {
  const { formatMessage } = useIntl();
  const { getRole } = useAuthzCatalog();
  const roleName = DJANGO_ROLE_LABELS[value]
    ? formatMessage(DJANGO_ROLE_LABELS[value])
    : getRole(value)?.displayName ?? value;

  return <span data-role={value}>{roleName}</span>;
};

// The permissions count doubles as the toggle that expands the row's permissions breakdown.
// A role the metadata doesn't describe has no breakdown to expand, so its count is plain text.
const PermissionsCell = ({ row }: CellProps) => {
  const { formatMessage } = useIntl();
  const toggleExpanded = useExclusiveRowExpansion(row);
  const { getScopeCatalog } = useAuthzCatalog();
  const { role, scope, permissionCount: count } = row.original;
  const isDjangoRole = DJANGO_MANAGED_ROLES.includes(role);
  const accessType = role === 'django.superuser' ? 'total' : 'partial';
  const label = isDjangoRole
    ? formatMessage(messages['authz.user.table.permissions.access.label'], { accessType })
    : formatMessage(messages['authz.user.table.permissions.available.count'], { count });

  const scopeRoles = getScopeCatalog(getScopeType(scope))?.roles ?? [];
  const isKnownRole = scopeRoles.some((r) => r.role === role);

  if (!isDjangoRole && !isKnownRole) {
    return <span className="px-1">{label}</span>;
  }

  return (
    <ExpandableButton
      label={label}
      onClick={toggleExpanded}
      isExpanded={!!row.isExpanded}
    />
  );
};

const ActionsCell = ({
  row, onClickDeleteButton, isUserAuthenticatedPage,
}: ActionsCellProps) => {
  const { formatMessage } = useIntl();
  // Read the flag here rather than through the cell factory: DataTable never refreshes
  // `additionalColumns`, so a factory closure would keep the loading-state resolver.
  const { isCourseEnabled } = useCourseAuthoringFlag();
  const { getRole } = useAuthzCatalog();
  const { role, scope, canManageScope, scopeDisplayName, org } = row.original;

  const handleDelete = () =>
    onClickDeleteButton({
      role,
      scope,
      scopeDisplayName,
      org,
      name: getRole(role)?.displayName ?? role,
    });

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
      <DisabledActionButton
        src={Delete}
        alt={formatMessage(messages['authz.user.table.delete.action.alt'])}
        size="sm"
        variant="danger"
        tooltip={formatMessage(messages['authz.user.table.delete.action.adminrole.tooltip'])}
      />
    );
  }

  const isCourseScope = getScopeType(scope) === SCOPE_TYPES.COURSE;
  const isCourseAuthoringDisabled = isCourseScope && !isCourseEnabled(scope);

  if (isCourseAuthoringDisabled) {
    return (
      <DisabledActionButton
        src={Delete}
        alt={formatMessage(messages['authz.user.table.delete.action.alt'])}
        size="sm"
        variant="danger"
        tooltip={formatMessage(messages['authz.table.actions.course.disabled.tooltip'])}
      />
    );
  }

  return (
    <IconButton
      disabled={!canManageScope}
      variant="danger"
      onClick={handleDelete}
      alt={formatMessage(messages['authz.user.table.delete.action.alt'])}
      src={Delete}
      size="sm"
    />
  );
};

const createActionsCell = (extraProps: ActionsCellExtraProps) => function customActionsCell(cellProps) {
  return <ActionsCell {...cellProps} {...extraProps} />;
};

export {
  RoleCell,
  OrgIconCell,
  ScopeNameCell,
  PermissionsCell,
  createActionsCell,
};
