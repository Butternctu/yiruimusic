import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const faqs = [
  {
    question: "Do you perform for weddings or private events?",
    answer: "Yes, I offer tailored performances for weddings, corporate events, and private gatherings. Please reach out via the contact form to discuss your specific needs and check availability."
  },
  {
    question: "Do you offer harp lessons?",
    answer: "Yes, I provide comprehensive harp instruction for students of all ages and skill levels, from beginners to advanced musicians. Lessons can be conducted in-person in the Houston area or online."
  },
  {
    question: "What areas do you serve?",
    answer: "I am based in Houston, Texas, and frequently perform throughout the surrounding areas. I am also available for national and international engagements upon request."
  },
  {
    question: "Can I request specific songs for my event?",
    answer: "Absolutely. While I have an extensive repertoire ranging from classical to contemporary pop, I am always happy to learn new pieces to make your event truly special."
  },
  {
    question: "What are the requirements for the performance space?",
    answer: "Typically, the harp requires a flat, stable surface (approximately 5x5 feet) and an armless chair. For outdoor events, a completely shaded and dry area is essential to protect the instrument from the elements."
  }
];

const FAQItem = ({ faq, isOpen, onClick }) => {
  return (
    <div className="border-b border-dark-700">
      <button
        className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
        onClick={onClick}
      >
        <span className={`text-lg font-serif transition-colors group-hover:text-gold ${isOpen ? "text-gold" : "text-gray-100"}`}>
          {faq.question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-gold transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
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
