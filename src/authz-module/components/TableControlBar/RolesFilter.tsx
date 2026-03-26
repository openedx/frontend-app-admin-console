import React, { useMemo } from 'react';
import {
  Person, Language, School, LibraryBooks,
} from '@openedx/paragon/icons';
import MultipleChoiceFilter from './MultipleChoiceFilter';
import { MultipleChoiceFilterProps } from './types';

type RolesFilterProps = Omit<MultipleChoiceFilterProps, 'filterChoices' | 'isSearchable' | 'onSearchChange'>;

const RolesFilter = ({
  filterButtonText, filterValue, setFilter, disabled,
}: RolesFilterProps) => {
  // TODO: use a constant
  const filterChoices = useMemo(() => [
    {
      groupName: 'Global', groupIcon: Language, displayName: 'Super Admin', value: 'Super Admin',
    },
    {
      groupName: 'Global', groupIcon: Language, displayName: 'Global Staff', value: 'Global Staff',
    },

    {
      groupName: 'Course', groupIcon: School, displayName: 'Course Admin', value: 'Course Admin',
    },
    {
      groupName: 'Course', groupIcon: School, displayName: 'Course Staff', value: 'Course Staff',
    },
    {
      groupName: 'Course', groupIcon: School, displayName: 'Course Editor', value: 'Course Editor',
    },
    {
      groupName: 'Course', groupIcon: School, displayName: 'Course Auditor', value: 'Course Auditor',
    },

    {
      groupName: 'Library', groupIcon: LibraryBooks, displayName: 'Library Admin', value: 'Library Admin',
    },
    {
      groupName: 'Library', groupIcon: LibraryBooks, displayName: 'Library Author', value: 'Library Author',
    },
    {
      groupName: 'Library', groupIcon: LibraryBooks, displayName: 'Library Collaborator', value: 'Library Collaborator',
    },
    {
      groupName: 'Library', groupIcon: LibraryBooks, displayName: 'Library User', value: 'Library User',
    },
  ], []);
  return (
    <MultipleChoiceFilter
      filterButtonText={filterButtonText}
      filterChoices={filterChoices}
      filterValue={filterValue}
      setFilter={setFilter}
      isGrouped
      iconSrc={Person}
      disabled={disabled}
    />
  );
};

export default RolesFilter;
