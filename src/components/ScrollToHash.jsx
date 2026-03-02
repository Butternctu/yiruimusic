import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Slight delay ensures DOM is fully painted
    } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); // Scroll to top on normal route change
    }
  }, [hash, pathname]);

  return null;
};

export default ScrollToHash;
