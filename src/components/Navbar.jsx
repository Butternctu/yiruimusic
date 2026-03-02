import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import yiruiLogo from '../assets/yirui_logo.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleMobileLinkClick = (e, targetId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    // Match the 300ms delay from the original index.html script
    setTimeout(() => {
      if (targetId === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 300);
  };

  const navClass = `fixed w-full z-50 transition-all duration-300 py-2 border-b ${
    isScrolled ? 'bg-dark-900/95 backdrop-blur-md border-white/10' : 'bg-transparent border-white/5'
  }`;

  return (
    <>
      <header id="main-nav" className={navClass}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <a href="/#" className="flex items-center scroll-link">
            <div 
              className={`bg-gold transition-all duration-300 ${isScrolled ? 'h-12 md:h-16 w-32 md:w-40' : 'h-20 md:h-24 w-48 md:w-56'}`}
              style={{ 
                WebkitMaskImage: `url(${yiruiLogo})`,
                maskImage: `url(${yiruiLogo})`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'left center',
                maskPosition: 'left center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain'
              }}
              aria-label="Dr. Yirui Li Logo"
            />
          </a>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-10 text-xs uppercase tracking-[0.2em] text-gray-300">
            <a href="/#about" className="hover:text-gold transition-colors duration-300">About</a>
            <a href="/#teaching" className="hover:text-gold transition-colors duration-300">Academic</a>
            <a href="/#performance" className="hover:text-gold transition-colors duration-300">Performance</a>
            <a href="/#contact" className="hover:text-gold transition-colors duration-300">Contact</a>
          </nav>

          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-300 hover:text-gold focus:outline-none transition-colors relative z-50"
          >
            <span id="menu-icon-wrapper">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        onClick={(e) => {
          if (e.target.id === 'mobile-menu' || e.target.id === 'mobile-menu-inner') {
            closeMobileMenu();
          }
        }}
        className={`fixed inset-0 bg-dark-900/30 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-opacity duration-500 will-change-opacity ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div id="mobile-menu-inner" className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          <nav className="flex flex-col items-center space-y-8 text-sm uppercase tracking-[0.3em] text-gray-300">
            <a href="#about" onClick={(e) => handleMobileLinkClick(e, '#about')} className="hover:text-gold transition-colors duration-300">About</a>
            <a href="#teaching" onClick={(e) => handleMobileLinkClick(e, '#teaching')} className="hover:text-gold transition-colors duration-300">Academic</a>
            <a href="#performance" onClick={(e) => handleMobileLinkClick(e, '#performance')} className="hover:text-gold transition-colors duration-300">Performance</a>
            <a href="#contact" onClick={(e) => handleMobileLinkClick(e, '#contact')} className="hover:text-gold transition-colors duration-300">Contact</a>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
