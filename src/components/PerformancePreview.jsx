import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const PerformancePreview = () => {
  useIntersectionObserver();

  return (
    <section id="performance" className="py-32 bg-dark-900 relative">
      <div className="absolute inset-0 luxury-lines z-0 opacity-30"></div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 fade-in-section">
          <div className="max-w-2xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-[1px] bg-gold mr-4"></div>
              <h3 className="text-gold uppercase tracking-[0.2em] text-xs">Global Vision</h3>
            </div>
            <h2 className="font-serif text-4xl text-white mb-6 tracking-wide">Performance Portfolio</h2>
            <p className="text-gray-400 font-light leading-relaxed">
              Dr. Li's expansive repertoire spans canonical masterworks such as Berlioz's <em>Symphonie Fantastique</em> and Holst's <em>The Planets</em>, alongside contemporary gems. She actively bridges traditions, participating in the World Harp Congress and serving as a certified instructor with the China Orchestra Network.
            </p>
          </div>
          <div className="mt-8 md:mt-0">
            <Link to="/portfolio" className="inline-flex items-center text-white text-sm uppercase tracking-[0.1em] hover:text-gold transition-colors group">
              View All Projects
              <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-in-section">
          <div className="aspect-[4/5] bg-dark-800 relative overflow-hidden group">
            <img 
              src="/assets/orchestral-001.jpeg" 
              decoding="async" 
              className="absolute inset-0 w-full h-full object-cover object-left opacity-75 group-hover:opacity-100 group-hover:scale-105 origin-left transition-all duration-1000" 
              alt="Dr. Yirui Li Orchestral Engagements" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
              <div className="w-6 sm:w-8 h-[1px] bg-gold mb-2 sm:mb-3 opacity-0 group-hover:opacity-100 transition-opacity delay-300"></div>
              <span className="block font-serif text-base sm:text-xl text-white tracking-wide">Orchestral</span>
            </div>
          </div>
          
          <div className="aspect-[4/5] bg-dark-800 relative overflow-hidden group">
            <img 
              src="/assets/teaching-001.jpeg" 
              decoding="async" 
              className="absolute inset-0 w-full h-full object-cover object-[center_25%] opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" 
              alt="Dr. Yirui Li Masterclasses" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
              <div className="w-6 sm:w-8 h-[1px] bg-gold mb-2 sm:mb-3 opacity-0 group-hover:opacity-100 transition-opacity delay-300"></div>
              <span className="block font-serif text-base sm:text-xl text-white tracking-wide">Mentorship</span>
            </div>
          </div>
          
          <div className="aspect-[4/5] bg-dark-800 relative overflow-hidden group">
            <img 
              src="/assets/recitals-001.jpeg" 
              decoding="async" 
              className="absolute inset-0 w-full h-full object-cover object-[center_20%] scale-125 opacity-75 group-hover:opacity-100 group-hover:scale-[1.3] transition-all duration-1000" 
              alt="Dr. Yirui Li Solo Recitals" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
              <div className="w-6 sm:w-8 h-[1px] bg-gold mb-2 sm:mb-3 opacity-0 group-hover:opacity-100 transition-opacity delay-300"></div>
              <span className="block font-serif text-base sm:text-xl text-white tracking-wide">Solo Recitals</span>
            </div>
          </div>
          
          <div className="aspect-[4/5] bg-dark-800 relative overflow-hidden group">
            <img 
              src="/assets/gig-001.jpeg" 
              decoding="async" 
              className="absolute inset-0 w-full h-full object-cover object-[center_25%] opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" 
              alt="Dr. Yirui Li Private Engagements" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
              <div className="w-6 sm:w-8 h-[1px] bg-gold mb-2 sm:mb-3 opacity-0 group-hover:opacity-100 transition-opacity delay-300"></div>
              <span className="block font-serif text-base sm:text-xl text-white tracking-wide">Private Engagements</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerformancePreview;
