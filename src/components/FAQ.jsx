import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

import { faqs } from '../data/faqs';

const FAQItem = ({ faq, isOpen, onClick }) => {
  return (
    <div className="border-b border-dark-700">
      <button
        className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
        onClick={onClick}
      >
        <span className={`text-lg font-serif transition-colors duration-300 group-hover:text-gold-light ${isOpen ? "text-gold-light" : "text-gray-100"}`}>
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gold transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="overflow-hidden">
          <p className="text-gray-400 font-light leading-relaxed pb-6">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(-1); // No items open by default
  useIntersectionObserver();

  return (
    <section id="faq" className="py-32 bg-dark-800 relative">
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">

        <div className="fade-in-section text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-px bg-gold mr-4"></div>
            <h3 className="text-gold uppercase tracking-[0.2em] text-xs">Information</h3>
            <div className="w-12 h-px bg-gold ml-4"></div>
          </div>
          <h2 className="font-serif text-4xl text-white mb-6 tracking-wide">Frequently Asked Questions</h2>
          <p className="text-gray-400 font-light max-w-2xl mx-auto">
            Find answers to common questions about performances, lessons, and event booking.
          </p>
        </div>

        <div className="fade-in-section space-y-2">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQ;
