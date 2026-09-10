import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import userEvent from '@testing-library/user-event';
import { ExpandMore } from '@openedx/paragon/icons';
import ViewMoreLink from './ViewMoreLink';

describe('ViewMoreLink', () => {
  const mockOnClick = jest.fn();
  const defaultProps = {
    label: 'View more details',
    onClick: mockOnClick,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('exposes the label as a button, not a link, since it triggers an action in place', () => {
      renderWrapper(<ViewMoreLink {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'View more details' })).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders without an icon when iconSrc is not provided', () => {
      renderWrapper(<ViewMoreLink {...defaultProps} />);

      const button = screen.getByRole('button', { name: 'View more details' });
      expect(button.querySelector('svg')).not.toBeInTheDocument();
    });

    it('renders with an icon when iconSrc is provided', () => {
      renderWrapper(<ViewMoreLink {...defaultProps} iconSrc={ExpandMore} />);

      const button = screen.getByRole('button', { name: 'View more details' });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls onClick handler when user clicks the button', async () => {
      const user = userEvent.setup();
      renderWrapper(<ViewMoreLink {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'View more details' }));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick handler when user clicks the button with an icon', async () => {
      const user = userEvent.setup();
      renderWrapper(<ViewMoreLink {...defaultProps} iconSrc={ExpandMore} />);

      await user.click(screen.getByRole('button', { name: 'View more details' }));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('handles multiple clicks correctly', async () => {
      const user = userEvent.setup();
      renderWrapper(<ViewMoreLink {...defaultProps} />);

      const button = screen.getByRole('button', { name: 'View more details' });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('can be reached and activated with the keyboard alone', async () => {
      const user = userEvent.setup();
      renderWrapper(<ViewMoreLink {...defaultProps} iconSrc={ExpandMore} />);

      await user.tab();
      expect(screen.getByRole('button', { name: 'View more details' })).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });
});
