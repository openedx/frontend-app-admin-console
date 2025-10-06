import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import MultipleChoiceFilter from './MultipleChoiceFilter';

describe('MultipleChoiceFilter', () => {
  const mockSetFilter = jest.fn();

  const defaultProps = {
    Header: 'Test Filter',
    filterChoices: [
      { name: 'Option 1', number: 5, value: 'option1' },
      { name: 'Option 2', number: 3, value: 'option2' },
      { name: 'Option 3', number: 0, value: 'option3' },
    ],
    filterValue: [],
    setFilter: mockSetFilter,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dropdown with correct header', () => {
    render(<MultipleChoiceFilter {...defaultProps} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Test Filter')).toBeInTheDocument();
  });

  it('should render FilterList icon', () => {
    render(<MultipleChoiceFilter {...defaultProps} />);

    const button = screen.getByRole('button');
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should show all filter choices when dropdown is opened', () => {
    render(<MultipleChoiceFilter {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Option 1 (5)')).toBeInTheDocument();
    expect(screen.getByText('Option 2 (3)')).toBeInTheDocument();
    expect(screen.getByText('Option 3 (0)')).toBeInTheDocument();
  });

  it('should add value to filter when checkbox is checked', () => {
    render(<MultipleChoiceFilter {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    const checkbox1 = screen.getByLabelText('Option 1');
    fireEvent.click(checkbox1);

    expect(mockSetFilter).toHaveBeenCalledWith(['option1']);
  });

  it('should remove value from filter when checkbox is unchecked', () => {
    const propsWithSelectedValue = {
      ...defaultProps,
      filterValue: ['option1', 'option2'],
    };

    render(<MultipleChoiceFilter {...propsWithSelectedValue} />);

    fireEvent.click(screen.getByRole('button'));

    const checkbox1 = screen.getByLabelText('Option 1');
    fireEvent.click(checkbox1);

    expect(mockSetFilter).toHaveBeenCalledWith(['option2']);
  });

  it('should show checked checkboxes for pre-selected values', () => {
    const propsWithSelectedValues = {
      ...defaultProps,
      filterValue: ['option1', 'option3'],
    };

    render(<MultipleChoiceFilter {...propsWithSelectedValues} />);

    fireEvent.click(screen.getByRole('button'));

    const checkbox1 = screen.getByLabelText('Option 1');
    const checkbox2 = screen.getByLabelText('Option 2');
    const checkbox3 = screen.getByLabelText('Option 3');

    expect(checkbox1).toBeChecked();
    expect(checkbox2).not.toBeChecked();
    expect(checkbox3).toBeChecked();
  });

  it('should call setFilter with correct array when adding to existing selections', () => {
    const propsWithExistingSelection = {
      ...defaultProps,
      filterValue: ['option2'],
    };

    render(<MultipleChoiceFilter {...propsWithExistingSelection} />);

    fireEvent.click(screen.getByRole('button'));

    const checkbox1 = screen.getByLabelText('Option 1');
    fireEvent.click(checkbox1);

    expect(mockSetFilter).toHaveBeenCalledWith(['option2', 'option1']);
  });
});
