import React from 'react';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import About from '../components/About';
import Academic from '../components/Academic';
import PerformancePreview from '../components/PerformancePreview';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import { faqs } from '../data/faqs';
import { useAuth } from '../context/AuthContext';

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
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <SEO title="Dr. Yirui Li, Harpist & Educator | Houston, Texas" url="/" />
      <Hero />
      <About />
      <Academic />
      <PerformancePreview />
      <FAQ />
      {!isAuthenticated && <Contact />}
    </>
  );
};

export default Home;
