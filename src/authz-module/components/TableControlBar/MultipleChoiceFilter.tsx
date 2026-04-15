import {
  Dropdown, Form, Icon, Stack,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { FilterList, Search } from '@openedx/paragon/icons';
import { useState } from 'react';
import messages from '../messages';
import { MultipleChoiceFilterProps } from './types';

const MultipleChoiceFilter = ({
  filterButtonText,
  filterChoices,
  filterValue,
  setFilter,
  isGrouped = false,
  isSearchable = false,
  onSearchChange,
  iconSrc,
  disabled = false,
}: MultipleChoiceFilterProps) => {
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
  const { formatMessage } = useIntl();

  const checkedBoxes = filterValue || [];
  const handleClickCheckbox = (value, displayName) => {
    const newValue = {
      groupName: filterButtonText?.toLocaleLowerCase() || '',
      value,
      displayName,
    };
    if (checkedBoxes.includes(value)) {
      const newCheckedBoxes = checkedBoxes.filter((val) => val !== value);
      return setFilter(newCheckedBoxes, newValue);
    }
    const newCheckedBoxes = [...checkedBoxes, value];
    return setFilter(newCheckedBoxes, newValue);
  };

  const getGroupedChoices = () => {
    const groupedFilterChoices = filterChoices.reduce((groups, choice) => {
      const groupName = choice.groupName || 'Ungrouped';
      const icon = choice.groupIcon || undefined;
      if (!groups.has(groupName)) {
        groups.set(groupName, { groupName, options: [], icon });
      }
      groups.get(groupName)!.options.push({
        displayName: choice.displayName,
        value: choice.value,
      });
      return groups;
    }, new Map<string, { groupName: string; options: Array<{ displayName: string; value: string }>; icon?: any }>());
    return Array.from(groupedFilterChoices.values());
  };
  return (
    <Dropdown className="no-caret-dropdown filters">
      <Dropdown.Toggle variant={checkedBoxes.length > 0 ? 'primary' : 'outline-primary'}>
        <Stack direction="horizontal" gap={2}>
          {iconSrc && <Icon color="primary" src={iconSrc} />}
          {filterButtonText}
          {checkedBoxes.length > 0 && ` (${checkedBoxes.length})`}
          <Icon color="primary" src={FilterList} />
        </Stack>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {isSearchable && (
        <Form.Control
          className="m-1"
          type="text"
          trailingElement={<Icon src={Search} />}
          placeholder={formatMessage(messages['authz.table.controlbar.search'])}
          onChange={(e) => {
            setSearchValue(e.target.value);
            onSearchChange?.(e.target.value);
          }}
          value={searchValue}
        />
        )}
        <Form.CheckboxSet
          className="pgn__dropdown-filter-checkbox-group"
          name={filterButtonText}
          aria-label={filterButtonText}
          value={checkedBoxes}
        >
          <span className="small text-info-700 mt-2">
            {formatMessage(messages['authz.table.controlbar.filters.items.showing'], { current: filterChoices.length, total: filterChoices.length })}
          </span>
          {!isGrouped ? filterChoices.map(({
            displayName, value,
          }) => (
            <Form.Checkbox
              className="m-2 w-100"
              key={displayName}
              checked={checkedBoxes.includes(value)}
              value={value}
              onChange={() => handleClickCheckbox(value, displayName)}
              aria-label={displayName}
              disabled={checkedBoxes.includes(value) ? false : disabled}
            >
              <span className="small">{displayName}</span>
            </Form.Checkbox>
          ))
            : getGroupedChoices().map(({ groupName, icon, options }) => (
              <div key={groupName}>
                <div className="pgn__dropdown-filter-group-name text-info-700 d-flex align-items-center small m-2 ml-0">
                  {icon && <Icon color="primary" src={icon} className="mr-2" size="xs" />}
                  <span>{groupName}</span>
                </div>
                {options.map(({ displayName, value }) => (
                  <Form.Checkbox
                    className="m-2 w-100"
                    key={displayName}
                    value={value}
                    onChange={() => handleClickCheckbox(value, displayName)}
                    disabled={checkedBoxes.includes(value) ? false : disabled}
                    aria-label={displayName}
                  >
                    <span className="small">{displayName}</span>
                  </Form.Checkbox>
                ))}
              </div>
            ))}
        </Form.CheckboxSet>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default MultipleChoiceFilter;
