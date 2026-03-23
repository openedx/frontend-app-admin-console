import { useIntl } from '@edx/frontend-platform/i18n';
import { ArrowUpward } from '@openedx/paragon/icons';
import { IconButton } from '@openedx/paragon';
import { useState, useEffect } from 'react';
import messages from './messages';

const AnchorButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const intl = useIntl();
  const scrollToTopButton = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <IconButton
      isActive
      src={ArrowUpward}
      alt={intl.formatMessage(messages['authz.anchor.button.alt'])}
      onClick={scrollToTopButton}
      variant="primary"
      className="mr-2 mb-2 fixed-bottom float-right"
      style={{
        bottom: '20px',
        left: 'calc(100% - 70px)',
      }}
    />
  );
};

export default AnchorButton;
