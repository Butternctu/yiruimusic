import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useSwipeable } from 'react-swipeable';
const Repertoire = () => {
    useIntersectionObserver();
    const [activeTab, setActiveTab] = useState('orchestral');
    const [dragOffset, setDragOffset] = useState(0);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? document.documentElement.clientWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(document.documentElement.clientWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset scroll position of lists when the active tab changes
    useEffect(() => {
        const scrollContainers = document.querySelectorAll('.custom-scrollbar');
        scrollContainers.forEach(container => {
            // Optional: only reset if it's NOT the currently active tab's container
            // However, resetting all of them on tab change matches the "fresh start" mental model.
            container.scrollTop = 0;
        });
    }, [activeTab]);

    const tabs = [
        { id: 'orchestral', label: 'Orchestral', title: 'Orchestral Works' },
        { id: 'chamber', label: 'Chamber', title: 'Chamber Music' },
        { id: 'church', label: 'Church', title: 'Church Services' },
        { id: 'private', label: 'Private', title: 'Private Engagements' }
    ];

    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);

    // Desktop max: 896px (matches max-w-4xl of the header).
    // Mobile width: exactly windowWidth - 48px, which matches the `px-6` padding (24px * 2) of the text/tab containers above it.
    const itemWidth = Math.min(windowWidth - 48, 896);
    // Spacing between cards
    const centerSpacing = itemWidth * 0.35 + (windowWidth > 896 ? 120 : 40);

    const SWIPE_THRESHOLD = 30;

    const handleSwipeLeft = (e) => {
        // Must be a primarily horizontal swipe
        if (Math.abs(e.deltaX) < SWIPE_THRESHOLD || Math.abs(e.deltaX) < (Math.abs(e.deltaY) * 1.5)) {
            setDragOffset(0);
            return;
        }
        if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
        setDragOffset(0);
    };

    const handleSwipeRight = (e) => {
        // Must be a primarily horizontal swipe
        if (Math.abs(e.deltaX) < SWIPE_THRESHOLD || Math.abs(e.deltaX) < (Math.abs(e.deltaY) * 1.5)) {
            setDragOffset(0);
            return;
        }
        if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
        setDragOffset(0);
    };

    const handlers = useSwipeable({
        onSwipedLeft: (e) => handleSwipeLeft(e),
        onSwipedRight: (e) => handleSwipeRight(e),
        onSwiping: (e) => {
            // Allow slightly sloppy horizontal trajectories
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) {
                const dragLimit = centerSpacing * 1.2;
                if (currentIndex === 0 && e.deltaX > 0) setDragOffset(Math.min(e.deltaX * 0.4, dragLimit));
                else if (currentIndex === tabs.length - 1 && e.deltaX < 0) setDragOffset(Math.max(e.deltaX * 0.4, -dragLimit));
                else setDragOffset(e.deltaX);
            } else if (dragOffset !== 0) {
                setDragOffset(0);
            }
        },
        onSwiped: () => {
            // Guarantee offset resets to 0 when finger leaves screen, regardless of swipe success
            setDragOffset(0);
        },
        onTouchEndOrOnMouseUp: () => {
            // Fallback: forcefully clear offset if a touch ends abruptly
            setDragOffset(0);
        },
        trackMouse: true, // Re-enabled for desktop dragging. The strict delta ratio should prevent momentum conflicts.
        preventDefaultTouchmoveEvent: false, // Allow browser to handle vertical scrolling freely
    });

    const getListContent = (id) => {
        // Helper to generate list items quickly
        const renderItems = (items) => (
            <ul className="text-gray-400 font-light leading-relaxed space-y-4 list-none p-0">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start">
                        <span className="text-gold mr-4 mt-1.5 text-xs tracking-wider">✦</span>
                        <span className="text-white font-medium mr-2">{item.composer}:</span> {item.piece}
                    </li>
                ))}
            </ul>
        );

        const orchestral = [
            { composer: 'Berlioz', piece: 'Symphonie Fantastique' }, { composer: 'Shostakovich', piece: 'Symphony No.5' }, { composer: 'Zhou Tian', piece: 'Petals of Fire' },
            { composer: 'Bernstein', piece: 'Symphonic Dances' }, { composer: 'Ravel', piece: 'Le Tombeau de Couperin' }, { composer: 'Holst', piece: 'The Planets' },
            { composer: 'Mahler', piece: 'Symphony No.1' }, { composer: 'Stravinsky', piece: 'Firebird Suite' }, { composer: 'Wagner', piece: 'Der Fliegende Holländer' },
            { composer: 'Respighi', piece: 'Pini di Roma' }, { composer: 'Tchaikovsky', piece: 'Swan Lake Suite' }, { composer: 'Brahms', piece: 'Symphony No.4' },
            { composer: 'Beethoven', piece: 'Symphony No.9' }, { composer: 'Rimsky-Korsakov', piece: 'Scheherazade' }, { composer: 'Strauss', piece: 'Don Juan' },
            { composer: 'Debussy', piece: 'La Mer' }, { composer: 'Mussorgsky', piece: 'Pictures at an Exhibition' }, { composer: 'Bartók', piece: 'Concerto for Orchestra' },
            { composer: 'Copland', piece: 'Appalachian Spring' }, { composer: 'Sibelius', piece: 'Symphony No.2' }, { composer: 'Dvořák', piece: 'Symphony No.9' },
            { composer: 'Elgar', piece: 'Enigma Variations' }, { composer: 'Gershwin', piece: 'An American in Paris' }, { composer: 'Prokofiev', piece: 'Romeo and Juliet' },
            { composer: 'Rachmaninoff', piece: 'Symphonic Dances' }, { composer: 'Smetana', piece: 'Ma Vlast' }, { composer: 'Vaughan Williams', piece: 'Fantasia on a Theme by Thomas Tallis' },
            { composer: 'Bruckner', piece: 'Symphony No.7' }, { composer: 'Hindemith', piece: 'Symphonic Metamorphosis' }, { composer: 'Janáček', piece: 'Sinfonietta' }
        ];

        const chamber = [
            { composer: 'Debussy', piece: 'Sonata for Flute, Viola and Harp' }, { composer: 'Ravel', piece: 'Introduction and Allegro' }, { composer: 'Jolivet', piece: 'Chant de Linos' },
            { composer: 'Piazzolla', piece: 'Histoire du Tango' }, { composer: 'Bax', piece: 'Elegiac Trio' }, { composer: 'Ibert', piece: 'Deux Interludes' },
            { composer: 'Fauré', piece: 'Sicilienne' }, { composer: 'Tournier', piece: 'Suite for Flute, Violin, Viola, Cello and Harp' }, { composer: 'Caplet', piece: 'Conte Fantastique' },
            { composer: 'Saint-Saëns', piece: 'Fantaisie for Violin and Harp' }, { composer: 'Alwyn', piece: 'Naiades' }, { composer: 'Mozart', piece: 'Concerto for Flute and Harp' },
            { composer: 'Salzedo', piece: 'Chanson dans la nuit' }, { composer: 'Grandjany', piece: 'Aria in Classic Style' }, { composer: 'Damase', piece: 'Sonata for Flute and Harp' },
            { composer: 'Persichetti', piece: 'Serenade No. 10' }, { composer: 'Roussel', piece: 'Serenade' }, { composer: 'Cras', piece: 'Quintet for Harp, Flute, and Strings' },
            { composer: 'Spohr', piece: 'Sonata in C minor' }, { composer: 'Glinka', piece: 'Nocturne' }, { composer: 'Françaix', piece: 'Quintet for Flute, Harp and String Trio' },
            { composer: 'Brahms', piece: 'Songs for Women\'s Chorus, Two Horns and Harp' }, { composer: 'Britten', piece: 'A Ceremony of Carols' }, { composer: 'Hovhaness', piece: 'Sonata for Flute and Harp' },
            { composer: 'Rorem', piece: 'Book of Hours' }, { composer: 'Krumpholtz', piece: 'Sonata for Flute and Harp' }, { composer: 'Naderman', piece: 'Sonatas' },
            { composer: 'Parish Alvars', piece: 'Romances' }, { composer: 'Connesson', piece: 'Toccata' }, { composer: 'Andrès', piece: 'Algues' }
        ];

        const church = [
            { composer: 'Bach', piece: 'Jesu, Joy of Man\'s Desiring' }, { composer: 'Schubert', piece: 'Ave Maria' }, { composer: 'Franck', piece: 'Panis Angelicus' },
            { composer: 'Vaughan Williams', piece: 'Rhosymedre' }, { composer: 'Handel', piece: 'Largo from Xerxes' }, { composer: 'Mendelssohn', piece: 'O Rest in the Lord' },
            { composer: 'Fauré', piece: 'Pie Jesu' }, { composer: 'Malotte', piece: 'The Lord\'s Prayer' }, { composer: 'Purcell', piece: 'Trumpet Tune' },
            { composer: 'Clarke', piece: 'Trumpet Voluntary' }, { composer: 'Wagner', piece: 'Bridal Chorus' }, { composer: 'Mendelssohn', piece: 'Wedding March' },
            { composer: 'Bach', piece: 'Air on the G String' }, { composer: 'Vivaldi', piece: 'Winter (Largo)' }, { composer: 'Bach/Gounod', piece: 'Ave Maria' },
            { composer: 'Mozart', piece: 'Ave Verum Corpus' }, { composer: 'Traditional', piece: 'Be Thou My Vision' }, { composer: 'Traditional', piece: 'Amazing Grace' },
            { composer: 'Pachelbel', piece: 'Canon in D' }, { composer: 'Campra', piece: 'Rigaudon' }, { composer: 'Marcello', piece: 'Psalm 19' },
            { composer: 'Charpentier', piece: 'Te Deum (Prelude)' }, { composer: 'Karg-Elert', piece: 'Nun danket alle Gott' }, { composer: 'Widor', piece: 'Toccata from Symphony No.5' },
            { composer: 'Buxtehude', piece: 'Prelude, Fugue and Chaconne' }, { composer: 'Vierne', piece: 'Carillon de Westminster' }, { composer: 'Stanley', piece: 'Trumpet Voluntary' },
            { composer: 'Brahms', piece: 'How Lovely is Thy Dwelling Place' }, { composer: 'Rutter', piece: 'The Lord Bless You and Keep You' }, { composer: 'Tallis', piece: 'If Ye Love Me' }
        ];

        const privateEngagements = [
            { composer: 'Debussy', piece: 'Clair de Lune' }, { composer: 'Satie', piece: 'Gymnopédie No. 1' }, { composer: 'Henson-Conant', piece: 'The Nightingale' },
            { composer: 'Pachelbel', piece: 'Canon in D' }, { composer: 'Mancini', piece: 'Moon River' }, { composer: 'Weiss', piece: 'What a Wonderful World' },
            { composer: 'Arlen', piece: 'Over the Rainbow' }, { composer: 'Morricone', piece: 'Gabriel\'s Oboe' }, { composer: 'Piazzolla', piece: 'Oblivion' },
            { composer: 'Einaudi', piece: 'Nuvole Bianche' }, { composer: 'Yiruma', piece: 'River Flows in You' }, { composer: 'Tiersen', piece: 'Comptine d\'un autre été' },
            { composer: 'Williams', piece: 'Theme from Schindler\'s List' }, { composer: 'Rota', piece: 'Love Theme from The Godfather' }, { composer: 'Horner', piece: 'My Heart Will Go On' },
            { composer: 'Menken', piece: 'A Whole New World' }, { composer: 'Elton John', piece: 'Can You Feel the Love Tonight' }, { composer: 'Beatles', piece: 'Here Comes the Sun' },
            { composer: 'Presley', piece: 'Can\'t Help Falling in Love' }, { composer: 'Sinatra', piece: 'Fly Me to the Moon' }, { composer: 'Gershwin', piece: 'Summertime' },
            { composer: 'Jobim', piece: 'The Girl from Ipanema' }, { composer: 'Piaf', piece: 'La Vie en Rose' }, { composer: 'Traditional', piece: 'Danny Boy' },
            { composer: 'Traditional', piece: 'Greensleeves' }, { composer: 'O\'Carolan', piece: 'Carolan\'s Concerto' }, { composer: 'Salzedo', piece: 'Tango' },
            { composer: 'Ortiz', piece: 'Milonga para amar' }, { composer: 'Andrès', piece: 'Epices' }, { composer: 'Chertok', piece: 'Around the Clock Suite' }
        ];

        switch (id) {
            case 'orchestral':
                return (
                    <div className="relative group/list">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar pb-12">
                            {renderItems(orchestral.slice(0, 15))}
                            {renderItems(orchestral.slice(15))}
                        </div>
                        {/* Gradient Mask to indicate more content */}
                        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-dark-800 to-transparent pointer-events-none z-10 transition-opacity duration-500"></div>
                    </div>
                );
            case 'chamber':
                return (
                    <div className="relative group/list">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar pb-12">
                            {renderItems(chamber.slice(0, 15))}
                            {renderItems(chamber.slice(15))}
                        </div>
                        {/* Gradient Mask to indicate more content */}
                        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-dark-800 to-transparent pointer-events-none z-10 transition-opacity duration-500"></div>
                    </div>
                );
            case 'church':
                return (
                    <div className="relative group/list">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar pb-12">
                            {renderItems(church.slice(0, 15))}
                            {renderItems(church.slice(15))}
                        </div>
                        {/* Gradient Mask to indicate more content */}
                        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-dark-800 to-transparent pointer-events-none z-10 transition-opacity duration-500"></div>
                    </div>
                );
            case 'private':
                return (
                    <div className="relative group/list">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar pb-12">
                            {renderItems(privateEngagements.slice(0, 15))}
                            {renderItems(privateEngagements.slice(15))}
                        </div>
                        {/* Gradient Mask to indicate more content */}
                        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-dark-800 to-transparent pointer-events-none z-10 transition-opacity duration-500"></div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="font-sans text-gray-300 bg-dark-900 antialiased selection:bg-gold selection:text-dark-900 min-h-screen flex flex-col justify-between">
            <Navbar />

            <main className="flex-grow pb-32 overflow-hidden">
                {/* Page Header */}
                <section className="pt-48 pb-16 bg-dark-800 relative border-b border-white/5">
                    <div className="absolute inset-0 luxury-lines z-0 opacity-30"></div>
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-in-section is-visible">
                        <h3 className="text-gold uppercase tracking-[0.2em] text-xs mb-4">Complete Music Services</h3>
                        <h1 className="font-serif text-5xl md:text-6xl text-white tracking-wide mb-6">Programs & Repertoire</h1>
                        <div className="h-[1px] w-24 bg-gold mx-auto opacity-50 mb-8"></div>
                        <p className="text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
                            A curated selection spanning from canonical orchestral masterworks and intimate chamber music, to elegant selections for church services and bespoke private engagements.
                        </p>
                    </div>
                </section>

                {/* Tab Navigation */}
                <section className="pt-12 pb-4 bg-dark-900 relative z-10">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <div className="flex flex-wrap justify-center gap-6 md:gap-12 border-b border-white/10 pb-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`text-xs md:text-sm uppercase tracking-[0.15em] transition-all duration-300 pb-2 relative group 
                                    ${activeTab === tab.id ? 'text-gold' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {tab.label}
                                    <span
                                        className={`absolute bottom-[-17px] left-0 w-full h-[1px] bg-gold transition-all duration-500 
                                        ${activeTab === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                                    ></span>
                                </button>
                            ))}
                        </div>
                        {/* Removed Sweep Hint */}
                    </div>
                </section>

                {/* Repertoire Content - Cover Flow */}
                <section {...handlers} className="pt-6 pb-12 bg-dark-900 relative cursor-grab active:cursor-grabbing select-none overflow-hidden" style={{ perspective: '1200px', touchAction: 'pan-y' }}>
                    <div className="grid w-full place-items-center" style={{ transformStyle: 'preserve-3d' }}>
                        {tabs.map((tab, idx) => {
                            const swipeProgress = dragOffset / centerSpacing;
                            const itemOffset = (idx - currentIndex) + swipeProgress;
                            const absOffset = Math.abs(itemOffset);
                            const sign = Math.sign(itemOffset);
                            const zIndex = 100 - absOffset * 10;

                            // Cover Flow Transform Math
                            const maxRotateY = 45;
                            const maxTranslateZ = -300;
                            const stackSpacing = 80;

                            const fraction = Math.min(absOffset, 1);
                            const overshoot = Math.max(0, absOffset - 1);

                            const rotateY = sign * fraction * -maxRotateY;
                            const translateZ = fraction * maxTranslateZ;
                            const translateX = sign * (fraction * centerSpacing + overshoot * stackSpacing);

                            const scale = Math.max(0.65, 1 - absOffset * 0.15);
                            const opacityVal = Math.max(0, 1 - absOffset * 0.5);

                            return (
                                <div
                                    key={tab.id}
                                    className={`col-start-1 row-start-1 transition-all duration-300 ${absOffset > 0.5 ? 'pointer-events-none' : ''}`}
                                    style={{
                                        width: `${itemWidth}px`,
                                        zIndex: Math.round(zIndex),
                                        opacity: dragOffset ? opacityVal : (idx === currentIndex ? 1 : Math.max(0, 1 - absOffset * 0.5)),
                                        transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                                        transition: dragOffset ? 'none' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
                                    }}
                                >
                                    <div
                                        className="bg-dark-800/90 p-8 md:p-16 border border-white/10 rounded-lg relative h-full w-full shadow-2xl backdrop-blur-sm"
                                        style={{ boxShadow: idx === currentIndex ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' : '0 10px 30px rgba(0,0,0,0.5)' }}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-30"></div>
                                        <h2 className={`font-serif text-3xl mb-6 tracking-wide text-center transition-colors duration-500 ${idx === currentIndex ? 'text-white' : 'text-gray-400'}`}>
                                            {tab.title}
                                        </h2>
                                        <div className="h-[1px] w-24 bg-gold mx-auto opacity-50 mb-6"></div>
                                        {getListContent(tab.id)}

                                        {/* Overlay to darken side items visually */}
                                        <div
                                            className="absolute inset-0 bg-black/50 rounded-lg transition-opacity duration-300 pointer-events-none"
                                            style={{ opacity: Math.min(1, absOffset * 0.8) }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="bg-dark-900 pb-24 text-center relative z-10">
                    <p className="text-gray-500 font-light text-sm italic max-w-2xl mx-auto px-6">
                        * Comprehensive repertoire lists across all domains are available upon request.
                    </p>
                </section>

            </main>

            <Footer />
        </div>
    );
};

export default Repertoire;
