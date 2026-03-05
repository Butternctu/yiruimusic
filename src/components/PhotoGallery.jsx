import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PhotoGallery = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? document.documentElement.clientWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(document.documentElement.clientWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const SWIPE_THRESHOLD = 20;

    const handleSwipeLeft = (e) => {
        if (Math.abs(e.deltaX) < SWIPE_THRESHOLD || Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
            setDragOffset(0);
            return;
        }
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setDragOffset(0);
    };

    const handleSwipeRight = (e) => {
        if (Math.abs(e.deltaX) < SWIPE_THRESHOLD || Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
            setDragOffset(0);
            return;
        }
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setDragOffset(0);
    };

    const handlers = useSwipeable({
        onSwiping: (e) => {
            // Only visually drag if horizontal movement is strictly greater than vertical
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                setDragOffset(e.deltaX);
            } else if (dragOffset !== 0) {
                setDragOffset(0);
            }
        },
        onSwipedLeft: handleSwipeLeft,
        onSwipedRight: handleSwipeRight,
        onSwiped: () => {
            setDragOffset(0);
        },
        onTouchEndOrOnMouseUp: () => {
            setDragOffset(0);
        },
        trackMouse: true,
        preventDefaultTouchmoveEvent: false // Allow vertical page scrolling
    });

    const handleDotClick = (index) => {
        setCurrentIndex(index);
        setDragOffset(0);
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setDragOffset(0);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setDragOffset(0);
    };

    const centerSpacing = windowWidth > 768 ? 600 : windowWidth * 0.85;
    const itemWidth = windowWidth > 768 ? 600 : windowWidth * 0.85;

    return (
        <div className="w-full relative py-8">
            <div {...handlers} className="relative cursor-grab active:cursor-grabbing select-none overflow-hidden pb-12" style={{ perspective: '1200px', touchAction: 'pan-y' }}>
                <div className="grid w-full place-items-center" style={{ transformStyle: 'preserve-3d', height: windowWidth > 768 ? '450px' : '350px' }}>
                    {images.map((imgSrc, idx) => {
                        const swipeProgress = dragOffset / centerSpacing;
                        let itemOffset = (idx - currentIndex) + swipeProgress;

                        // Handle circular wrapping for continuous feeling
                        if (itemOffset > images.length / 2) itemOffset -= images.length;
                        if (itemOffset < -images.length / 2) itemOffset += images.length;

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
                        const opacityVal = dragOffset ? Math.max(0, 1 - absOffset * 0.6) : (idx === currentIndex ? 1 : Math.max(0, 1 - absOffset * 0.6));

                        // Darker side images on desktop to emphasize the center image
                        const maxOverlayOpacity = windowWidth > 768 ? 0.85 : 0.65;

                        return (
                            <div
                                key={idx}
                                className={`col-start-1 row-start-1 absolute top-0 transition-all duration-300 ${absOffset > 0.5 ? 'pointer-events-none' : ''}`}
                                style={{
                                    width: `${itemWidth}px`,
                                    height: '100%',
                                    zIndex: Math.round(zIndex),
                                    opacity: opacityVal,
                                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                                    transition: dragOffset ? 'none' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
                                }}
                            >
                                <div className={`group w-full h-full rounded-sm overflow-hidden border border-white/10 shadow-2xl relative bg-dark-900 flex items-center justify-center transition-all duration-700 hover:shadow-[0_0_30px_rgba(201,165,116,0.15)] hover:border-gold/30 ${idx === currentIndex ? 'shadow-[0_0_20px_rgba(201,165,116,0.1)] border-gold/20' : ''}`}>
                                    <div className="absolute inset-0 bg-black z-10 pointer-events-none transition-opacity duration-500" style={{ opacity: dragOffset ? Math.min(maxOverlayOpacity, absOffset * maxOverlayOpacity) : (idx === currentIndex ? 0 : maxOverlayOpacity) }}></div>
                                    <img
                                        src={imgSrc}
                                        alt={`Gallery Image ${idx + 1}`}
                                        className={`w-full h-full object-cover object-center transition-all duration-1000 ${idx === currentIndex ? 'opacity-100 scale-[1.03]' : 'opacity-85'}`}
                                        draggable="false"
                                    />
                                    {/* Gold highlight line block for active item */}
                                    <div className={`absolute -inset-px border-2 transition-all duration-1000 ease-in-out z-20 pointer-events-none ${idx === currentIndex ? 'border-gold-dark opacity-100 shadow-[inset_0_0_15px_rgba(140,109,49,0.4)]' : 'border-transparent opacity-0'}`}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Navigation Buttons */}
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 text-gray-500 hover:text-gold transition-colors hidden md:block outline-none">
                    <ChevronLeft className="w-8 h-8" strokeWidth={1.5} />
                </button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 text-gray-500 hover:text-gold transition-colors hidden md:block outline-none">
                    <ChevronRight className="w-8 h-8" strokeWidth={1.5} />
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center space-x-3">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleDotClick(idx)}
                        className={`transition-all duration-300 rounded-full h-1.5 focus:outline-none ${idx === currentIndex ? 'w-8 bg-gold' : 'w-2 bg-gray-600 hover:bg-gray-400'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
            <div className="text-center mt-6 text-xs uppercase tracking-[0.2em] text-gray-500">
                <span className="hidden md:inline">Swipe or use arrows to navigate</span>
                <span className="md:hidden">Swipe to explore</span>
            </div>
        </div>
    );
};

export default PhotoGallery;
