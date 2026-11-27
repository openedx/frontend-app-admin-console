import { useIntl } from '@openedx/frontend-base';
import { Icon } from '@openedx/paragon';
import { ALL_ORGS_KEY, getAggregateScopeType, getScopeType } from '@src/authz-module/constants';
import { AGGREGATE_SCOPE_LABELS } from '@src/authz-module/messages';
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
 *
 * The icons alone tell the resource type and reach, so the summary is one labelled group
 * whose label spells them out ("Course Demo Course in the organization OpenedX"). Its
 * visible content is hidden from assistive technology, so it isn't announced twice.
 */
const ScopeSummary = ({
  scope, scopeDisplayName, org, className,
}: ScopeSummaryProps) => {
  const { formatMessage } = useIntl();
  const allOrgsLabel = formatMessage(messages['authz.user.table.org.all.organizations.label']);

  const scopeType = getScopeType(scope);
  const aggregateType = getAggregateScopeType(scope, org);
  const orgText = org === ALL_ORGS_KEY ? allOrgsLabel : org;

  let scopeIcon = getScopeResourceIcon(scope);
  let scopeText = scopeDisplayName || scope;
  let accessibleLabel: string;
  if (aggregateType === 'platform') {
    scopeIcon = RESOURCE_ICONS.GLOBAL;
    scopeText = allOrgsLabel;
    accessibleLabel = formatMessage(messages['authz.scope.summary.label.platform'], {
      scopeLabel: formatMessage(AGGREGATE_SCOPE_LABELS[scopeType]),
    });
  } else if (aggregateType === 'org') {
    scopeIcon = RESOURCE_ICONS.ORGANIZATION;
    scopeText = org;
    accessibleLabel = formatMessage(messages['authz.scope.summary.label.org'], {
      scopeLabel: formatMessage(AGGREGATE_SCOPE_LABELS[scopeType]),
      organization: orgText,
    });
  } else {
    accessibleLabel = formatMessage(messages['authz.scope.summary.label.specific'], {
      scopeType,
      scopeName: scopeText,
      organization: orgText,
    });
  }

  return (
    <div
      role="group"
      aria-label={accessibleLabel}
      className={className ? `authz-scope-cell ${className}` : 'authz-scope-cell'}
    >
      <span className="d-flex align-items-center" aria-hidden="true">
        <Icon src={scopeIcon} className="mr-2 flex-shrink-0 text-primary" size="xs" />
        <span className="text-truncate text-gray-700 authz-scope-cell__name" title={scopeText}>{scopeText}</span>
      </span>
      {!aggregateType && (
        <span className="d-flex align-items-center small text-gray-500 authz-scope-cell__org ml-4" aria-hidden="true">
          <Icon src={RESOURCE_ICONS.ORGANIZATION} className="mr-2 flex-shrink-0" size="xs" />
          <span className="text-truncate" title={orgText}>{orgText}</span>
        </span>
      )}
    </div>
  );
};

export default ScopeSummary;
