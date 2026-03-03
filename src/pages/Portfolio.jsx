import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import imgOrchestral from '../assets/orchestral-001.jpeg';
import imgTeaching from '../assets/teaching-001.jpeg';
import imgRecitals from '../assets/recitals-001.jpeg';
import imgGig from '../assets/gig-001.jpeg';

const Portfolio = () => {
  useIntersectionObserver();

  return (
    <div className="font-sans text-gray-300 bg-dark-900 antialiased selection:bg-gold selection:text-dark-900">
      <Navbar />

      {/* Page Header */}
      <section className="pt-48 pb-24 bg-dark-800 relative border-b border-white/5">
        <div className="absolute inset-0 luxury-lines z-0 opacity-30"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-in-section is-visible">
          <h3 className="text-gold uppercase tracking-[0.2em] text-xs mb-4">Curated Engagements</h3>
          <h1 className="font-serif text-5xl md:text-6xl text-white tracking-wide mb-6">Performance Portfolio</h1>
          <div className="h-[1px] w-24 bg-gold mx-auto opacity-50 mb-8"></div>
          <p className="text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
            A comprehensive archive of Dr. Yirui Li's global performances, highlighting her versatility across orchestral masterworks, solo recitals, and academic mentorship.
          </p>
        </div>
      </section>

      {/* Portfolio Content (Alternating Layout) */}
      <section className="py-24 bg-dark-900 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-32">

          {/* Project 1: Orchestral */}
          <div className="flex flex-col md:flex-row items-center gap-16 fade-in-section">
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden border border-white/5">
                <img src={imgOrchestral} alt="Orchestral Engagements" className="w-full h-auto aspect-[4/3] object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-1000" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-[1px] bg-gold mr-4"></div>
                <h3 className="text-gold uppercase tracking-[0.2em] text-[10px]">Symphonic Repertoire</h3>
              </div>
              <h2 className="font-serif text-3xl text-white mb-6 tracking-wide">Orchestral Engagements</h2>
              <p className="text-gray-400 font-light leading-relaxed mb-6">
                Dr. Li’s expansive orchestral repertoire spans canonical masterworks and technically demanding modern scores, ranging from Berlioz’s Symphonie Fantastique and Holst’s The Planets to the intricate textures of Stravinsky’s Firebird Suite and Zhou Tian’s Petals of Fire. She has held principal and guest harpist positions with esteemed ensembles, including Orchestra Next, the Eugene Ballet, Vancouver Symphony Orchestra, and the West Texas Symphony, where she served as Principal Harp. Her versatile collaborative career also includes performances with the Skagit Symphony Orchestra, SFA Symphony Orchestra, and the Co-Cathedral of the Sacred Heart in Houston.
              </p>
              <Link to="/repertoire" className="inline-flex items-center text-white text-xs uppercase tracking-[0.1em] hover:text-gold transition-colors group mt-2 mb-4">
                View Programs
                <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
              <p className="text-gray-500 font-light text-sm italic">
                * Detailed repertoire lists available upon request.
              </p>
            </div>
          </div>

          {/* Project 2: Masterclasses (Reversed) */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16 fade-in-section">
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden border border-white/5">
                <img src={imgTeaching} alt="Masterclasses & Mentorship" className="w-full h-auto aspect-[4/3] object-cover object-[center_25%] opacity-85 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-1000" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-[1px] bg-gold mr-4"></div>
                <h3 className="text-gold uppercase tracking-[0.2em] text-[10px]">Academic Initiatives</h3>
              </div>
              <h2 className="font-serif text-3xl text-white mb-6 tracking-wide">Masterclasses & Mentorship</h2>
              <p className="text-gray-400 font-light leading-relaxed mb-6">
                A dedicated pedagogue and scholar, Dr. Li currently serves as Adjunct Harp Professor at Sam Houston State University, providing elite instruction in advanced technique and orchestral excerpts. Her commitment to music education extends to all levels, having served as a chamber music coach and conductor at Sartartia Middle School, Dulles High School, and Klein High School. As a member of the World Harp Congress and a Certified Teacher for the China Orchestra Network, her mentorship uniquely integrates her doctoral research on pedagogical strategies for managing music performance anxiety, helping students pair refined technical execution with psychological resilience.
              </p>
            </div>
          </div>

          {/* Project 3: Solo Recitals */}
          <div className="flex flex-col md:flex-row items-center gap-16 fade-in-section">
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden border border-white/5">
                <img src={imgRecitals} alt="Solo Recitals" className="w-full h-auto aspect-[4/3] object-cover scale-[1.15] opacity-85 group-hover:opacity-100 group-hover:scale-[1.2] transition-all duration-1000" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-[1px] bg-gold mr-4"></div>
                <h3 className="text-gold uppercase tracking-[0.2em] text-[10px]">Featured Performances</h3>
              </div>
              <h2 className="font-serif text-3xl text-white mb-6 tracking-wide">Solo Recitals</h2>
              <p className="text-gray-400 font-light leading-relaxed mb-6">
                Recognized with First Prize at the American International Music Competition and the Gold Prize at the Van Bach International Music Competition, Dr. Li’s solo recitals are celebrated for their profound emotional depth and pristine clarity. Her solo programming seamlessly integrates traditional European harp literature with contemporary cross-cultural gems. As the President of the Greater Houston Chapter of the American Harp Society, she remains at the forefront of the region’s solo performance landscape, delivering recitals that are both technically brilliant and intellectually engaging.
              </p>
            </div>
          </div>

          {/* Project 4: Private Engagements (Reversed) */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16 fade-in-section">
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden border border-white/5">
                <img src={imgGig} alt="Private Engagements" className="w-full h-auto aspect-[4/3] object-cover object-[center_35%] opacity-85 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-1000" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-[1px] bg-gold mr-4"></div>
                <h3 className="text-gold uppercase tracking-[0.2em] text-[10px]">Bespoke Events</h3>
              </div>
              <h2 className="font-serif text-3xl text-white mb-6 tracking-wide">Private Engagements</h2>
              <p className="text-gray-400 font-light leading-relaxed mb-6">
                Beyond the concert hall, Dr. Li curates elegant musical atmospheres for exclusive private events, corporate galas, and luxury weddings across the Houston metropolitan area. Each engagement is tailored with a bespoke repertoire, ranging from classical elegance to contemporary sophistication, designed to elevate the aesthetic and emotional resonance of the occasion. Her professional approach ensures that every performance provides a sophisticated and unforgettable experience for distinguished guests.
              </p>
              <Link to="/#contact" className="inline-flex items-center text-white text-xs uppercase tracking-[0.1em] hover:text-gold transition-colors group mt-4">
                Inquire for Booking
                <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;
