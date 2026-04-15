export type FilterChoice = {
  groupName?: string;
  groupIcon?: React.ComponentType<{}>;
  displayName: string;
  value: string;
};

export interface MultipleChoiceFilterProps {
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
