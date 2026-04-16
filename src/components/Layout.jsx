import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const shouldHideFooter = location.pathname.startsWith('/messages') || location.pathname.startsWith('/admin');

  return (
    <div className="font-sans text-gray-300 bg-dark-900 antialiased selection:bg-gold selection:text-dark-900 min-h-screen flex flex-col">
      <Navbar />
      <main className={`grow flex flex-col ${shouldHideFooter ? 'h-screen overflow-hidden' : ''}`}>
        <Outlet />
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

export default Layout;
