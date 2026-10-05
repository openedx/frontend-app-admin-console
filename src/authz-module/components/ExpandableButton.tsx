import { Button } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';

interface ExpandableButtonProps {
  label: string;
  onClick: () => void;
  isExpanded: boolean;
}

/**
 * Link-styled trigger that expands something in place: a table row, a list of items.
 *
 * A real `<button>` rather than an anchor — it navigates nowhere, and an anchor with no
 * `href` is neither focusable nor activatable from the keyboard. `size="inline"` drops the
 * button padding so it keeps sitting on the text baseline inside a table cell.
 *
 * `isExpanded` drives both halves of the state report, which have to agree: the chevron
 * for sighted users and `aria-expanded` for a screen reader.
 */
const ExpandableButton = ({ label, onClick, isExpanded }: ExpandableButtonProps) => (
  <Button
    variant="link"
    size="inline"
    onClick={onClick}
    iconAfter={isExpanded ? ExpandLess : ExpandMore}
    aria-expanded={isExpanded}
  >
    {label}
  </Button>
);

export default ExpandableButton;
