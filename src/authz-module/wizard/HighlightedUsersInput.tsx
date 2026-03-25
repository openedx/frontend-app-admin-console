import { useMemo } from 'react';

// Shared styles between overlay and textarea to keep text positions in sync
const INPUT_STYLE: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '1rem',
  lineHeight: '1.5',
  padding: '0.375rem 0.75rem',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  boxSizing: 'border-box',
  width: '100%',
};

interface HighlightedUsersInputProps {
  value: string;
  onChange: (val: string) => void;
  invalidUsers: string[];
  placeholder?: string;
  hasNetworkError?: boolean;
}

const HighlightedUsersInput = ({
  value, onChange, invalidUsers, placeholder, hasNetworkError = false,
}: HighlightedUsersInputProps) => {
  const invalidSet = useMemo(
    () => new Set(invalidUsers.map((u) => u.trim())),
    [invalidUsers],
  );
  const hasHighlights = invalidSet.size > 0;

  const renderedParts = useMemo(() => {
    if (!hasHighlights) { return null; }
    let offset = 0;
    return value.split(/(,)/).map((part) => {
      const key = offset;
      offset += part.length;
      if (part === ',') { return <span key={`comma-${key}`}>,</span>; }
      const trimmed = part.trim();
      const isInvalid = trimmed.length > 0 && invalidSet.has(trimmed);
      return (
        <span key={`part-${key}`} style={{ color: isInvalid ? '#c62828' : '#212529' }}>
          {part}
        </span>
      );
    });
  }, [value, invalidSet, hasHighlights]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Highlight layer — sits behind the transparent textarea */}
      {hasHighlights && (
        <div
          aria-hidden="true"
          style={{
            ...INPUT_STYLE,
            position: 'absolute',
            inset: 0,
            background: '#fff',
            border: '1px solid transparent',
            borderRadius: '0.25rem',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {renderedParts}
        </div>
      )}

      {/* Actual textarea — text is transparent when overlay is active */}
      <textarea
        id="users-input"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={hasHighlights ? undefined : placeholder}
        className={`form-control${hasNetworkError ? ' is-invalid' : ''}`}
        style={{
          ...INPUT_STYLE,
          position: 'relative',
          zIndex: 1,
          color: hasHighlights ? 'transparent' : undefined,
          caretColor: '#212529',
          background: hasHighlights ? 'transparent' : undefined,
          resize: 'vertical',
          display: 'block',
          minHeight: '100px',
        }}
      />
    </div>
  );
};

export default HighlightedUsersInput;
