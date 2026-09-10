import React from 'react';
import { Button } from '@openedx/paragon';

interface ViewMoreLinkProps {
  label: string;
  onClick: () => void;
  iconSrc?: React.ComponentType | undefined;
}

/**
 * Link-styled trigger for an in-place action: expanding a row, revealing more items.
 *
 * A real `<button>` rather than an anchor — it navigates nowhere, and an anchor with no
 * `href` is neither focusable nor activatable from the keyboard. `size="inline"` drops the
 * button padding so it keeps sitting on the text baseline inside a table cell.
 */
const ViewMoreLink = ({ label, onClick, iconSrc }: ViewMoreLinkProps) => (
  <Button variant="link" size="inline" onClick={onClick} iconAfter={iconSrc}>
    {label}
  </Button>
);

export default ViewMoreLink;
