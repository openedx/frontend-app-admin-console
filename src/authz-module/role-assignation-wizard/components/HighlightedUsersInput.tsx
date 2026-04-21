import {
  useMemo, useRef, useCallback, forwardRef,
} from 'react';

interface HighlightedUsersInputProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  invalidUsers: string[];
  placeholder?: string;
  hasError?: boolean;
  ariaDescribedBy?: string;
}

const HighlightedUsersInput = forwardRef<HTMLTextAreaElement, HighlightedUsersInputProps>(({
  id, value, onChange, invalidUsers, placeholder, hasError = false, ariaDescribedBy,
}, ref) => {
  const overlayRef = useRef<HTMLDivElement>(null);

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
        <span
          key={`part-${key}`}
          data-invalid={isInvalid || undefined}
          className={isInvalid ? 'text-danger' : ''}
        >
          {part}
        </span>
      );
    });
  }, [value, invalidSet, hasHighlights]);

  const handleScroll = useCallback((e: { currentTarget: HTMLTextAreaElement }) => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  }, []);

  return (
    <div className="position-relative">
      {/* Highlight layer — sits behind the transparent textarea */}
      {hasHighlights && (
        <div
          ref={overlayRef}
          aria-hidden="true"
          className="highlighted-users-input__overlay highlighted-users-input__layer"
        >
          {renderedParts}
        </div>
      )}

      {/* Actual textarea — text is transparent when overlay is active */}
      <textarea
        ref={ref}
        id={id}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder={hasHighlights ? undefined : placeholder}
        aria-invalid={hasError || undefined}
        aria-describedby={ariaDescribedBy}
        aria-required
        className={[
          'form-control',
          'highlighted-users-input__textarea',
          'highlighted-users-input__layer',
          hasHighlights && 'highlighted-users-input__textarea--highlighted',
          hasError && 'is-invalid',
        ].filter(Boolean).join(' ')}
      />
    </div>
  );
});

HighlightedUsersInput.displayName = 'HighlightedUsersInput';

export default HighlightedUsersInput;
