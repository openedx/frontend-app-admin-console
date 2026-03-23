import { render } from '@testing-library/react';
import AnchorButton from './AnchorButton';

jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: () => ({
    formatMessage: () => 'Scroll to top',
  }),
}));

// Mock messages
jest.mock('./messages', () => ({
  'authz.anchor.button.alt': {
    id: 'authz.anchor.button.alt',
    defaultMessage: 'Scroll to top',
  },
}));

describe('AnchorButton', () => {
  it('renders without crashing', () => {
    render(<AnchorButton />);
  });

  it('does not display button initially', () => {
    const { container } = render(<AnchorButton />);
    expect(container.firstChild).toBeNull();
  });
});
