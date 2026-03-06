import React from 'react';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import About from '../components/About';
import Academic from '../components/Academic';
import PerformancePreview from '../components/PerformancePreview';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';

const Home = () => {
  return (
    <>
      <SEO title="Dr. Yirui Li, Harpist & Educator | Houston, Texas" url="/" />
      <Hero />
      <About />
      <Academic />
      <PerformancePreview />
      <FAQ />
      <Contact />
    </>
  );
};

export default Home;
