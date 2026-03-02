import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Academic from '../components/Academic';
import PerformancePreview from '../components/PerformancePreview';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="font-sans text-gray-300 bg-dark-900 antialiased selection:bg-gold selection:text-dark-900">
      <Navbar />
      <Hero />
      <About />
      <Academic />
      <PerformancePreview />
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;
