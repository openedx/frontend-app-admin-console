export type FilterChoice = {
  groupName?: string;
  groupIcon?: React.ComponentType<{}>;
  displayName: string;
  value: string;
  description?: string;
};

export interface MultipleChoiceFilterProps {
  /** Column id of the filtered column. Used (not the localized label) to
   *  identify the filter group on chips and when removing applied filters. */
  filterId: string;
  filterButtonText: string;
  filterChoices: Array<FilterChoice>;
  filterValue: string[] | undefined;
  setFilter: (value: string[], newItem: FilterChoice) => void;
  isGrouped?: boolean;
  isSearchable?: boolean;
  onSearchChange?: (value: string) => void;
  iconSrc?: React.ComponentType<{}> | undefined;
  disabled?: boolean;
}
