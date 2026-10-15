import { render, waitFor } from '@testing-library/react';
import { Icon } from '@openedx/paragon';
import { RemoveRedEye } from '@openedx/paragon/icons';
import CatalogIcon from './CatalogIcon';

describe('CatalogIcon', () => {
  it('shows the Paragon icon the catalog names', async () => {
    const { container: expected } = render(<Icon src={RemoveRedEye} size="sm" />);

    const { container } = render(<CatalogIcon name="RemoveRedEye" size="sm" />);

    await waitFor(() => expect(container.innerHTML).toBe(expected.innerHTML));
  });

  it('shows the same icon wherever the catalog names it', async () => {
    const { container: expected } = render(<Icon src={RemoveRedEye} size="sm" />);

    const { container } = render(
      <>
        <CatalogIcon name="RemoveRedEye" size="sm" />
        <CatalogIcon name="RemoveRedEye" size="sm" />
      </>,
    );

    await waitFor(() => expect(container.innerHTML).toBe(expected.innerHTML.repeat(2)));
  });

  it('keeps an empty icon in place when the name is not a Paragon icon', async () => {
    const { container } = render(<CatalogIcon name="NotAParagonIcon" size="sm" />);

    await waitFor(() => expect(container.querySelector('.pgn__icon')).toBeInTheDocument());
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('keeps an empty icon in place when the name is not a valid icon name', async () => {
    const { container } = render(<CatalogIcon name="../index" size="sm" />);

    await waitFor(() => expect(container.querySelector('.pgn__icon')).toBeInTheDocument());
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders nothing when the catalog sends no icon', () => {
    const { container } = render(<CatalogIcon name={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
