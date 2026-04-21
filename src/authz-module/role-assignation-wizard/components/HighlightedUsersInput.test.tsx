import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HighlightedUsersInput from './HighlightedUsersInput';

const defaultProps = {
  id: 'users-input',
  value: '',
  onChange: jest.fn(),
  invalidUsers: [],
  placeholder: 'Enter usernames',
};

describe('HighlightedUsersInput', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders a textarea', () => {
    render(<HighlightedUsersInput {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('does not render the overlay when no invalidUsers', () => {
    const { container } = render(<HighlightedUsersInput {...defaultProps} />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });

  it('renders the overlay when there are invalidUsers', () => {
    const { container } = render(
      <HighlightedUsersInput {...defaultProps} value="jdoe, baduser" invalidUsers={['baduser']} />,
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('highlights invalid user parts in red', () => {
    const { container } = render(
      <HighlightedUsersInput {...defaultProps} value="jdoe, baduser" invalidUsers={['baduser']} />,
    );
    const invalidSpan = container.querySelector('[data-invalid]');
    expect(invalidSpan).toBeInTheDocument();
    expect(invalidSpan!.textContent).toContain('baduser');
  });

  it('renders valid user parts in dark color', () => {
    const { container } = render(
      <HighlightedUsersInput {...defaultProps} value="jdoe, baduser" invalidUsers={['baduser']} />,
    );
    const overlay = container.querySelector('[aria-hidden="true"]');
    const validSpan = Array.from(overlay!.querySelectorAll('span:not([data-invalid])')).find(
      (s) => s.textContent?.includes('jdoe'),
    );
    expect(validSpan).toBeDefined();
  });

  it('shows placeholder when no invalid users', () => {
    render(<HighlightedUsersInput {...defaultProps} value="" />);
    expect(screen.getByPlaceholderText('Enter usernames')).toBeInTheDocument();
  });

  it('hides placeholder when overlay is active', () => {
    render(
      <HighlightedUsersInput {...defaultProps} value="jdoe, baduser" invalidUsers={['baduser']} />,
    );
    expect(screen.queryByPlaceholderText('Enter usernames')).not.toBeInTheDocument();
  });

  it('makes textarea text transparent when overlay is active', () => {
    const { container } = render(
      <HighlightedUsersInput {...defaultProps} value="jdoe, baduser" invalidUsers={['baduser']} />,
    );
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('highlighted-users-input__textarea--highlighted');
  });

  it('adds is-invalid class when hasError is true', () => {
    const { container } = render(
      <HighlightedUsersInput {...defaultProps} hasError />,
    );
    expect(container.querySelector('textarea')).toHaveClass('is-invalid');
  });

  it('does not add is-invalid class when hasError is false', () => {
    const { container } = render(
      <HighlightedUsersInput {...defaultProps} hasError={false} />,
    );
    expect(container.querySelector('textarea')).not.toHaveClass('is-invalid');
  });

  it('calls onChange when user types', async () => {
    const handleChange = jest.fn();
    render(<HighlightedUsersInput {...defaultProps} onChange={handleChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'alice');
    expect(handleChange).toHaveBeenCalled();
  });

  it('syncs overlay scroll on textarea scroll', () => {
    const { container } = render(
      <HighlightedUsersInput {...defaultProps} value="jdoe, baduser" invalidUsers={['baduser']} />,
    );
    const textarea = container.querySelector('textarea')!;
    const overlay = container.querySelector('[aria-hidden="true"]') as HTMLElement;

    Object.defineProperty(textarea, 'scrollTop', { value: 50, writable: true });
    fireEvent.scroll(textarea, { target: { scrollTop: 50 } });

    expect(overlay.scrollTop).toBe(50);
  });
});
