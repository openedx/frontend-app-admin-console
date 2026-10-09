import {
  Form,
  Icon,
} from '@openedx/paragon';
import { Search } from '@openedx/paragon/icons';
import { validateSizeFormControl } from '@src/authz-module/utils';

interface SearchFilterProps {
  filterValue: string;
  setFilter: (value: string) => void;
  placeholder: string;
  size?: 'sm' | 'md' | 'lg';
}

const SearchFilter = ({
  filterValue, setFilter, placeholder, size = 'sm'
}: SearchFilterProps) => (
  <Form.Group className="m-0" size={validateSizeFormControl(size)}>
    <Form.Control
      className="mw-xs mr-0"
      trailingElement={<Icon src={Search} />}
      value={filterValue || ''}
      type="text"
      onChange={e => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={placeholder}
    />
  </Form.Group>
);

export default SearchFilter;
