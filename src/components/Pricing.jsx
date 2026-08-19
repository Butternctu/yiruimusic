import React from 'react';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useCtaSectionView } from '../hooks/useCtaSectionView';
import { trackEvent } from '../lib/gtag.js';
import { lessonRates, eventRates, addOns } from '../data/pricing';

const RateRow = ({ title, rate }) => (
  <div className="flex justify-between items-baseline gap-6 py-4 border-b border-white/5 last:border-0">
    <span className="text-gray-200 font-light tracking-wide">{title}</span>
    <span className="text-gold font-serif text-lg tracking-wide whitespace-nowrap shrink-0">{rate}</span>
  </div>
);

const Pricing = () => {
  useIntersectionObserver();
  const ctaSectionRef = useCtaSectionView('pricing');

  return (
    <section
      id="pricing"
      ref={ctaSectionRef}
      className="py-24 bg-dark-800 relative overflow-hidden border-y border-white/5"
    >
      <div className="absolute inset-0 luxury-lines opacity-20 z-0"></div>

      <div className="max-w-3xl mx-auto px-6 md:px-12 relative z-10">
        <div className="fade-in-section text-center mb-14">
          <h3 className="text-gold uppercase tracking-[0.2em] text-xs mb-4">Rates</h3>
          <h2 className="font-serif text-4xl text-white tracking-wide">Pricing & Services</h2>
        </div>

        <div className="fade-in-section mb-12">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-4 pb-3 border-b border-gold/30">
            Private Instruction · 60 Mins
          </h3>
          {lessonRates.map((item) => (
            <RateRow key={item.title} title={item.title} rate={item.rate} />
          ))}
        </div>

        <div className="fade-in-section mb-12">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-4 pb-3 border-b border-gold/30">
            Live Events · 1 Hour Minimum
          </h3>
          {eventRates.map((item) => (
            <RateRow key={item.title} title={item.title} rate={item.rate} />
          ))}
        </div>

        <div className="fade-in-section mb-12">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-4 pb-3 border-b border-gold/30">
            Add-Ons
          </h3>
          {addOns.map((item) => (
            <RateRow key={item.title} title={item.title} rate={item.rate} />
          ))}
        </div>

        <div className="fade-in-section text-center">
          <p className="text-gray-500 text-xs font-light mb-8 tracking-wide">
            Quotes may vary by venue, duration, and repertoire. Extra hours at discounted rates.
          </p>
          <Link
            to="/#contact"
            onClick={(e) => {
              trackEvent('cta_click', { cta: 'pricing_request_a_quote' });
              const el = document.querySelector('#contact');
              if (el) {
                e.preventDefault();
                const top = el.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
              }
            }}
            className="inline-flex border border-gold text-gold px-10 py-3.5 tracking-[0.2em] uppercase text-xs hover:bg-gold hover:text-dark-900 transition-all duration-500"
          >
            Request a Quote
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
