import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import SearchFilter from './SearchFilter';

describe('SearchFilter', () => {
  const mockSetFilter = jest.fn();

  const defaultProps = {
    filterValue: '',
    setFilter: mockSetFilter,
    placeholder: 'Search placeholder',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input with correct placeholder', () => {
    render(<SearchFilter {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search placeholder');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should display empty value when filterValue is undefined', () => {
    const propsWithUndefined = { ...defaultProps, filterValue: undefined as any };
    render(<SearchFilter {...propsWithUndefined} />);

    const input = screen.getByPlaceholderText('Search placeholder');
    expect(input).toHaveValue('');
  });

  it('should display filterValue if provided', () => {
    const propsWithString = { ...defaultProps, filterValue: 'test search' };
    render(<SearchFilter {...propsWithString} />);

    const input = screen.getByPlaceholderText('Search placeholder');
    expect(input).toHaveValue('test search');
  });

  it('should call setFilter with input value when typing', () => {
    render(<SearchFilter {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search placeholder');
    fireEvent.change(input, { target: { value: 'new search term' } });

    expect(mockSetFilter).toHaveBeenCalledWith('new search term');
  });

  it('should call setFilter with undefined when input is cleared', () => {
    const propsWithValue = { ...defaultProps, filterValue: 'existing value' as any };
    render(<SearchFilter {...propsWithValue} />);

    const input = screen.getByPlaceholderText('Search placeholder');
    fireEvent.change(input, { target: { value: '' } });

    expect(mockSetFilter).toHaveBeenCalledWith(undefined);
  });

  it('should handle multiple character input correctly', () => {
    render(<SearchFilter {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search placeholder');

    // Type multiple characters
    fireEvent.change(input, { target: { value: 'a' } });
    expect(mockSetFilter).toHaveBeenCalledWith('a');

    fireEvent.change(input, { target: { value: 'ab' } });
    expect(mockSetFilter).toHaveBeenCalledWith('ab');

    fireEvent.change(input, { target: { value: 'abc' } });
    expect(mockSetFilter).toHaveBeenCalledWith('abc');
  });

  it('should handle different placeholder text', () => {
    const customPlaceholder = 'Enter search term here...';
    render(<SearchFilter {...defaultProps} placeholder={customPlaceholder} />);

    const input = screen.getByPlaceholderText(customPlaceholder);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', customPlaceholder);
  });
});
