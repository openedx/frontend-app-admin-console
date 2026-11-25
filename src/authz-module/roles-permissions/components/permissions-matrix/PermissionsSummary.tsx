import { useIntl } from '@openedx/frontend-base';
import { Badge, Icon } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { CatalogIcon } from '@src/authz-module/catalog';
import messages from '../../messages';

export interface CategoryTally {
  id: string;
  title: string;
  icon: string | null;
  selected: number;
  total: number;
}

interface PermissionsSummaryProps {
  totalSelected: number;
  categories: CategoryTally[];
}

/** Side panel with the total of enabled permissions and each category's "x/y". */
const PermissionsSummary = ({ totalSelected, categories }: PermissionsSummaryProps) => {
  const { formatMessage } = useIntl();
  const prefix = 'authz.roles.create.wizard.permissions.summary';
  const areas = categories.filter(({ selected }) => selected > 0).length;

  return (
    <aside className="permissions-summary sticky-top border border-light-400 rounded overflow-hidden shadow-sm">
      <div className="bg-primary-100 p-3">
        <h3 className="small font-weight-bold text-primary-500 mb-1">{formatMessage(messages[`${prefix}.title`])}</h3>
        <div aria-live="polite" aria-atomic="true">
          <p className="h2 font-weight-bold text-primary-500 mb-0">{totalSelected}</p>
          <p className="x-small text-gray-500 mb-0">
            {formatMessage(messages[`${prefix}.total`], { count: totalSelected, areas })}
          </p>
        </div>
      </div>
      <ul className="list-unstyled bg-white px-3 py-2 mb-0">
        {categories.map(({
          id, title, icon, selected, total,
        }) => (
          <li key={id} className="d-flex align-items-center py-2">
            <CatalogIcon name={icon} size="xs" className="text-primary-400 mr-2" />
            <span className="x-small text-gray-700 flex-grow-1">{title}</span>
            <Badge variant="light" pill className="bg-primary-100 text-primary-400 font-weight-normal">{selected}/{total}</Badge>
          </li>
        ))}
      </ul>
      <div className="bg-primary-100 p-3">
        <p className="x-small font-weight-bold text-info-500 d-flex align-items-center mb-1">
          <Icon src={Info} size="xs" className="mr-1" />
          {formatMessage(messages[`${prefix}.scope.title`])}
        </p>
        <p className="x-small text-gray-500 mb-0">{formatMessage(messages[`${prefix}.scope.body`])}</p>
      </div>
    </aside>
  );
};

export default PermissionsSummary;
