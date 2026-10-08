import { FormattedMessage, useIntl } from '@openedx/frontend-base';
import { Icon } from '@openedx/paragon';
import { ALL_ORGS_KEY, getAggregateScopeType } from '@src/authz-module/constants';
import { getScopeResourceIcon } from '@src/authz-module/utils';
import { RoleBadge } from '@src/authz-module/components/TableCells';
import componentMessages from '@src/authz-module/components/messages';
import { RESOURCE_ICONS } from '@src/authz-module/components/constants';
import type { TeamMember } from '@src/types';
import messages from '../messages';

interface AssignedRolesCellProps {
  row: { original: TeamMember };
}

/**
 * Collapsed-row cell: the user's first assignment, as "[Role] In <scope>" with the
 * organization on a subline.
 *
 * Renders `assignments[0]` exactly as the API returns it — the sub-table's first row must
 * match it, so no client-side reordering happens here. The badge stays visible while the
 * row is expanded, for visual continuity.
 */
const AssignedRolesCell = ({ row }: AssignedRolesCellProps) => {
  const { formatMessage } = useIntl();
  const [assignment] = row.original.assignments ?? [];

  if (!assignment) {
    return null;
  }

  const {
    role, scope, scopeDisplayName, org,
  } = assignment;
  /*
   * A wildcard scope names no single resource, so the row summarises it by reach alone:
   * the organization it covers, or the whole platform. The kind of resource ("All
   * courses in this organization") is left to the breakdown, and the organization line
   * is dropped since the scope line already says it.
   */
  const aggregateType = getAggregateScopeType(scope, org);
  let scopeIcon = getScopeResourceIcon(scope);
  let scopeText = scopeDisplayName || scope;
  if (aggregateType === 'platform') {
    scopeIcon = RESOURCE_ICONS.GLOBAL;
    scopeText = formatMessage(componentMessages['authz.user.table.org.all.organizations.label']);
  } else if (aggregateType === 'org') {
    scopeIcon = RESOURCE_ICONS.ORGANIZATION;
    scopeText = org;
  }

  const orgText = org === ALL_ORGS_KEY
    ? formatMessage(componentMessages['authz.user.table.org.all.organizations.label'])
    : org;

  return (
    <div className="authz-assigned-roles d-flex align-items-center text-gray-500">
      <FormattedMessage
        {...messages['authz.team.members.table.assigned.roles']}
        values={{
          role: <RoleBadge role={role} />,
          scope: (
            <div className="authz-scope-cell ml-3">
              <span className="d-flex align-items-center">
                <Icon src={scopeIcon} className="mr-2 flex-shrink-0 text-primary" size="xs" />
                <span className="text-truncate text-gray-700 authz-scope-cell__name" title={scopeText}>{scopeText}</span>
              </span>
              {!aggregateType && (
                <span className="d-flex align-items-center small text-gray-500 authz-scope-cell__org ml-4">
                  <Icon src={RESOURCE_ICONS.ORGANIZATION} className="mr-2 flex-shrink-0" size="xs" />
                  <span className="text-truncate" title={orgText}>{orgText}</span>
                </span>
              )}
            </div>
          ),
        }}
      />
    </div>
  );
};

export default AssignedRolesCell;
