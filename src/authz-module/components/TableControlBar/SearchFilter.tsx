import {
  Form,
  Icon,
} from '@openedx/paragon';
import { Search } from '@openedx/paragon/icons';

interface SearchFilterProps {
  filterValue: string;
  setFilter: (value: string) => void;
  placeholder: string;
}

const SearchFilter = ({
  filterValue, setFilter, placeholder,
}: SearchFilterProps) => (
  <Form.Group className="m-0">
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
