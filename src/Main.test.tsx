import { waitFor } from '@testing-library/react';
import { renderWrapper, initializeMocks } from '@src/testUtils';
import Main from './Main';

jest.mock('./authz-module', () => ({
  __esModule: true,
  default: () => <div data-testid="authz-module" />,
}));

describe('Main', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('sets the document title from the page-title message and site name', async () => {
    renderWrapper(<Main />);
    await waitFor(() => {
      expect(document.title).toBe('Admin Console | Admin Console Test Site');
    });
  });

  it('renders the AuthZ module inside the page', () => {
    const { getByTestId } = renderWrapper(<Main />);
    expect(getByTestId('authz-module')).toBeInTheDocument();
  });
});
