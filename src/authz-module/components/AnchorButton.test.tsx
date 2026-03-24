import React from 'react';
import { renderWrapper } from '@src/setupTest';
import AnchorButton from './AnchorButton';

describe('AnchorButton', () => {
  it('renders without crashing', () => {
    renderWrapper(<AnchorButton />);
  });

  it('does not display button initially', () => {
    const { container } = renderWrapper(<AnchorButton />);
    expect(container.firstChild).toBeNull();
  });
});
