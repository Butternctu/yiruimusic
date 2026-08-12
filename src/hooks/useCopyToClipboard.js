import { useState, useRef, useEffect } from 'react';

// Copies a value and reports a short-lived "copied" flag so callers can swap
// the label for confirmation feedback.
export const useCopyToClipboard = (value, resetDelay = 2000) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), resetDelay);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return { copied, copy };
};
