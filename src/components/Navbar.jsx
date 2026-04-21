import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogIn, User, LayoutDashboard, Calendar, Settings, LogOut, Shield, MessageSquare } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import yiruiLogo from '../assets/yirui_logo.webp';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { isAuthenticated, isAdmin, user, userProfile, logout, hasUnreadMessages } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleHashLinkClick = (e, targetPath) => {
    const isHashLink = targetPath.includes('#');

    if (isHashLink) {
      const [path, hash] = targetPath.split('#');
      const normalizedPath = path || '/';
      const isSamePage = location.pathname === normalizedPath || (location.pathname === '/' && normalizedPath === '/');

      setIsMobileMenuOpen(false);

      if (isSamePage) {
        e.preventDefault();
        const targetId = hash ? `#${hash}` : '#';

        // Use a small delay to ensure any layout shifts or menu closures complete
        setTimeout(() => {
          if (targetId === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              const navbarHeight = 80;
              const elementPosition = targetElement.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.scrollY - navbarHeight;

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }
        }, 100);
      }
    }
  };

  const handleLogoClick = (e) => {
    setIsMobileMenuOpen(false);
    const isHomepage = window.location.pathname === '/' || window.location.pathname === '';
    if (isHomepage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const getInitials = () => {
    const name = userProfile?.displayName || user?.displayName || 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <header id="main-nav" className={`fixed w-full z-110 transition-all duration-300 py-2 border-b ${isScrolled ? 'bg-dark-900/95 backdrop-blur-md border-white/10' : 'bg-transparent border-white/5'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link to="/" onClick={handleLogoClick} className="flex items-center scroll-link">
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
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-10 text-xs uppercase tracking-[0.2em] text-gray-300">
            <Link to="/#about" onClick={(e) => handleHashLinkClick(e, '/#about')} className="hover:text-gold transition-colors duration-300">About</Link>
            <Link to="/#teaching" onClick={(e) => handleHashLinkClick(e, '/#teaching')} className="hover:text-gold transition-colors duration-300">Academic</Link>
            <Link to="/#performance" onClick={(e) => handleHashLinkClick(e, '/#performance')} className="hover:text-gold transition-colors duration-300">Performance</Link>
            <Link to="/repertoire" onClick={closeMobileMenu} className="hover:text-gold transition-colors duration-300">Programs</Link>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-9 h-9 rounded-full bg-linear-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center hover:border-gold/60 transition-all duration-300 relative"
                >
                  <span className="text-gold text-[11px] font-medium tracking-normal leading-none">{getInitials()}</span>
                  {hasUnreadMessages && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#d9736c] border border-dark-900 rounded-full animate-pulse" />
                  )}
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 top-full mt-3 w-52 bg-dark-800 border border-white/10 shadow-2xl transition-all duration-300 rounded-sm overflow-hidden ${isUserMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    }`}
                >
                  <div className="px-5 py-3 border-b border-white/6">
                    <p className="text-white text-sm truncate">{userProfile?.displayName || user?.displayName}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-5 py-2.5 text-gray-300 hover:text-gold hover:bg-white/3 transition-colors text-xs tracking-wider relative group/item">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/appointments" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-5 py-2.5 text-gray-300 hover:text-gold hover:bg-white/3 transition-colors text-xs tracking-wider">
                      <Calendar className="w-4 h-4" />
                      <span>My Appointments</span>
                    </Link>
                    <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-5 py-2.5 text-gray-300 hover:text-gold hover:bg-white/3 transition-colors text-xs tracking-wider">
                      <Settings className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    {!isAdmin && (
                      <Link to="/messages" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-5 py-2.5 text-gray-300 hover:text-gold hover:bg-white/3 transition-colors text-xs tracking-wider relative group/item">
                        <MessageSquare className="w-4 h-4" />
                        <span>Message Dr. Li</span>
                        {hasUnreadMessages && (
                          <span className="absolute right-4 w-1.5 h-1.5 bg-gold rounded-full" />
                        )}
                      </Link>
                    )}
                    {isAdmin && (
                      <>
                        <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-5 py-2.5 text-gold/70 hover:text-gold hover:bg-white/3 transition-colors text-xs tracking-wider">
                          <Shield className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                        <Link to="/admin/messages" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-5 py-2.5 text-gold/70 hover:text-gold hover:bg-white/3 transition-colors text-xs tracking-wider relative group/item">
                          <MessageSquare className="w-4 h-4" />
                          <span>Inbox</span>
                          {hasUnreadMessages && (
                            <span className="absolute right-4 w-1.5 h-1.5 bg-gold rounded-full" />
                          )}
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="border-t border-white/6 py-1">
                    <button onClick={handleLogout} className="flex items-center space-x-3 px-5 py-2.5 text-gray-400 hover:text-[#d9736c] hover:bg-white/3 transition-colors text-xs tracking-wider w-full text-left">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 text-gray-400 hover:text-gold transition-colors duration-300"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}

            {/* Contact CTA */}
            {!isAuthenticated && (
              <Link to="/#contact" onClick={(e) => handleHashLinkClick(e, '/#contact')} className="text-gold border border-gold/50 px-4 py-2 hover:bg-gold hover:text-dark-900 transition-all duration-300 rounded-sm">Contact</Link>
            )}
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
      <div
        id="mobile-menu"
        onClick={(e) => {
          if (e.target.id === 'mobile-menu' || e.target.id === 'mobile-menu-inner') {
            closeMobileMenu();
          }
        }}
        className={`fixed inset-0 bg-dark-900/40 backdrop-blur-xl z-100 flex flex-col items-center justify-center transition-all duration-500 will-change-opacity ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
          }`}
      >
        <div id="mobile-menu-inner" className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          <nav className="flex flex-col items-center space-y-8 text-sm uppercase tracking-[0.3em] text-gray-300">
            <Link to="/#about" onClick={(e) => handleHashLinkClick(e, '/#about')} className="hover:text-gold transition-colors duration-300 px-8 py-2">About</Link>
            <Link to="/#teaching" onClick={(e) => handleHashLinkClick(e, '/#teaching')} className="hover:text-gold transition-colors duration-300 px-8 py-2">Academic</Link>
            <Link to="/#performance" onClick={(e) => handleHashLinkClick(e, '/#performance')} className="hover:text-gold transition-colors duration-300 px-8 py-2">Performance</Link>
            <Link to="/repertoire" onClick={closeMobileMenu} className="hover:text-gold transition-colors duration-300 px-8 py-2">Programs</Link>

            {/* Mobile Auth */}
            <div className="w-full border-t border-white/6 pt-8 flex flex-col items-center space-y-8">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={closeMobileMenu} className="hover:text-gold transition-colors duration-300 px-8 py-2">Dashboard</Link>
                  <Link to="/appointments" onClick={closeMobileMenu} className="hover:text-gold transition-colors duration-300 px-8 py-2">Appointments</Link>
                  {isAdmin && (
                    <>
                      <Link to="/admin" onClick={closeMobileMenu} className="text-gold/70 hover:text-gold transition-colors duration-300 px-8 py-2">Admin</Link>
                      <Link to="/admin/messages" onClick={closeMobileMenu} className="text-gold/70 hover:text-gold transition-colors duration-300 px-8 py-2 relative flex items-center">
                        <span>Inbox</span>
                        {hasUnreadMessages && (
                          <span className="ml-2 w-1.5 h-1.5 bg-gold rounded-full" />
                        )}
                      </Link>
                    </>
                  )}
                  {!isAdmin && (
                    <Link to="/messages" onClick={closeMobileMenu} className="hover:text-gold transition-colors duration-300 px-8 py-2 relative flex items-center">
                      <span>Message Dr. Li</span>
                      {hasUnreadMessages && (
                        <span className="ml-2 w-1.5 h-1.5 bg-gold rounded-full" />
                      )}
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-gray-400 hover:text-[#d9736c] transition-colors duration-300 px-8 py-2 uppercase tracking-[0.3em] text-sm">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={closeMobileMenu} className="flex items-center space-x-2 hover:text-gold transition-colors duration-300 px-8 py-2">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile Contact Button */}
              {!isAuthenticated && (
                <Link to="/#contact" onClick={(e) => handleHashLinkClick(e, '/#contact')} className="text-gold border border-gold/50 px-8 py-3 hover:bg-gold hover:text-dark-900 transition-all duration-300 rounded-sm mt-4 w-4/5 text-center">Contact</Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
