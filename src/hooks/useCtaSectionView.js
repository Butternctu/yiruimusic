import { useEffect, useRef } from 'react';
import { trackCtaSectionConversion, trackEvent } from '../lib/gtag.js';

// Fires once when a CTA section (e.g. pricing) enters the viewport. Easier to
// debug than lead-form conversions because any scroll-down triggers it.
export function useCtaSectionView(sectionName) {
  const sectionRef = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || firedRef.current) return;
          firedRef.current = true;

          trackEvent('view_cta_section', { section: sectionName });
          trackCtaSectionConversion({ section: sectionName });
          observer.disconnect();
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionName]);

  return sectionRef;
}
