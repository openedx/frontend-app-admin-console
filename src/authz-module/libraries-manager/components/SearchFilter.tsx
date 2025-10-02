import { FC } from 'react';
import {
  Form,
  Icon,
} from '@openedx/paragon';
import { Search } from '@openedx/paragon/icons';

interface SearchFilterProps {
  filterValue: string[];
  setFilter: (value: string[]) => void;
  placeholder: string;
}

const SearchFilter: FC<SearchFilterProps> = ({
  filterValue, setFilter, placeholder,
}) => (
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
);

export default SearchFilter;
