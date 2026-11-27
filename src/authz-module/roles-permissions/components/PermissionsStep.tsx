import { useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Col, Row } from '@openedx/paragon';
import type { Category, Permission } from '@src/authz-module/catalog';
import type { PermissionSelection } from '../hooks/usePermissionSelection';
import { getCategoryTally } from '../permissionSelection';
import messages from '../messages';
import PermissionCategorySection from './permissions-matrix/PermissionCategorySection';
import PermissionsMatrixToolbar from './permissions-matrix/PermissionsMatrixToolbar';
import PermissionsSummary from './permissions-matrix/PermissionsSummary';

const OTHER_CATEGORY_ID = '__other__';

interface PermissionsStepProps {
  categories: Category[];
  permissions: Permission[];
  selection: PermissionSelection;
}

/**
 * Second step of the create custom role wizard: the permissions of the role as a matrix of
 * collapsible categories, beside a summary of what is enabled.
 */
const PermissionsStep = ({ categories, permissions, selection }: PermissionsStepProps) => {
  const { formatMessage } = useIntl();
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const permissionNames = new Map(permissions.map(({ id, displayName }) => [id, displayName]));
  const knownCategoryIds = new Set(categories.map(({ id }) => id));
  const groups = [
    ...categories.map((category) => ({
      id: category.id,
      title: category.displayName,
      icon: category.icon,
      permissions: permissions.filter(({ categoryId }) => categoryId === category.id),
    })),
    {
      id: OTHER_CATEGORY_ID,
      title: formatMessage(messages['authz.roles.create.wizard.permissions.category.other']),
      icon: null,
      permissions: permissions.filter(({ categoryId }) => !categoryId || !knownCategoryIds.has(categoryId)),
    },
  ].filter((group) => group.permissions.length > 0);

  const normalizedSearch = search.trim().toLowerCase();
  const matches = (permission: Permission) => {
    return !normalizedSearch
      || `${permission.displayName} ${permission.description}`.toLowerCase().includes(normalizedSearch);
  };

  const visibleGroups = groups
    .map((group) => ({ ...group, visiblePermissions: group.permissions.filter(matches) }))
    .filter((group) => group.visiblePermissions.length > 0);
  const visibleCount = visibleGroups.reduce((count, group) => count + group.visiblePermissions.length, 0);

  // While searching, matches are shown open, so a hit is never hidden inside a closed category.
  const isNarrowed = !!normalizedSearch;
  const isOpen = (groupId: string) => isNarrowed || expandedIds.has(groupId);
  const areAllExpanded = visibleGroups.length > 0 && visibleGroups.every(({ id }) => isOpen(id));
  const handleToggleExpandAll = () => setExpandedIds(areAllExpanded ? new Set() : new Set(groups.map(({ id }) => id)));
  const handleToggleOpen = (groupId: string) => setExpandedIds((previous) => {
    const next = new Set(previous);
    if (!next.delete(groupId)) next.add(groupId);
    return next;
  });

  const tallies = groups.map((group) => ({
    id: group.id,
    title: group.title,
    icon: group.icon,
    ...getCategoryTally(selection.effective, group.permissions.map(({ id }) => id)),
  }));

  return (
    <div className="py-4">
      <h2 className="h4 text-primary-500 mb-4">
        {formatMessage(messages['authz.roles.create.wizard.permissions.title'])}
      </h2>
      <Row className="mx-0">
        <Col xs={12} lg={9} className="px-0 pr-lg-4">
          <PermissionsMatrixToolbar
            search={search}
            onSearchChange={setSearch}
            areAllExpanded={areAllExpanded}
            onToggleExpandAll={handleToggleExpandAll}
            isExpandAllDisabled={isNarrowed}
          />
          <div role="status" className="sr-only">
            {formatMessage(messages['authz.roles.create.wizard.permissions.results.status'], { count: visibleCount })}
          </div>
          {visibleGroups.length === 0 && (
            <p className="text-gray-500">{formatMessage(messages['authz.roles.create.wizard.permissions.empty'])}</p>
          )}
          {visibleGroups.map((group) => {
            const tally = tallies.find(({ id }) => id === group.id)!;
            return (
              <PermissionCategorySection
                key={group.id}
                title={group.title}
                icon={group.icon}
                visiblePermissions={group.visiblePermissions}
                selectedCount={tally.selected}
                totalCount={tally.total}
                isOpen={isOpen(group.id)}
                onToggleOpen={() => handleToggleOpen(group.id)}
                isToggleDisabled={isNarrowed}
                isPermissionOn={(permissionId) => selection.effective.has(permissionId)}
                getRequiredByNames={(permissionId) => selection.requiredBy[permissionId]
                  ?.map((id) => permissionNames.get(id) ?? id)}
                onTogglePermission={selection.toggle}
                onSetAll={(isOn) => selection.setCategory(group.visiblePermissions.map(({ id }) => id), isOn)}
              />
            );
          })}
        </Col>
        {/* A quarter of the width on large screens; below that it follows the categories. */}
        <Col xs={12} lg={3} className="px-0">
          <PermissionsSummary totalSelected={selection.selectedCount} categories={tallies} />
        </Col>
      </Row>
    </div>
  );
};

export default PermissionsStep;
