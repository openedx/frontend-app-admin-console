import React from 'react';
import { Hyperlink, Icon } from '@openedx/paragon';

interface ViewMoreLinkProps {
  label: string;
  onClick: () => void;
  iconSrc?: React.ComponentType | undefined;
}

const ViewMoreLink = ({ label, onClick, iconSrc }: ViewMoreLinkProps) => (
  <Hyperlink
    destination={undefined}
    onClick={e => {
      e.preventDefault();
      onClick();
    }}
  >
    {label}
    {iconSrc && (
      <Icon
        src={iconSrc}
      />
    )}
  </Hyperlink>
);

export default ViewMoreLink;
