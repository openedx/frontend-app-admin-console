import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form, Dropdown, Icon, Badge, Stack,
} from '@openedx/paragon';
import { Search, FilterList } from '@openedx/paragon/icons';
import { Org } from 'types';
import messages from '../messages';

interface ScopeFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedOrg: string;
  onOrgChange: (org: string) => void;
  organizations: Org[] | undefined;
  contextType: string | undefined;
  contextLabel: string;
  allScopesCount: number;
  totalCount: number;
}

const ScopeFilterBar = ({
  search,
  onSearchChange,
  selectedOrg,
  onOrgChange,
  organizations,
  contextType,
  contextLabel,
  allScopesCount,
  totalCount,
}: ScopeFilterBarProps) => {
  const intl = useIntl();
  const selectedOrgLabel = organizations?.find((o) => o.shortName === selectedOrg)?.name
    || selectedOrg
    || intl.formatMessage(messages['wizard.step2.filter.org.label']);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between gap-3 mb-2 flex-wrap">
        <div className="d-flex align-items-center gap-3">
          <div style={{ width: '300px' }}>
            <Form.Group controlId="scope-search" className="mb-0">
              <Form.Control
                type="text"
                value={search}
                onChange={(e: { target: { value: string } }) => onSearchChange(e.target.value)}
                placeholder={intl.formatMessage(messages['wizard.step2.search.placeholder'])}
                trailingElement={<Icon src={Search} />}
              />
            </Form.Group>
          </div>

          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" id="org-filter-toggle">
              <Icon src={FilterList} className="mr-2" />
              {selectedOrg ? selectedOrgLabel : intl.formatMessage(messages['wizard.step2.filter.org.label'])}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => onOrgChange('')} active={!selectedOrg}>
                {intl.formatMessage(messages['wizard.step2.filter.org.all'])}
              </Dropdown.Item>
              {organizations?.map((org) => (
                <Dropdown.Item
                  key={org.shortName}
                  onClick={() => onOrgChange(org.shortName)}
                  active={selectedOrg === org.shortName}
                >
                  {org.name || org.shortName}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <span className="text-muted small text-nowrap">
          {intl.formatMessage(messages['wizard.step2.count'], { shown: allScopesCount, total: totalCount })}
        </span>
      </div>

      {contextType && (
        <Stack direction="horizontal" gap={2} className="align-items-center mt-3">
          <span className="text-muted small">{intl.formatMessage(messages['wizard.step2.filter.applied'])}</span>
          <Badge className="py-1 px-2" variant="light">
            {contextLabel}
          </Badge>
        </Stack>
      )}
    </>
  );
};

export default ScopeFilterBar;
