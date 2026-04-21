import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form, Icon, Badge, Stack,
} from '@openedx/paragon';
import { Search } from '@openedx/paragon/icons';
import OrgFilter from '@src/authz-module/components/TableControlBar/OrgFilter';
import messages from '../messages';

interface ScopeFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedOrgs: string[];
  onOrgsChange: (value: string[]) => void;
  contextType: string | undefined;
  contextLabel: string;
  allScopesCount: number;
  totalCount: number;
}

const ScopeFilterBar = ({
  search,
  onSearchChange,
  selectedOrgs,
  onOrgsChange,
  contextType,
  contextLabel,
  allScopesCount,
  totalCount,
}: ScopeFilterBarProps) => {
  const intl = useIntl();

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

          <OrgFilter
            filterButtonText={intl.formatMessage(messages['wizard.step2.filter.org.label'])}
            filterValue={selectedOrgs}
            setFilter={(value) => onOrgsChange(value)}
          />
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
