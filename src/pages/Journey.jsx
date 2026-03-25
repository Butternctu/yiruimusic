import React from 'react';
import SEO from '../components/SEO';
import Timeline from '../components/Timeline';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const Journey = () => {
  useIntersectionObserver();

  return (
    <>
      <SEO
        title="Journey | Dr. Yirui Li"
        description="The musical journey, important events, and milestones of Dr. Yirui Li."
        url="/journey"
      />

      {/* Page Header */}
      <section className="pt-48 pb-24 bg-dark-800 relative border-b border-white/5">
        <div className="absolute inset-0 luxury-lines z-0 opacity-30"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-in-section is-visible">
          <h3 className="text-gold uppercase tracking-[0.2em] text-xs mb-4">Milestones</h3>
          <h1 className="font-serif text-5xl md:text-6xl text-white tracking-wide mb-6">Musical Journey</h1>
          <div className="h-px w-24 bg-gold mx-auto opacity-50 mb-8"></div>
          <p className="text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
            A timeline of significant achievements, education, and pivotal moments in Dr. Yirui Li's career.
          </p>
        </div>
      </section>

      {/* Timeline Content */}
      <Timeline />
    </>
  );
};

export default Journey;
