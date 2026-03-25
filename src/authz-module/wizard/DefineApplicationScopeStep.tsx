import {
  useState, useEffect, useRef, useMemo,
} from 'react';
import {
  Form, Spinner, Dropdown, Icon, Badge,
} from '@openedx/paragon';
import {
  Search, FilterList, ExpandLess, ExpandMore,
} from '@openedx/paragon/icons';
import { useScopes, useOrganizations } from '../data/hooks';
import { courseRolesMetadata, libraryRolesMetadata } from '../constants';
import { ScopeItem } from '../data/api';

const allRolesMetadata = [...courseRolesMetadata, ...libraryRolesMetadata];

function getContextType(role: string | null): string | undefined {
  if (!role) { return undefined; }
  return allRolesMetadata.find((r) => r.role === role)?.contextType;
}

function getContextLabel(contextType: string | undefined): string {
  if (contextType === 'course') { return 'Courses'; }
  if (contextType === 'library') { return 'Libraries'; }
  return 'Items';
}

interface ScopeCheckboxItemProps {
  scope: ScopeItem;
  checked: boolean;
  onToggle: (scopeId: string) => void;
}

const ScopeCheckboxItem = ({ scope, checked, onToggle }: ScopeCheckboxItemProps) => (
  <div className="d-flex align-items-start mb-2" style={{ gap: '8px' }}>
    <input
      type="checkbox"
      id={`scope-${scope.id}`}
      checked={checked}
      onChange={() => onToggle(scope.id)}
      style={{
        width: '16px', height: '16px', marginTop: '2px', flexShrink: 0, cursor: 'pointer',
      }}
    />
    <label htmlFor={`scope-${scope.id}`} className="mb-0" style={{ cursor: 'pointer' }}>
      <span>{scope.name}</span>
      {scope.description && (
        <small className="d-block text-muted">{scope.description}</small>
      )}
    </label>
  </div>
);

interface OrgSectionProps {
  org: string;
  orgName: string;
  scopes: ScopeItem[];
  selectedScopes: Set<string>;
  onScopeToggle: (scopeId: string) => void;
}

const OrgSection = ({
  orgName, scopes, selectedScopes, onScopeToggle,
}: OrgSectionProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="scope-org-group mb-3">
      <button
        type="button"
        className="d-flex align-items-center bg-transparent border-0 p-0 mb-2 text-primary font-weight-bold"
        style={{ gap: '4px' }}
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <span>Org: {orgName}</span>
        <Icon src={collapsed ? ExpandMore : ExpandLess} className="text-primary" />
      </button>

      {!collapsed && (
        <div className="pl-2">
          {scopes.map((scope) => (
            <ScopeCheckboxItem
              key={scope.id}
              scope={scope}
              checked={selectedScopes.has(scope.id)}
              onToggle={onScopeToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface DefineApplicationScopeStepProps {
  selectedRole: string | null;
  selectedScopes: Set<string>;
  onScopeToggle: (scopeId: string) => void;
}

const DefineApplicationScopeStep = ({
  selectedRole,
  selectedScopes,
  onScopeToggle,
}: DefineApplicationScopeStepProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const contextType = getContextType(selectedRole);
  const contextLabel = getContextLabel(contextType);

  const {
    data: scopesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useScopes({
    contextType,
    search: debouncedSearch || undefined,
    org: selectedOrg || undefined,
  });

  const { data: organizations } = useOrganizations(contextType);

  const allScopes = useMemo(
    () => scopesData?.pages.flatMap((page) => page.results) ?? [],
    [scopesData],
  );

  const totalCount = scopesData?.pages[0]?.count ?? 0;

  const platformScopes = useMemo(
    () => allScopes.filter((s) => !s.org),
    [allScopes],
  );

  const scopesByOrg = useMemo(() => {
    const orgScopes = allScopes.filter((s) => !!s.org);
    return orgScopes.reduce<Record<string, ScopeItem[]>>((acc, scope) => {
      if (!acc[scope.org]) { acc[scope.org] = []; }
      acc[scope.org].push(scope);
      return acc;
    }, {});
  }, [allScopes]);

  const orderedOrgs = useMemo(() => Object.keys(scopesByOrg), [scopesByOrg]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) { return undefined; }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const selectedOrgLabel = organizations?.find((o) => o.org === selectedOrg)?.name
    || organizations?.find((o) => o.org === selectedOrg)?.org
    || 'Organization';

  return (
    <div className="define-application-scope-step">
      <h3 className="mb-4">Applies to</h3>

      {/* Search + Organization filter + count */}
      <div className="d-flex align-items-center justify-content-between gap-3 mb-2 flex-wrap">
        <div className="d-flex align-items-center gap-3">
          <div style={{ width: '300px' }}>
            <Form.Group controlId="scope-search" className="mb-0">
              <Form.Control
                type="text"
                value={search}
                onChange={(e: { target: { value: string } }) => setSearch(e.target.value)}
                placeholder="Search"
                trailingElement={<Icon src={Search} />}
              />
            </Form.Group>
          </div>

          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" id="org-filter-toggle">
              <Icon src={FilterList} className="mr-2" />
              {selectedOrg ? selectedOrgLabel : 'Organization'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSelectedOrg('')} active={!selectedOrg}>
                All Organizations
              </Dropdown.Item>
              {organizations?.map((org) => (
                <Dropdown.Item
                  key={org.org}
                  onClick={() => setSelectedOrg(org.org)}
                  active={selectedOrg === org.org}
                >
                  {org.name || org.org}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <span className="text-muted small text-nowrap">
          Showing {allScopes.length} of {totalCount}.
        </span>
      </div>

      {/* Active filter chip */}
      {contextType && (
        <div className="mb-3 d-flex align-items-center gap-2">
          <span className="text-muted small">Filter applied:</span>
          <Badge className="py-1 px-2" style={{ background: '#e8e8e8', color: '#333', fontWeight: 'normal' }}>
            {contextLabel}
          </Badge>
        </div>
      )}

      {/* Scopes list */}
      <div
        className="scope-list border rounded p-3"
        style={{ maxHeight: '500px', overflowY: 'auto' }}
      >
        {isLoading ? (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" screenReaderText="Loading scopes..." />
          </div>
        ) : (
          <>
            {platformScopes.map((scope) => (
              <ScopeCheckboxItem
                key={scope.id}
                scope={scope}
                checked={selectedScopes.has(scope.id)}
                onToggle={onScopeToggle}
              />
            ))}

            {orderedOrgs.map((org) => (
              <OrgSection
                key={org}
                org={org}
                orgName={organizations?.find((o) => o.org === org)?.name || org}
                scopes={scopesByOrg[org]}
                selectedScopes={selectedScopes}
                onScopeToggle={onScopeToggle}
              />
            ))}

            {allScopes.length === 0 && (
              <p className="text-muted text-center py-3">No scopes found.</p>
            )}

            <div ref={loadMoreRef} />

            {isFetchingNextPage && (
              <div className="d-flex justify-content-center py-2">
                <Spinner animation="border" size="sm" screenReaderText="Loading more..." />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DefineApplicationScopeStep;
