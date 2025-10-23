import { FC } from 'react';
import {
  Dropdown, Form, Icon, Stack,
} from '@openedx/paragon';
import { FilterList } from '@openedx/paragon/icons';

interface MultipleChoiceFilterProps {
  Header: string;
  filterChoices: Array<{ name: string; number: number; value: string }>;
  filterValue: string[] | undefined;
  setFilter: (value: string[]) => void;
}

const MultipleChoiceFilter: FC<MultipleChoiceFilterProps> = ({
  Header, filterChoices, filterValue, setFilter,
}) => {
  const checkedBoxes = filterValue || [];

  const changeCheckbox = (value) => {
    if (checkedBoxes.includes(value)) {
      const newCheckedBoxes = checkedBoxes.filter((val) => val !== value);
      return setFilter(newCheckedBoxes);
    }
    checkedBoxes.push(value);
    return setFilter(checkedBoxes);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-primary">
        <Stack direction="horizontal" gap={2}>
          <Icon color="primary" src={FilterList} />
          {Header}
        </Stack>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Form.CheckboxSet
          className="pgn__dropdown-filter-checkbox-group"
          name={Header}
          aria-label={Header}
          value={checkedBoxes}
        >
          {filterChoices.map(({
            name, number, value,
          }) => (
            <Form.Checkbox
              className="m-2"
              key={name}
              value={value}
              onChange={() => changeCheckbox(value)}
              aria-label={name}
            >
              <Stack direction="horizontal" gap={2}>
                {`${name} (${number || 0})`}
              </Stack>
            </Form.Checkbox>
          ))}
        </Form.CheckboxSet>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default MultipleChoiceFilter;
