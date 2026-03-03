import React, { useRef, useEffect } from 'react';
import { BookOpen, BrainCircuit } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const Academic = () => {
  useIntersectionObserver();

  const card1Ref = useRef(null);
  const card2Ref = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.95 // Add hover effect only when 95% visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('mobile-hover-active');
        } else {
          entry.target.classList.remove('mobile-hover-active');
        }
      });
    }, options);

    if (card1Ref.current) observer.observe(card1Ref.current);
    if (card2Ref.current) observer.observe(card2Ref.current);

    return () => {
      if (card1Ref.current) observer.unobserve(card1Ref.current);
      if (card2Ref.current) observer.unobserve(card2Ref.current);
    };
  }, []);

  return (
    <section id="teaching" className="py-32 bg-dark-800 relative border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center fade-in-section mb-20">
          <h3 className="text-gold uppercase tracking-[0.2em] text-xs mb-4">Academic Leadership</h3>
          <h2 className="font-serif text-4xl text-white tracking-wide">Teaching & Research</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SHSU Professorship */}
          <div ref={card1Ref} className="bg-dark-900 p-12 border border-white/5 hover:border-gold/30 max-md:[&.mobile-hover-active]:border-gold/30 transition-colors duration-1000 fade-in-section group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gold transform -translate-x-full group-hover:translate-x-0 max-md:group-[.mobile-hover-active]:translate-x-0 transition-transform duration-1000 delay-300 md:delay-0"></div>
            <BookOpen className="w-8 h-8 text-gold mb-8 stroke-[1.5]" />
            <h4 className="font-serif text-2xl text-white mb-2 tracking-wide">Adjunct Professorship</h4>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">Sam Houston State University</p>
            <p className="text-gray-400 font-light leading-relaxed">
              Currently serving as Adjunct Professor of Harp at SHSU and presiding over the Greater Houston Chapter of the American Harp Society. Her pedagogical philosophy emphasizes technical excellence, artistic expression, and cultural literacy, nurturing versatile and thoughtful musicians.
            </p>
          </div>

          {/* Research */}
          <div ref={card2Ref} className="bg-dark-900 p-12 border border-white/5 hover:border-gold/30 max-md:[&.mobile-hover-active]:border-gold/30 transition-colors duration-1000 fade-in-section group relative overflow-hidden" style={{ transitionDelay: '200ms' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gold transform -translate-x-full group-hover:translate-x-0 max-md:group-[.mobile-hover-active]:translate-x-0 transition-transform duration-1000 delay-500 md:delay-0"></div>
            <BrainCircuit className="w-8 h-8 text-gold mb-8 stroke-[1.5]" />
            <h4 className="font-serif text-2xl text-white mb-2 tracking-wide">Performance Anxiety</h4>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">Doctoral Dissertation</p>
            <p className="text-gray-400 font-light leading-relaxed">
              Her doctoral dissertation, <em>Pedagogical Strategies for Managing Music Performance Anxiety on the Harp</em>, underscores her innovative approach to holistic music education, offering actionable methodologies for artists to reclaim their cognitive focus on stage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Academic;
