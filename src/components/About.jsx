import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import yiruiSmile from "../assets/yirui_smile.webp";

const About = () => {
  const [showFullBio, setShowFullBio] = useState(false);
  const toggleBio = () => setShowFullBio(!showFullBio);
  useIntersectionObserver();

  const journeyBtnRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("mobile-hover-active");
          } else {
            entry.target.classList.remove("mobile-hover-active");
          }
        });
      },
      {
        threshold: 0.8,
      },
    );

    if (journeyBtnRef.current) observer.observe(journeyBtnRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="py-32 bg-dark-900 relative">
      <div className="absolute inset-0 luxury-lines z-0 opacity-50"></div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
        <div className="fade-in-section relative">
          <div className="absolute -inset-4 border border-gold/30 translate-x-4 translate-y-4 hidden md:block z-0"></div>
          <img
            src={yiruiSmile}
            decoding="async"
            alt="Dr. Yirui Li - Professional Harpist and Educator"
            className="relative z-10 w-full h-auto shadow-2xl object-cover hover:scale-[1.02] opacity-75 hover:opacity-100 transition-all duration-700 aspect-3/4"
          />
        </div>

        <div className="fade-in-section">
          <div className="flex items-center mb-6">
            <div className="w-12 h-px bg-gold mr-4"></div>
            <h3 className="text-gold uppercase tracking-[0.2em] text-xs">
              Biography
            </h3>
          </div>
          <h2 className="font-serif text-4xl text-white mb-8 tracking-wide">
            A Legacy of Excellence
          </h2>
          <div className="text-gray-400 font-light leading-relaxed text-base">
            <p>
              Dr. Yirui Li is a distinguished harpist and pedagogue based in
              Houston, Texas, celebrated for her refined artistry, scholarly
              insight, and dynamic contributions to the global harp community. A
              native of China, she commenced her formal education at the Tianjin
              Conservatory of Music, later earning her Master of Music from SUNY
              Fredonia and her Doctor of Musical Arts from the University of
              Oregon.
            </p>

            <div
              className={`grid transition-all duration-700 ease-in-out ${showFullBio ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden space-y-6">
                <p>
                  As a sought-after performer, Dr. Li has appeared with
                  prestigious ensembles including Orchestra Next, the Eugene
                  Ballet, Vancouver Symphony Orchestra, and West Texas Symphony.
                  Her artistic achievements have been recognized through
                  numerous international accolades, including First Prize at
                  both the American International Music Competition and the Van
                  Bach International Music Competition.
                </p>
                <p>
                  Through her multifaceted career as a performer, educator, and
                  scholar, Dr. Li continues to elevate the harp's expressive
                  possibilities and inspire a global community of musicians.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-6 items-start">
            <button
              onClick={toggleBio}
              className="inline-flex items-center text-gray-300 text-sm uppercase tracking-widest hover:text-gold transition-colors group focus:outline-none animate-pulse w-fit"
            >
              <span>{showFullBio ? "Show Less" : "Read Full Biography"}</span>
              <span className="ml-4 w-8 h-px bg-white group-hover:bg-gold transition-colors"></span>
            </button>
            <Link
              to="/journey"
              ref={journeyBtnRef}
              className="self-center fade-in-section inline-flex items-center text-xs sm:text-sm text-gray-400 hover:text-white uppercase tracking-[0.2em] transition-colors duration-300 group mt-12"
            >
              <span className="relative">
                VIEW MUSICAL JOURNEY
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-gold transition-all duration-1000 group-hover:w-full group-[.mobile-hover-active]:w-full"></span>
              </span>
              <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 group-hover:text-gold group-[.mobile-hover-active]:translate-x-1 group-[.mobile-hover-active]:text-gold transition-all duration-300" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
