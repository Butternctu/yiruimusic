import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import About from '../components/About';
import Academic from '../components/Academic';
import PerformancePreview from '../components/PerformancePreview';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import { faqs } from '../data/faqs';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

const Home = () => {
  // Owned here so the hero's two entry points can land a visitor on the form
  // with the matching inquiry type already selected.
  const [inquiryType, setInquiryType] = useState('Performance Booking');

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <SEO title="Dr. Yirui Li, Harpist & Educator | Houston, Texas" url="/" />
      <Hero onSelectInquiry={setInquiryType} />
      <About />
      <Academic />
      <PerformancePreview />
      <Pricing />
      <FAQ />
      <Contact inquiryType={inquiryType} onInquiryChange={setInquiryType} />
    </>
  );
};

export default Home;
