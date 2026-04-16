import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import MultipleChoiceFilter from './MultipleChoiceFilter';

describe('MultipleChoiceFilter', () => {
  const defaultProps = {
    filterButtonText: 'Test Filter',
    filterChoices: [
      { displayName: 'Option 1', value: 'option1' },
      { displayName: 'Option 2', value: 'option2' },
    ],
    filterValue: [],
    setFilter: jest.fn(),
  };

  const groupedChoices = [
    { displayName: 'Group A Option', value: 'groupA1', groupName: 'Group A' },
    { displayName: 'Group B Option', value: 'groupB1', groupName: 'Group B' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWrapper(<MultipleChoiceFilter {...defaultProps} />);
    expect(screen.getByText('Test Filter')).toBeInTheDocument();
  });

  it('displays filter button text', () => {
    renderWrapper(<MultipleChoiceFilter {...defaultProps} filterButtonText="Custom Filter" />);
    expect(screen.getByText('Custom Filter')).toBeInTheDocument();
  });

  it('shows count when items are selected', () => {
    renderWrapper(<MultipleChoiceFilter {...defaultProps} filterValue={['option1']} />);
    expect(screen.getByText('Test Filter (1)')).toBeInTheDocument();
  });

  it('opens dropdown menu when clicked', async () => {
    const user = userEvent.setup();
    renderWrapper(<MultipleChoiceFilter {...defaultProps} />);
    const button = screen.getByText('Test Filter');
    await user.click(button);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    renderWrapper(<MultipleChoiceFilter {...defaultProps} disabled />);
    expect(screen.getByText('Test Filter')).toBeInTheDocument();
  });

  it('displays search input when searchable', async () => {
    const user = userEvent.setup();
    renderWrapper(<MultipleChoiceFilter {...defaultProps} isSearchable onSearchChange={jest.fn()} />);
    const button = screen.getByText('Test Filter');
    await user.click(button);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('handles grouped choices', async () => {
    const user = userEvent.setup();
    renderWrapper(<MultipleChoiceFilter {...defaultProps} filterChoices={groupedChoices} isGrouped />);
    const button = screen.getByText('Test Filter');
    await user.click(button);
    expect(screen.getByText('Group A')).toBeInTheDocument();
    expect(screen.getByText('Group B')).toBeInTheDocument();
    const CheckA1 = screen.getByText('Group A Option');
    await user.click(CheckA1);
    expect(defaultProps.setFilter).toHaveBeenCalledWith(
      ['groupA1'],
      {
        groupName: 'test filter',
        value: 'groupA1',
        displayName: 'Group A Option',
      },
    );
  });

  it('calls setFilter when option is selected', async () => {
    const user = userEvent.setup();
    const mockSetFilter = jest.fn();
    renderWrapper(<MultipleChoiceFilter {...defaultProps} setFilter={mockSetFilter} />);
    const button = screen.getByText('Test Filter');
    await user.click(button);
    const option = screen.getByText('Option 1');
    await user.click(option);
    expect(mockSetFilter).toHaveBeenCalled();
  });

  it('adds option to selection on first click', async () => {
    const user = userEvent.setup();
    const mockSetFilter = jest.fn();
    renderWrapper(<MultipleChoiceFilter {...defaultProps} setFilter={mockSetFilter} filterValue={[]} />);
    const button = screen.getByText('Test Filter');
    await user.click(button);
    const checkbox = screen.getByLabelText('Option 1');
    await user.click(checkbox);
    expect(mockSetFilter).toHaveBeenCalledWith(
      ['option1'],
      {
        groupName: 'test filter',
        value: 'option1',
        displayName: 'Option 1',
      },
    );
  });

  it('removes option from selection when already selected', async () => {
    const user = userEvent.setup();
    const mockSetFilter = jest.fn();
    renderWrapper(<MultipleChoiceFilter {...defaultProps} setFilter={mockSetFilter} filterValue={['option1']} />);
    const button = screen.getByText('Test Filter (1)');
    await user.click(button);
    const checkbox = screen.getByLabelText('Option 1');
    await user.click(checkbox);
    expect(mockSetFilter).toHaveBeenCalledWith(
      [],
      {
        groupName: 'test filter',
        value: 'option1',
        displayName: 'Option 1',
      },
    );
  });

  it('handles multiple selections correctly', async () => {
    const user = userEvent.setup();
    const mockSetFilter = jest.fn();
    renderWrapper(<MultipleChoiceFilter {...defaultProps} setFilter={mockSetFilter} filterValue={['option1']} />);
    const button = screen.getByText('Test Filter (1)');
    await user.click(button);
    const checkbox = screen.getByLabelText('Option 2');
    await user.click(checkbox);
    expect(mockSetFilter).toHaveBeenCalledWith(
      ['option1', 'option2'],
      {
        groupName: 'test filter',
        value: 'option2',
        displayName: 'Option 2',
      },
    );
  });

  it('calls onSearchChange when search input changes', async () => {
    const user = userEvent.setup();
    const mockOnSearchChange = jest.fn();
    renderWrapper(
      <MultipleChoiceFilter
        {...defaultProps}
        isSearchable
        onSearchChange={mockOnSearchChange}
      />,
    );
    const button = screen.getByRole('button', { name: /test filter/i });
    await user.click(button);
    const searchInput = screen.getByRole('textbox');
    await user.type(searchInput, 'test search');
    expect(mockOnSearchChange).toHaveBeenCalled();
    expect(mockOnSearchChange).toHaveBeenLastCalledWith('test search');
  });
});
