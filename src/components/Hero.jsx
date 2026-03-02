import React, { useEffect, useState } from 'react';
import yiruiCover from '../assets/yirui_cover.jpg';

const Hero = () => {
  useEffect(() => {
    let lastWidth = window.innerWidth;
    
    const updateVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== lastWidth) {
        updateVh();
        lastWidth = currentWidth;
      }
    };

    updateVh();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section 
      className="relative hero-section flex items-center justify-center bg-parallax"
      style={{ backgroundImage: `url(${yiruiCover})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-dark-900/60 to-dark-900"></div>
      <div className="absolute inset-0 luxury-lines z-0"></div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto fade-in-section is-visible w-full">
        <h2 className="text-gold text-xs md:text-sm uppercase tracking-[0.4em] mb-6">
          Harpist &bull; Educator &bull; Innovator
        </h2>
        <h1 className="font-serif text-5xl md:text-7xl text-white mb-8 leading-tight tracking-wide">
          Bridging Tradition <br /><span className="italic font-light text-gray-400">&amp;</span> Innovation
        </h1>
        <p className="text-gray-400 text-lg font-light leading-relaxed max-w-2xl mx-auto mb-12">
          Cultivating cross-cultural dialogue and empowering the next generation of classical musicians through the resonant artistry of the harp.
        </p>
        <a 
          href="#contact" 
          className="inline-block border border-gold text-gold hover:bg-gold hover:text-dark-900 px-10 py-4 tracking-[0.2em] uppercase text-xs transition-all duration-500 scroll-link"
        >
          Book a Performance
        </a>
      </div>

      <div className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none scroll-indicator">
        <div className="h-16 md:h-20 w-[1px] bg-gradient-to-b from-gold to-transparent mx-auto"></div>
      </div>
    </section>
  );
};

export default Hero;
