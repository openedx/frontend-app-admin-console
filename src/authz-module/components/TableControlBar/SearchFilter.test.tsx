import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import SearchFilter from './SearchFilter';

describe('SearchFilter', () => {
  const defaultProps = {
    filterValue: '',
    setFilter: jest.fn(),
    placeholder: 'Search...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWrapper(<SearchFilter {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    renderWrapper(<SearchFilter {...defaultProps} placeholder="Search users..." />);
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });

  it('displays current filter value', () => {
    renderWrapper(<SearchFilter {...defaultProps} filterValue="test query" />);
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('calls setFilter when input changes', async () => {
    const user = userEvent.setup();
    const mockSetFilter = jest.fn();
    renderWrapper(<SearchFilter {...defaultProps} setFilter={mockSetFilter} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'search text');
    expect(mockSetFilter).toHaveBeenCalled();
  });

  it('handles empty filter value', () => {
    renderWrapper(<SearchFilter {...defaultProps} filterValue="" />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('handles undefined filter value', () => {
    renderWrapper(<SearchFilter {...defaultProps} filterValue={undefined as any} />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
