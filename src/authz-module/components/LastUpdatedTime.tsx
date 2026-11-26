import { useIntl } from '@openedx/frontend-base';

interface LastUpdatedTimeProps {
  updatedAt: string | null;
}

/** Localized update date and time, or "-" when there is none. */
const LastUpdatedTime = ({ updatedAt }: LastUpdatedTimeProps) => {
  const { formatDate } = useIntl();

  if (!updatedAt) return <span>-</span>;

  return (
    <time dateTime={updatedAt}>
      {formatDate(updatedAt, {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
      })}
    </time>
  );
};

export default LastUpdatedTime;
