import { useEffect, useId, useRef, useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Icon, IconButton, Overlay, Popover } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import type { Category, Permission } from '@src/authz-module/catalog';
import messages from './messages';

const HIDE_DELAY_MS = 150;

// A fixed-size icon keeps the inline button compact so the category row does not grow.
const CategoryInfoIcon = () => <Icon src={Info} size="sm" />;

interface CategoryTooltipProps {
  category: Category;
  permissions: Permission[];
}

const CategoryTooltip = ({ category, permissions }: CategoryTooltipProps) => {
  const { formatMessage } = useIntl();
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hideTimeout = useRef<number>();
  const isHovered = useRef(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        window.clearTimeout(hideTimeout.current);
        isHovered.current = false;
        setShow(false);
      }
    };

    if (show) document.addEventListener('keydown', dismissOnEscape);
    return () => {
      window.clearTimeout(hideTimeout.current);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  }, [show]);

  const open = () => {
    window.clearTimeout(hideTimeout.current);
    setShow(true);
  };

  const scheduleHide = () => {
    window.clearTimeout(hideTimeout.current);
    // Allow the pointer to cross the gap between the trigger and the popover.
    hideTimeout.current = window.setTimeout(() => {
      if (!isHovered.current && document.activeElement !== triggerRef.current) {
        setShow(false);
      }
    }, HIDE_DELAY_MS);
  };

  const startHover = () => {
    isHovered.current = true;
    open();
  };

  const endHover = () => {
    isHovered.current = false;
    scheduleHide();
  };

  return (
    <>
      <span className="micro ml-2 my-auto">
        <IconButton
          ref={triggerRef}
          alt={formatMessage(messages['authz.category.permissions.info.label'], { categoryName: category.displayName })}
          iconAs={CategoryInfoIcon}
          size="inline"
          variant="secondary"
          onFocus={open}
          onBlur={scheduleHide}
          onMouseEnter={startHover}
          onMouseLeave={endHover}
        />
      </span>
      <Overlay target={triggerRef} show={show} placement="auto" flip>
        <Popover id={tooltipId} onMouseEnter={startHover} onMouseLeave={endHover}>
          <Popover.Content className="p-3">
            <h4 className="text-primary">{category.displayName}</h4>
            <p className="small">{category.description}</p>
            <ul className="small">
              {permissions.map(permission => (
                <li key={permission.id}><b>{permission.displayName}:</b> {permission.description}</li>
              ))}
            </ul>
          </Popover.Content>
        </Popover>
      </Overlay>
    </>
  );
};

export default CategoryTooltip;
