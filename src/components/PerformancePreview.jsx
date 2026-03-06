import React, { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import imgOrchestral from '../assets/orchestral-001.webp';
import imgOrchestralSm from '../assets/orchestral-001-sm.webp';
import imgTeaching from '../assets/teaching-001.webp';
import imgTeachingSm from '../assets/teaching-001-sm.webp';
import imgRecitals from '../assets/recitals-001.webp';
import imgRecitalsSm from '../assets/recitals-001-sm.webp';
import imgGig from '../assets/gig-001.webp';
import imgGigSm from '../assets/gig-001-sm.webp';

const PerformancePreview = () => {
  useIntersectionObserver();
  const galleryLinkRef = useRef(null);
  const viewProgramsRef = useRef(null);
  const explorePortfolioRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('mobile-hover-active');
          } else {
            entry.target.classList.remove('mobile-hover-active');
          }
        });
      },
      {
        threshold: 0.8, // Require 80% visibility to trigger the hover state naturally on mobile
      }
    );

    if (galleryLinkRef.current) observer.observe(galleryLinkRef.current);
    if (viewProgramsRef.current) observer.observe(viewProgramsRef.current);
    if (explorePortfolioRef.current) observer.observe(explorePortfolioRef.current);

    return () => observer.disconnect();
  }, []);

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
            <Link
              to="/portfolio"
              ref={explorePortfolioRef}
              className="mobile-explore-target flex items-center justify-between bg-transparent text-white border border-white/20 px-4 sm:px-6 py-3.5 sm:py-4 w-44 sm:w-56 hover:border-[#C69C5C] hover:text-[#C69C5C] active:bg-white/5 transition-all duration-1000 md:duration-500 group rounded-[2px]"
            >
              <div className="flex flex-col items-start leading-tight tracking-[0.15em] font-medium text-[0.65rem] sm:text-xs">
                <span>EXPLORE</span>
                <span>PORTFOLIO</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 max-lg:group-[.mobile-hover-active]:translate-x-1 transition-transform duration-1000 md:duration-500" strokeWidth={1.5} />
            </Link>

            <Link
              to="/repertoire"
              ref={viewProgramsRef}
              className="relative overflow-hidden flex items-center justify-between text-gold border border-gold px-4 sm:px-6 py-3.5 sm:py-4 w-44 sm:w-56 transition-all duration-1000 md:duration-500 group rounded-[2px] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gold origin-left scale-x-0 group-hover:scale-x-100 max-lg:group-[.mobile-hover-active]:scale-x-100 transition-transform duration-1000 md:duration-500 ease-out z-0"></div>

              <div className="flex flex-col items-start leading-tight tracking-[0.15em] font-medium text-[0.65rem] sm:text-xs relative z-10 group-hover:text-dark-900 max-lg:group-[.mobile-hover-active]:text-dark-900 transition-colors duration-1000 md:duration-500">
                <span>VIEW</span>
                <span>PROGRAMS</span>
              </div>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:text-dark-900 max-lg:group-[.mobile-hover-active]:text-dark-900 group-hover:translate-x-1 max-lg:group-[.mobile-hover-active]:translate-x-1 transition-all duration-1000 md:duration-500" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="aspect-4/5 bg-dark-800 relative overflow-hidden group fade-in-gentle">
            <img
              src={imgOrchestral}
              srcSet={`${imgOrchestralSm} 600w, ${imgOrchestral} 1200w`}
              sizes="(max-width: 768px) 50vw, 25vw"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-left opacity-100 md:opacity-75 md:group-hover:opacity-100 md:group-hover:scale-105 origin-left transition-all duration-1000"
              alt="Dr. Yirui Li Orchestral Engagements"
            />
            <div className="absolute inset-0 bg-linear-to-t from-dark-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
              <div className="w-6 sm:w-8 h-px bg-gold mb-2 sm:mb-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity md:delay-300"></div>
              <span className="block font-serif text-base sm:text-xl text-white tracking-wide">Orchestral</span>
            </div>
          </div>

          <div className="aspect-4/5 bg-dark-800 relative overflow-hidden group fade-in-gentle">
            <img
              src={imgTeaching}
              srcSet={`${imgTeachingSm} 600w, ${imgTeaching} 1200w`}
              sizes="(max-width: 768px) 50vw, 25vw"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-[center_25%] opacity-100 md:opacity-75 md:group-hover:opacity-100 md:group-hover:scale-105 transition-all duration-1000"
              alt="Dr. Yirui Li Masterclasses"
            />
            <div className="absolute inset-0 bg-linear-to-t from-dark-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
              <div className="w-6 sm:w-8 h-px bg-gold mb-2 sm:mb-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity md:delay-300"></div>
              <span className="block font-serif text-base sm:text-xl text-white tracking-wide">Mentorship</span>
            </div>
          </div>

          <div className="aspect-4/5 bg-dark-800 relative overflow-hidden group fade-in-gentle">
            <img
              src={imgRecitals}
              srcSet={`${imgRecitalsSm} 600w, ${imgRecitals} 1200w`}
              sizes="(max-width: 768px) 50vw, 25vw"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-[center_20%] scale-125 opacity-100 md:opacity-75 md:group-hover:opacity-100 md:group-hover:scale-[1.3] transition-all duration-1000"
              alt="Dr. Yirui Li Solo Recitals"
            />
            <div className="absolute inset-0 bg-linear-to-t from-dark-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
              <div className="w-6 sm:w-8 h-px bg-gold mb-2 sm:mb-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity md:delay-300"></div>
              <span className="block font-serif text-base sm:text-xl text-white tracking-wide">Solo Recitals</span>
            </div>
          </div>

          <div className="aspect-4/5 bg-dark-800 relative overflow-hidden group fade-in-gentle">
            <img
              src={imgGig}
              srcSet={`${imgGigSm} 600w, ${imgGig} 1200w`}
              sizes="(max-width: 768px) 50vw, 25vw"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-[center_25%] opacity-100 md:opacity-75 md:group-hover:opacity-100 md:group-hover:scale-105 transition-all duration-1000"
              alt="Dr. Yirui Li Private Engagements"
            />
            <div className="absolute inset-0 bg-linear-to-t from-dark-900 via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 pointer-events-none">
              <div className="w-6 sm:w-8 h-px bg-gold mb-2 sm:mb-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity md:delay-300"></div>
              <span className="block font-serif text-base sm:text-xl text-white tracking-wide">Private Engagements</span>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center flex justify-center w-full">
          <Link
            to="/portfolio#gallery"
            ref={galleryLinkRef}
            className="inline-flex items-center text-xs sm:text-sm text-gray-400 hover:text-white uppercase tracking-[0.2em] transition-colors duration-300 group"
          >
            <span className="relative">
              Explore Visual Archival
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-gold transition-all duration-1000 group-hover:w-full group-[.mobile-hover-active]:w-full"></span>
            </span>
            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 group-hover:text-gold group-[.mobile-hover-active]:translate-x-1 group-[.mobile-hover-active]:text-gold transition-all duration-300" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PerformancePreview;
