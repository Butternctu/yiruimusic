import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import imgOrchestral from '../assets/orchestral-001.jpeg';
import imgTeaching from '../assets/teaching-001.jpeg';
import imgRecitals from '../assets/recitals-001.jpeg';
import imgGig from '../assets/gig-001.jpeg';

const PerformancePreview = () => {
  useIntersectionObserver();

  return (
    <section id="performance" className="py-32 bg-dark-900 relative">
      <div className="absolute inset-0 luxury-lines z-0 opacity-30"></div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        <div className="flex flex-col md:flex-row justify-between items-end mb-20 fade-in-section">
          <div className="max-w-2xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-px bg-gold mr-4"></div>
              <h3 className="text-gold uppercase tracking-[0.2em] text-xs">Global Vision</h3>
            </div>
            <h2 className="font-serif text-4xl text-white mb-6 tracking-wide">Performance Portfolio</h2>
            <p className="text-gray-400 font-light leading-relaxed">
              Dr. Li's expansive repertoire spans canonical masterworks such as Berlioz's <em>Symphonie Fantastique</em> and Holst's <em>The Planets</em>, alongside contemporary gems. She actively bridges traditions, participating in the World Harp Congress and serving as a certified instructor with the China Orchestra Network.
            </p>
          </div>
          <div className="mt-8 md:mt-0 flex flex-row gap-3 sm:gap-6 items-center">
            <Link to="/portfolio" className="flex items-center justify-between bg-transparent text-white border border-white/20 px-3 sm:px-6 py-3 sm:py-4 w-40 sm:w-56 hover:border-[#C69C5C] hover:text-[#C69C5C] transition-all duration-300 group rounded-[2px]">
              <div className="flex flex-col items-start leading-tight tracking-[0.15em] font-medium text-[0.6rem] sm:text-xs">
                <span>EXPLORE</span>
                <span>PORTFOLIO</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
            </Link>

            <Link to="/repertoire" className="flex items-center justify-between bg-transparent text-gold border border-gold px-3 sm:px-6 py-3 sm:py-4 w-40 sm:w-56 hover:bg-gold hover:text-dark-900 transition-all duration-300 group rounded-[2px]">
              <div className="flex flex-col items-start leading-tight tracking-[0.15em] font-medium text-[0.6rem] sm:text-xs">
                <span>VIEW</span>
                <span>PROGRAMS</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="aspect-4/5 bg-dark-800 relative overflow-hidden group fade-in-gentle">
            <img
              src={imgOrchestral}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-left opacity-75 group-hover:opacity-100 group-hover:scale-105 origin-left transition-all duration-1000"
              alt="Dr. Yirui Li Orchestral Engagements"
            />
            <div className="absolute inset-0 bg-linear-to-t from-dark-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
              <div className="w-6 sm:w-8 h-px bg-gold mb-2 sm:mb-3 opacity-0 group-hover:opacity-100 transition-opacity delay-300"></div>
              <span className="block font-serif text-base sm:text-xl text-white tracking-wide">Orchestral</span>
            </div>
          </div>

          <div className="aspect-4/5 bg-dark-800 relative overflow-hidden group fade-in-gentle">
            <img
              src={imgTeaching}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-[center_25%] opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
              alt="Dr. Yirui Li Masterclasses"
            />
            <div className="absolute inset-0 bg-linear-to-t from-dark-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
              <div className="w-6 sm:w-8 h-px bg-gold mb-2 sm:mb-3 opacity-0 group-hover:opacity-100 transition-opacity delay-300"></div>
              <span className="block font-serif text-base sm:text-xl text-white tracking-wide">Mentorship</span>
            </div>
          </div>

          <div className="aspect-4/5 bg-dark-800 relative overflow-hidden group fade-in-gentle">
            <img
              src={imgRecitals}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-[center_20%] scale-125 opacity-75 group-hover:opacity-100 group-hover:scale-[1.3] transition-all duration-1000"
              alt="Dr. Yirui Li Solo Recitals"
            />
            <div className="absolute inset-0 bg-linear-to-t from-dark-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
              <div className="w-6 sm:w-8 h-px bg-gold mb-2 sm:mb-3 opacity-0 group-hover:opacity-100 transition-opacity delay-300"></div>
              <span className="block font-serif text-base sm:text-xl text-white tracking-wide">Solo Recitals</span>
            </div>
          </div>

          <div className="aspect-4/5 bg-dark-800 relative overflow-hidden group fade-in-gentle">
            <img
              src={imgGig}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-[center_25%] opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
              alt="Dr. Yirui Li Private Engagements"
            />
            <div className="absolute inset-0 bg-linear-to-t from-dark-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
              <div className="w-6 sm:w-8 h-px bg-gold mb-2 sm:mb-3 opacity-0 group-hover:opacity-100 transition-opacity delay-300"></div>
              <span className="block font-serif text-base sm:text-xl text-white tracking-wide">Private Engagements</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerformancePreview;
