import { renderWrapper } from '@src/setupTest';
import { fireEvent, waitFor } from '@testing-library/react';
import AnchorButton from './AnchorButton';

const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

describe('AnchorButton', () => {
  beforeEach(() => {
    mockScrollTo.mockClear();
    // Reset window.scrollY
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
  });

  it('renders without crashing', () => {
    renderWrapper(<AnchorButton />);
  });

  it('does not display button initially', () => {
    const { container } = renderWrapper(<AnchorButton />);
    expect(container.firstChild).toBeNull();
  });

  it('calls window.scrollTo with correct parameters when button is clicked', async () => {
    // Make button visible first
    Object.defineProperty(window, 'scrollY', {
      value: 400,
      writable: true,
    });

    const { getByRole, rerender } = renderWrapper(<AnchorButton />);
    fireEvent.scroll(window);
    rerender(<AnchorButton />);

    await waitFor(() => {
      const button = getByRole('button');
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });
  });

  it('removes event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderWrapper(<AnchorButton />);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
