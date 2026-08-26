import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import yiruiCover from "../assets/yirui_cover.webp";

const Hero = ({ onSelectInquiry }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let lastWidth = window.innerWidth;

    const updateVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== lastWidth) {
        updateVh();
        lastWidth = currentWidth;
      }
    };

    updateVh();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToId = (id) => {
    const element = document.querySelector(id);
    if (!element) return;
    const navbarHeight = 80;
    const offsetPosition =
      element.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  const handleBooking = (e) => {
    e.preventDefault();
    navigate('/booking');
  };

  // Both entry points land on the same form; they differ only in the inquiry
  // type they preselect, so the visitor never has to classify themselves.
  const handleInquiry = (_cta, inquiryType) => (e) => {
    e.preventDefault();
    onSelectInquiry?.(inquiryType);
    scrollToId("#contact");
  };

  const handlePricing = (e) => {
    e.preventDefault();
    scrollToId("#pricing");
  };

  return (
    <section
      className="relative hero-section flex items-center justify-center bg-parallax"
      style={{ backgroundImage: `url(${yiruiCover})` }}
    >
      <div className="absolute inset-0 bg-linear-to-b from-dark-900/80 via-dark-900/60 to-dark-900"></div>
      <div className="absolute inset-0 luxury-lines z-0"></div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto fade-in-section is-visible w-full">
        <h2 className="text-gold text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] mb-6">
          Houston &bull; Harpist &bull; Educator
        </h2>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-white mb-8 leading-tight tracking-wide">
          Weddings, Events <br />
          <span className="italic font-light text-gray-400">&amp;</span>{" "}
          Harp Lessons
        </h1>
        <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed text-pretty max-w-2xl mx-auto mb-10">
          Dr. Yirui Li — award-winning harpist and Adjunct Harp Professor at Sam
          Houston State University.
        </p>

        {user ? (
          <div className="flex items-center justify-center">
            <button
              onClick={handleBooking}
              className="inline-block border border-gold text-gold hover:bg-gold hover:text-dark-900 px-10 py-4 tracking-[0.2em] uppercase text-xs transition-all duration-500"
            >
              Book a Lesson
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <button
                onClick={handleInquiry(
                  "hero_check_availability",
                  "Performance Booking",
                )}
                className="inline-block border border-gold text-gold hover:bg-gold hover:text-dark-900 px-10 py-4 tracking-[0.2em] uppercase text-xs transition-all duration-500 scroll-link"
              >
                Check Availability
              </button>
              <button
                onClick={handleInquiry(
                  "hero_ask_about_lessons",
                  "Private Lesson",
                )}
                className="inline-block border border-white/20 text-gray-300 hover:border-gold/50 hover:text-gold px-10 py-4 tracking-[0.2em] uppercase text-xs transition-all duration-500 scroll-link"
              >
                Ask About Lessons
              </button>
            </div>
            <button
              onClick={handlePricing}
              className="mt-8 text-gray-400 hover:text-gold text-[11px] uppercase tracking-[0.2em] border-b border-white/20 hover:border-gold/50 pb-1 transition-all duration-500"
            >
              View Pricing
            </button>
          </>
        )}
      </div>

      <div className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none scroll-indicator">
        <div className="h-16 md:h-20 w-px bg-linear-to-b from-gold to-transparent mx-auto"></div>
      </div>
    </section>
  );
};

export default Hero;
