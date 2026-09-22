import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import ExpandableButton from './ExpandableButton';

describe('ExpandableButton', () => {
  const mockOnClick = jest.fn();
  const defaultProps = {
    label: 'View more details',
    onClick: mockOnClick,
    isExpanded: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('exposes the label as a button, not a link, since it triggers an action in place', () => {
      renderWrapper(<ExpandableButton {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'View more details' })).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('shows a chevron and announces itself as closed while collapsed', () => {
      renderWrapper(<ExpandableButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: 'View more details' });
      expect(button.querySelector('svg')).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('announces itself as open once expanded', () => {
      renderWrapper(<ExpandableButton {...defaultProps} isExpanded />);

      const button = screen.getByRole('button', { name: 'View more details' });
      expect(button.querySelector('svg')).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('user interactions', () => {
    it('calls onClick handler when user clicks the button', async () => {
      const user = userEvent.setup();
      renderWrapper(<ExpandableButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'View more details' }));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('handles multiple clicks correctly', async () => {
      const user = userEvent.setup();
      renderWrapper(<ExpandableButton {...defaultProps} />);

      const button = screen.getByRole('button', { name: 'View more details' });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('can be reached and activated with the keyboard alone', async () => {
      const user = userEvent.setup();
      renderWrapper(<ExpandableButton {...defaultProps} />);

      await user.tab();
      expect(screen.getByRole('button', { name: 'View more details' })).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });
});
