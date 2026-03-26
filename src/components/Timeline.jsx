import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const timelineEvents = [
  {
    year: '2025.06',
    title: 'President, American Harp Society',
    description: 'Elected as President of the Great Houston Chapter of the American Harp Society.'
  },
  {
    year: '2025',
    title: 'Competition Judge',
    description: 'Served as a judge for the Milligan Competition in Houston, TX.'
  },
  {
    year: '2024.09',
    title: 'SHSU Harp Professor',
    description: 'Appointed as Harp Professor at Sam Houston State University.'
  },
  {
    year: '2024.06',
    title: 'Doctor of Musical Arts',
    description: 'Earned Doctor of Musical Arts from the University of Oregon.'
  },
  {
    year: '2024',
    title: 'Concerto Competition Judge',
    description: 'Judge for the Sam Houston State University Concerto Competition.'
  },
  {
    year: '2024',
    title: 'International Music Prizes',
    description: '1st Prize at American International Music Competition and Gold Prize at Van Bach International Music Competition.'
  },
  {
    year: '2023',
    title: 'First Prize Winner',
    description: 'Awarded First Prize at the American International Music Competition, recognizing outstanding artistic achievement.'
  },
  {
    year: '2023',
    title: 'International Competition Success',
    description: '2nd Prize at MAP International Music Competition and 3rd Prize at Poppy Harp Festival Competition.'
  },
  {
    year: '2021.05',
    title: 'Master of Music',
    description: 'Earned Master of Music degree from SUNY Fredonia, specializing in harp performance and pedagogy.'
  },
  {
    year: '2021',
    title: 'Full DMA Scholarship',
    description: 'Awarded Full Scholarship for Doctor of Musical Arts at the University of Oregon.'
  },
  {
    year: '2018.06',
    title: 'Early Education',
    description: 'Completed foundational musical studies at Tianjin Conservatory of Music.'
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
