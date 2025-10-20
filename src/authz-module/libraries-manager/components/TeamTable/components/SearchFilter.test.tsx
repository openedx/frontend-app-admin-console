import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilter from './SearchFilter';

describe('SearchFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const SearchFilterWrapper = ({
    initFilterValue = '', customPlaceholder = 'Search placeholder',
  }:{ initFilterValue?: string; customPlaceholder?:string }) => {
    const [filter, setFilter] = useState(initFilterValue);
    return (
      <SearchFilter
        filterValue={filter}
        setFilter={setFilter}
        placeholder={customPlaceholder}
      />
    );
  };

  it('should render search input with correct placeholder', () => {
    render(<SearchFilterWrapper />);

    const input = screen.getByPlaceholderText('Search placeholder');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should display empty value when filterValue is undefined', () => {
    render(<SearchFilterWrapper initFilterValue={undefined} />);

    const input = screen.getByPlaceholderText('Search placeholder');
    expect(input).toHaveValue('');
  });

  it('should display filterValue if provided', () => {
    render(<SearchFilterWrapper initFilterValue="test search" />);

    const input = screen.getByPlaceholderText('Search placeholder');
    expect(input).toHaveValue('test search');
  });

  it('should call setFilter with input value when typing', async () => {
    const user = userEvent.setup();
    render(<SearchFilterWrapper />);

    const input = screen.getByPlaceholderText('Search placeholder');
    await user.click(input);
    await user.type(input, 'new search term');

    expect(input).toHaveValue('new search term');
  });

  it('should clear the input correctly', async () => {
    const user = userEvent.setup();
    render(<SearchFilterWrapper initFilterValue="existing value" />);

    const input = screen.getByPlaceholderText('Search placeholder');
    await user.click(input);
    await user.clear(input);
    expect(input).toHaveValue('');
  });

  it('should handle multiple character input correctly', async () => {
    const user = userEvent.setup();

    render(<SearchFilterWrapper />);

    const input = screen.getByPlaceholderText('Search placeholder');
    await user.click(input);

    // Type multiple characters
    await user.type(input, 'a');
    expect(input).toHaveValue('a');

    await user.type(input, 'b');
    expect(input).toHaveValue('ab');

    await user.type(input, 'c');
    expect(input).toHaveValue('abc');
  });

  it('should handle different placeholder text', () => {
    const customPlaceholder = 'Enter search term here...';
    render(<SearchFilterWrapper customPlaceholder={customPlaceholder} />);

    const input = screen.getByPlaceholderText(customPlaceholder);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', customPlaceholder);
  });
});
