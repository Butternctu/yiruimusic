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

  const navClass = `fixed w-full z-50 transition-all duration-300 py-2 border-b ${
    isScrolled ? 'bg-dark-900/95 backdrop-blur-md border-white/10' : 'bg-transparent border-white/5'
  }`;

  return (
    <>
      <header className={navClass}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <a href="/#" className="flex items-center scroll-link">
            <img
              src={yiruiLogo}
              alt="Dr. Yirui Li Logo"
              className={`w-auto object-contain transition-all duration-300 ${isScrolled ? 'h-12 md:h-16' : 'h-20 md:h-24'}`}
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
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-dark-900/98 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-opacity duration-500 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col items-center space-y-8 text-sm uppercase tracking-[0.3em] text-gray-300">
          <a href="/#about" onClick={closeMobileMenu} className="hover:text-gold transition-colors duration-300">About</a>
          <a href="/#teaching" onClick={closeMobileMenu} className="hover:text-gold transition-colors duration-300">Academic</a>
          <a href="/#performance" onClick={closeMobileMenu} className="hover:text-gold transition-colors duration-300">Performance</a>
          <a href="/#contact" onClick={closeMobileMenu} className="hover:text-gold transition-colors duration-300">Contact</a>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
