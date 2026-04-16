import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const authPaths = ['/dashboard', '/booking', '/appointments', '/profile', '/messages', '/admin'];
  const shouldHideFooter = authPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="font-sans text-gray-300 bg-dark-900 antialiased selection:bg-gold selection:text-dark-900 min-h-screen flex flex-col">
      <Navbar />
      <main className={`grow flex flex-col ${shouldHideFooter ? 'h-screen h-[100dvh] overflow-hidden' : ''}`}>
        <Outlet />
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

export default Layout;
