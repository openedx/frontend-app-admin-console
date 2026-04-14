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
    it('renders the link with the provided label', () => {
      renderWrapper(<ViewMoreLink {...defaultProps} />);

      expect(screen.getByText('View more details')).toBeInTheDocument();
    });

    it('renders without an icon when iconSrc is not provided', () => {
      renderWrapper(<ViewMoreLink {...defaultProps} />);

      const link = screen.getByText('View more details');
      expect(link).toBeInTheDocument();
      // The icon should not be present when iconSrc is not provided
      expect(link.querySelector('svg')).not.toBeInTheDocument();
    });

    it('renders with an icon when iconSrc is provided', () => {
      renderWrapper(<ViewMoreLink {...defaultProps} iconSrc={ExpandMore} />);

      const link = screen.getByText('View more details');
      expect(link).toBeInTheDocument();
      // The icon should be present when iconSrc is provided
      expect(link.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls onClick handler when user clicks the link', async () => {
      const user = userEvent.setup();
      renderWrapper(<ViewMoreLink {...defaultProps} />);

      const link = screen.getByText('View more details');
      await user.click(link);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick handler when user clicks the link with an icon', async () => {
      const user = userEvent.setup();
      renderWrapper(<ViewMoreLink {...defaultProps} iconSrc={ExpandMore} />);

      const link = screen.getByText('View more details');
      await user.click(link);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('handles multiple clicks correctly', async () => {
      const user = userEvent.setup();
      renderWrapper(<ViewMoreLink {...defaultProps} />);

      const link = screen.getByText('View more details');
      await user.click(link);
      await user.click(link);
      await user.click(link);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });
});
