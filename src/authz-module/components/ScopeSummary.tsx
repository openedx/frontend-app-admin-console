import { useIntl } from '@openedx/frontend-base';
import { Icon } from '@openedx/paragon';
import { ALL_ORGS_KEY, getAggregateScopeType } from '@src/authz-module/constants';
import { getScopeResourceIcon } from '@src/authz-module/utils';
import type { TeamMemberAssignment } from '@src/types';
import { RESOURCE_ICONS } from './constants';
import messages from './messages';

type ScopeSummaryProps = Pick<TeamMemberAssignment, 'scope' | 'scopeDisplayName' | 'org'> & {
  className?: string;
};

/**
 * The scope an assignment applies to, with its organization on a subline.
 *
 * A wildcard scope names no single resource, so it is summarised by reach alone: the
 * organization it covers, or the whole platform. The kind of resource ("All courses in
 * this organization") is left to the breakdown, and the organization line is dropped
 * since the scope line already says it.
 */
const ScopeSummary = ({
  scope, scopeDisplayName, org, className,
}: ScopeSummaryProps) => {
  const { formatMessage } = useIntl();
  const allOrgsLabel = formatMessage(messages['authz.user.table.org.all.organizations.label']);

  const aggregateType = getAggregateScopeType(scope, org);
  let scopeIcon = getScopeResourceIcon(scope);
  let scopeText = scopeDisplayName || scope;
  if (aggregateType === 'platform') {
    scopeIcon = RESOURCE_ICONS.GLOBAL;
    scopeText = allOrgsLabel;
  } else if (aggregateType === 'org') {
    scopeIcon = RESOURCE_ICONS.ORGANIZATION;
    scopeText = org;
  }

  const orgText = org === ALL_ORGS_KEY ? allOrgsLabel : org;

  return (
    <div className={className ? `authz-scope-cell ${className}` : 'authz-scope-cell'}>
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
  );
};

export default ScopeSummary;
