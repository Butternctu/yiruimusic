import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AUTH_PATHS = ['/dashboard', '/booking', '/appointments', '/profile', '/messages', '/admin'];

// Pricing and the inquiry form both sit far down a long single page, so on
// phones a visitor who does not keep scrolling never reaches either. This keeps
// them reachable once past the hero, and steps out of the way when the form
// itself is on screen.
const MobileContactBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isPastHero, setIsPastHero] = useState(false);
  const [isFormInView, setIsFormInView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsPastHero(window.scrollY > window.innerHeight * 0.6);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsFormInView(false);

    const form = document.querySelector('#contact');
    if (!form) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsFormInView(entry.isIntersecting),
      { threshold: 0.1 },
    );

    observer.observe(form);
    return () => observer.disconnect();
  }, [location.pathname]);

  const isOnMemberPage = AUTH_PATHS.some((path) => location.pathname.startsWith(path));
  if (isAuthenticated || isOnMemberPage) return null;

  // Sections only exist on the home page; elsewhere fall back to routing there
  // and let ScrollToHash finish the job.
  const goToSection = (id) => {
    const section = document.querySelector(`#${id}`);
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      navigate(`/#${id}`);
    }
  };

  const handlePricing = () => {
    goToSection('pricing');
  };

  const handleInquire = () => {
    goToSection('contact');
  };

  const isVisible = isPastHero && !isFormInView;

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-90 flex border-t border-gold/20 bg-dark-900/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <button
        onClick={handlePricing}
        className="flex-1 flex items-center justify-center space-x-2 py-4 text-gray-300 text-[11px] uppercase tracking-[0.2em] border-r border-white/10 active:bg-white/5"
      >
        <Tag className="w-4 h-4 text-gold/70" />
        <span>View Pricing</span>
      </button>

      <button
        onClick={handleInquire}
        className="flex-1 flex items-center justify-center space-x-2 py-4 bg-gold/10 text-gold text-[11px] uppercase tracking-[0.2em] active:bg-gold/20"
      >
        <Send className="w-4 h-4" />
        <span>Send an Inquiry</span>
      </button>
    </div>
  );
};

export default MobileContactBar;
