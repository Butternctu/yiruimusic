import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../lib/gtag.js';

const THRESHOLDS = [25, 50, 75, 90];

// The contact form sits at the bottom of a long single-page layout, so scroll
// depth is the only way to tell a visitor who bounced immediately from one who
// read the whole page and still did not get in touch.
export const useScrollDepth = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const reached = new Set();
    let frame = null;

    const measure = () => {
      frame = null;

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const percent = (window.scrollY / scrollable) * 100;

      THRESHOLDS.forEach((threshold) => {
        if (percent >= threshold && !reached.has(threshold)) {
          reached.add(threshold);
          trackEvent('scroll_depth', {
            percent_scrolled: threshold,
            page_path: pathname,
          });
        }
      });
    };

    const handleScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);
};
