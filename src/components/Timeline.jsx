import React, { useRef, useEffect } from 'react';
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
  const itemRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-hover-active');
          } else {
            entry.target.classList.remove('scroll-hover-active');
          }
        });
      },
      {
        // Trigger when item is in the middle 40% of the viewport height
        rootMargin: '-30% 0px -30% 0px',
        threshold: 0,
      }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

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
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gold/30 -translate-x-1/2 z-0"></div>

          {timelineEvents.map((event, index) => (
            <div
              key={index}
              ref={el => itemRefs.current[index] = el}
              className={`fade-in-section group relative mb-12 last:mb-0 md:w-full md:flex ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}
            >
              {/* Timeline dot */}
              <div className="absolute -left-[37px] md:left-1/2 top-1 md:top-2 w-4 h-4 bg-black border-2 border-gold/50 rounded-full md:-translate-x-1/2 z-10 transition-all duration-500 ease-out group-[.scroll-hover-active]:scale-150 group-[.scroll-hover-active]:border-gold group-[.scroll-hover-active]:shadow-[0_0_15px_rgba(212,175,55,1)] group-[.scroll-hover-active]:bg-gold/20 group-hover:scale-150 group-hover:border-gold group-hover:shadow-[0_0_15px_rgba(212,175,55,1)] group-hover:bg-gold/20"></div>

              <div className={`md:w-5/12 transition-all duration-500 ease-out opacity-60 group-[.scroll-hover-active]:opacity-100 group-[.scroll-hover-active]:translate-x-2 group-hover:opacity-100 ${index % 2 === 0 ? 'md:pr-12 md:text-right md:group-hover:-translate-x-2 md:group-[.scroll-hover-active]:-translate-x-2' : 'md:pl-12 md:text-left md:group-hover:translate-x-2'}`}>
                <div className="font-serif text-2xl mb-2 text-gold/70 group-[.scroll-hover-active]:text-gold group-hover:text-gold transition-colors duration-500">{event.year}</div>
                <h4 className="text-lg tracking-wider mb-3 text-white/70 group-[.scroll-hover-active]:text-white group-hover:text-white transition-colors duration-500">{event.title}</h4>
                <p className="font-light leading-relaxed text-sm text-gray-500 group-[.scroll-hover-active]:text-gray-300 group-hover:text-gray-300 transition-colors duration-500">
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
