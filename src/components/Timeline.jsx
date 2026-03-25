import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const timelineEvents = [
  {
    year: '2024',
    title: 'Doctor of Musical Arts',
    description: 'Completed Doctor of Musical Arts degree from the University of Oregon with a focus on harp performance and pedagogy.'
  },
  {
    year: '2023',
    title: 'First Prize Winner',
    description: 'Awarded First Prize at the prestigious American International Music Competition, recognizing outstanding artistic achievement.'
  },
  {
    year: '2021',
    title: 'Master of Music',
    description: 'Earned Master of Music degree from SUNY Fredonia, advancing scholarly and technical mastery of the instrument.'
  },
  {
    year: '2018',
    title: 'Early Education',
    description: 'Commenced formal music education at the esteemed Tianjin Conservatory of Music.'
  }
];

const Timeline = () => {
  useIntersectionObserver();

  return (
    <section id="timeline" className="py-24 bg-black relative">
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="fade-in-section text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-px bg-gold mr-4"></div>
            <h3 className="text-gold uppercase tracking-[0.2em] text-xs">Journey</h3>
            <div className="w-12 h-px bg-gold ml-4"></div>
          </div>
          <h2 className="font-serif text-4xl text-white tracking-wide">Important Events</h2>
        </div>

        <div className="relative border-l border-gold/30 pl-8 md:pl-0 md:border-l-0 md:flex md:flex-col md:items-center">
          {/* Central Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gold/30 -translate-x-1/2"></div>
          
          {timelineEvents.map((event, index) => (
            <div key={index} className={`fade-in-section relative mb-12 last:mb-0 md:w-full md:flex ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}>
              
              {/* Timeline dot */}
              <div className="absolute -left-[37px] md:left-1/2 top-1 w-4 h-4 bg-black border-2 border-gold rounded-full md:-translate-x-1/2 z-10 shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
              
              <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                <div className="text-gold font-serif text-2xl mb-2">{event.year}</div>
                <h4 className="text-white text-lg tracking-wider mb-3">{event.title}</h4>
                <p className="text-gray-400 font-light leading-relaxed text-sm">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
