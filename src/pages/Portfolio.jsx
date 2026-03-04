import React from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import imgOrchestral from '../assets/orchestral-001.jpeg';
import imgTeaching from '../assets/teaching-001.jpeg';
import imgRecitals from '../assets/recitals-001.jpeg';
import imgGig from '../assets/gig-001.jpeg';
import PhotoGallery from '../components/PhotoGallery';

// Import new gallery images
import g1 from '../assets/gallery/DSCF4015.jpeg';
import g2 from '../assets/gallery/DSCF4023.jpeg';
import g3 from '../assets/gallery/DSC_9064_HeadshotsEugeneb.jpeg';
import img0001 from '../assets/gallery/IMG_0001.jpeg';
import img0002 from '../assets/gallery/IMG_0002.jpg';
import img0003 from '../assets/gallery/IMG_0003.jpeg';
import g7 from '../assets/gallery/IMG_2361.jpeg';
import g9 from '../assets/gallery/IMG_5195.jpeg';
import g10 from '../assets/gallery/IMG_6180.jpeg';
import g12 from '../assets/gallery/IMG_6189.jpeg';
import g13 from '../assets/gallery/IMG_6190.jpeg';
import g14 from '../assets/gallery/IMG_6191.jpeg';
import g15 from '../assets/gallery/IMG_7432.jpeg';
import g16 from '../assets/gallery/IMG_7649.jpeg';
import g17 from '../assets/gallery/IMG_7663.jpeg';
import g18 from '../assets/gallery/IMG_8323.jpeg';
import g19 from '../assets/gallery/IMG_7105.JPG';
import g20 from '../assets/gallery/IMG_7431.JPG';
import g25 from '../assets/gallery/IMG_2868.jpg';
import g27 from '../assets/gallery/IMG_5722.jpg';
import g30 from '../assets/gallery/S__102162469_0.jpg';

const galleryImages = [
  img0001, img0002, img0003, g1, g2, g3, g7, g9,
  g10, g12, g13, g14, g15, g16, g17, g18,
  g19, g20, g25, g27, g30
];

const Portfolio = () => {
  useIntersectionObserver();

  return (
    <div className="font-sans text-gray-300 bg-dark-900 antialiased selection:bg-gold selection:text-dark-900">
      <SEO
        title="Performance Portfolio"
        description="A comprehensive archive of Dr. Yirui Li's global performances, highlighting her versatility across orchestral masterworks, solo recitals, and academic mentorship."
        url="/portfolio"
      />
      <Navbar />

      {/* Page Header */}
      <section className="pt-48 pb-24 bg-dark-800 relative border-b border-white/5">
        <div className="absolute inset-0 luxury-lines z-0 opacity-30"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-in-section is-visible">
          <h3 className="text-gold uppercase tracking-[0.2em] text-xs mb-4">Curated Engagements</h3>
          <h1 className="font-serif text-5xl md:text-6xl text-white tracking-wide mb-6">Performance Portfolio</h1>
          <div className="h-px w-24 bg-gold mx-auto opacity-50 mb-8"></div>
          <p className="text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
            A comprehensive archive of Dr. Yirui Li's global performances, highlighting her versatility across orchestral masterworks, solo recitals, and academic mentorship.
          </p>
        </div>
      </section>

      {/* Quick Jump Subnav */}
      <div className="bg-dark-900 border-b border-white/5 sticky top-[65px] md:top-[81px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-3 md:py-4">
          <nav className="flex justify-between md:justify-center w-full md:space-x-10 text-[9px] sm:text-[10px] uppercase tracking-widest md:tracking-[0.2em] text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-hide items-center relative z-0">
            <a href="#orchestral" className="hover:text-gold transition-colors duration-300 shrink-0">Symphonic</a>
            <a href="#teaching" className="hover:text-gold transition-colors duration-300 shrink-0">Mentorship</a>
            <a href="#recitals" className="hover:text-gold transition-colors duration-300 shrink-0">Recitals</a>
            <a href="#engagements" className="hover:text-gold transition-colors duration-300 shrink-0">Private</a>
            <a href="#gallery" className="text-gold font-medium hover:text-white transition-colors duration-300 shrink-0">Gallery</a>
          </nav>
        </div>
      </div>

      {/* Portfolio Content (Alternating Layout) */}
      <section className="py-24 bg-dark-900 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-32">

          {/* Project 1: Orchestral */}
          <div id="orchestral" className="flex flex-col md:flex-row items-center gap-16 fade-in-section scroll-mt-32">
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden border border-white/5">
                <img src={imgOrchestral} alt="Orchestral Engagements" className="w-full h-auto aspect-4/3 object-cover opacity-100 md:opacity-85 md:group-hover:opacity-100 md:group-hover:scale-[1.03] transition-all duration-1000" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-px bg-gold mr-4"></div>
                <h3 className="text-gold uppercase tracking-[0.2em] text-[10px]">Symphonic Repertoire</h3>
              </div>
              <h2 className="font-serif text-3xl text-white mb-6 tracking-wide">Orchestral Engagements</h2>
              <p className="text-gray-400 font-light leading-relaxed mb-6">
                Dr. Li’s expansive orchestral repertoire spans canonical masterworks and technically demanding modern scores, ranging from Berlioz’s Symphonie Fantastique and Holst’s The Planets to the intricate textures of Stravinsky’s Firebird Suite and Zhou Tian’s Petals of Fire. She has held principal and guest harpist positions with esteemed ensembles, including Orchestra Next, the Eugene Ballet, Vancouver Symphony Orchestra, and the West Texas Symphony, where she served as Principal Harp. Her versatile collaborative career also includes performances with the Skagit Symphony Orchestra, SFA Symphony Orchestra, and the Co-Cathedral of the Sacred Heart in Houston.
              </p>
              <Link to="/repertoire" className="inline-flex items-center justify-center border border-gold text-gold hover:bg-gold hover:text-dark-900 px-10 py-4 tracking-[0.2em] uppercase text-xs transition-all duration-500 min-w-[300px] mt-2 mb-4">
                View Programs
              </Link>
              <p className="text-gray-500 font-light text-sm italic">
                * Detailed repertoire lists available upon request.
              </p>
            </div>
          </div>

          {/* Project 2: Masterclasses (Reversed) */}
          <div id="teaching" className="flex flex-col md:flex-row-reverse items-center gap-16 fade-in-section scroll-mt-32">
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden border border-white/5">
                <img src={imgTeaching} alt="Masterclasses & Mentorship" className="w-full h-auto aspect-4/3 object-cover object-[center_25%] opacity-100 md:opacity-85 md:group-hover:opacity-100 md:group-hover:scale-[1.03] transition-all duration-1000" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-px bg-gold mr-4"></div>
                <h3 className="text-gold uppercase tracking-[0.2em] text-[10px]">Academic Initiatives</h3>
              </div>
              <h2 className="font-serif text-3xl text-white mb-6 tracking-wide">Masterclasses & Mentorship</h2>
              <p className="text-gray-400 font-light leading-relaxed mb-6">
                A dedicated pedagogue and scholar, Dr. Li currently serves as Adjunct Harp Professor at Sam Houston State University, providing elite instruction in advanced technique and orchestral excerpts. Her commitment to music education extends to all levels, having served as a chamber music coach and conductor at Sartartia Middle School, Dulles High School, and Klein High School. As a member of the World Harp Congress and a Certified Teacher for the China Orchestra Network, her mentorship uniquely integrates her doctoral research on pedagogical strategies for managing music performance anxiety, helping students pair refined technical execution with psychological resilience.
              </p>
            </div>
          </div>

          {/* Project 3: Solo Recitals */}
          <div id="recitals" className="flex flex-col md:flex-row items-center gap-16 fade-in-section scroll-mt-32">
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden border border-white/5">
                <img src={imgRecitals} alt="Solo Recitals" className="w-full h-auto aspect-4/3 object-cover scale-[1.15] opacity-100 md:opacity-85 md:group-hover:opacity-100 md:group-hover:scale-[1.2] transition-all duration-1000" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-px bg-gold mr-4"></div>
                <h3 className="text-gold uppercase tracking-[0.2em] text-[10px]">Featured Performances</h3>
              </div>
              <h2 className="font-serif text-3xl text-white mb-6 tracking-wide">Solo Recitals</h2>
              <p className="text-gray-400 font-light leading-relaxed mb-6">
                Recognized with First Prize at the American International Music Competition and the Gold Prize at the Van Bach International Music Competition, Dr. Li’s solo recitals are celebrated for their profound emotional depth and pristine clarity. Her solo programming seamlessly integrates traditional European harp literature with contemporary cross-cultural gems. As the President of the Greater Houston Chapter of the American Harp Society, she remains at the forefront of the region’s solo performance landscape, delivering recitals that are both technically brilliant and intellectually engaging.
              </p>
            </div>
          </div>

          {/* Project 4: Private Engagements (Reversed) */}
          <div id="engagements" className="flex flex-col md:flex-row-reverse items-center gap-16 fade-in-section scroll-mt-32">
            <div className="w-full md:w-1/2">
              <div className="relative group overflow-hidden border border-white/5">
                <img src={imgGig} alt="Private Engagements" className="w-full h-auto aspect-4/3 object-cover object-[center_35%] opacity-100 md:opacity-85 md:group-hover:opacity-100 md:group-hover:scale-[1.03] transition-all duration-1000" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-px bg-gold mr-4"></div>
                <h3 className="text-gold uppercase tracking-[0.2em] text-[10px]">Bespoke Events</h3>
              </div>
              <h2 className="font-serif text-3xl text-white mb-6 tracking-wide">Private Engagements</h2>
              <p className="text-gray-400 font-light leading-relaxed mb-6">
                Beyond the concert hall, Dr. Li curates elegant musical atmospheres for exclusive private events, corporate galas, and luxury weddings across the Houston metropolitan area. Each engagement is tailored with a bespoke repertoire, ranging from classical elegance to contemporary sophistication, designed to elevate the aesthetic and emotional resonance of the occasion. Her professional approach ensures that every performance provides a sophisticated and unforgettable experience for distinguished guests.
              </p>
              <Link to="/#contact" className="inline-flex items-center justify-center border border-gold text-gold hover:bg-gold hover:text-dark-900 px-10 py-4 tracking-[0.2em] uppercase text-xs transition-all duration-500 min-w-[300px] mt-4">
                Inquire for Booking
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Visual Archival / Gallery Section */}
      <section id="gallery" className="pt-20 pb-36 bg-dark-800 relative border-t border-white/5 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center fade-in-section mb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-px bg-gold mr-4"></div>
              <h3 className="text-gold uppercase tracking-[0.2em] text-xs">Behind the Scenes</h3>
              <div className="w-12 h-px bg-gold ml-4"></div>
            </div>
            <h2 className="font-serif text-4xl text-white tracking-wide mb-6">Visual Archival</h2>
            <p className="text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
              A collection of moments from private engagements, masterclasses, and the stage.
            </p>
          </div>
          <div className="fade-in-section">
            <PhotoGallery images={galleryImages} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;
