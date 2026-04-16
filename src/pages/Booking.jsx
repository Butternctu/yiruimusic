import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock, Music, X, Check, ArrowLeft } from 'lucide-react';
import { collection, query, where, getDocs, doc, runTransaction, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
  LESSON_TYPES,
  SLOT_STATUS,
  formatDate,
  formatFullDate,
  formatTime,
  getWeekDates,
  isSameDay,
  isToday,
  isPast,
  getLessonTypeById,
} from '../data/bookingData';
import SEO from '../components/SEO';
import emailjs from '@emailjs/browser';

const Booking = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  });
  const [selectedType, setSelectedType] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedLessonType, setSelectedLessonType] = useState(null);
  const [nextSlot, setNextSlot] = useState(null);
  const [checkingNextSlot, setCheckingNextSlot] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const weekDates = getWeekDates(weekStart);

  // Fetch slots for the entire week
  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const start = new Date(weekStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 7);
        end.setHours(23, 59, 59, 999);

        const q = query(
          collection(db, 'timeSlots'),
          where('dateTime', '>=', Timestamp.fromDate(start)),
          where('dateTime', '<=', Timestamp.fromDate(end)),
          orderBy('dateTime', 'asc'),
        );

        const snap = await getDocs(q);
        let fetchedSlots = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Client-side filter for lesson type to avoid composite index requirement
        if (selectedType) {
          fetchedSlots = fetchedSlots.filter(s => s.lessonType === selectedType);
        }

        setSlots(fetchedSlots);
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [weekStart]); // Removed selectedType dependency

  const navigateWeek = direction => {
    const newWeek = new Date(weekStart);
    newWeek.setDate(newWeek.getDate() + direction * 7);
    setWeekStart(newWeek);

    // Auto-select the middle date of the new week (index 3 / Thursday)
    const middleDate = new Date(newWeek);
    middleDate.setDate(newWeek.getDate() + 3);
    setSelectedDate(middleDate);
  };

  const handleSlotClick = slot => {
    if (slot.status !== SLOT_STATUS.AVAILABLE) return;
    setSelectedSlot(slot);
    setSelectedLessonType(null);
    setNextSlot(null);
    setShowModal(true);
  };

  const handleLessonTypeSelect = async (type) => {
    setSelectedLessonType(type);
    if (type.duration > 60) {
      setCheckingNextSlot(true);
      try {
        const nextTime = new Date(selectedSlot.dateTime.toDate());
        nextTime.setHours(nextTime.getHours() + 1);
        
        // Find next slot
        const q = query(
          collection(db, 'timeSlots'),
          where('dateTime', '==', Timestamp.fromDate(nextTime)),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const s = { id: snap.docs[0].id, ...snap.docs[0].data() };
          if (s.status === SLOT_STATUS.AVAILABLE) {
            setNextSlot(s);
          } else {
            setNextSlot({ error: 'occupied' });
          }
        } else {
          setNextSlot({ error: 'missing' });
        }
      } catch (err) {
        console.error('Error checking next slot:', err);
      } finally {
        setCheckingNextSlot(false);
      }
    } else {
      setNextSlot(null);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !selectedLessonType || !user) return;
    setBooking(true);
    try {
      // Use transaction to prevent double-booking
      await runTransaction(db, async transaction => {
        // Verify primary slot
        const slotDoc = await transaction.get(doc(db, 'timeSlots', selectedSlot.id));
        if (!slotDoc.exists() || slotDoc.data().status !== SLOT_STATUS.AVAILABLE) {
          throw new Error('This time slot is no longer available');
        }

        // Verify next slot if needed
        let nextSlotDoc = null;
        if (selectedLessonType.duration > 60) {
          if (!nextSlot || nextSlot.error) {
            throw new Error('The required second hour for this lesson is not available.');
          }
          nextSlotDoc = await transaction.get(doc(db, 'timeSlots', nextSlot.id));
          if (!nextSlotDoc.exists() || nextSlotDoc.data().status !== SLOT_STATUS.AVAILABLE) {
            throw new Error('The required second hour is no longer available.');
          }
        }

        // Update primary slot
        transaction.update(doc(db, 'timeSlots', selectedSlot.id), {
          status: SLOT_STATUS.BOOKED,
          bookedBy: user.uid,
          bookedAt: Timestamp.now(),
          lessonType: selectedLessonType.id,
          duration: selectedLessonType.duration,
        });

        // Update next slot if overlap
        if (nextSlotDoc) {
          transaction.update(doc(db, 'timeSlots', nextSlot.id), {
            status: SLOT_STATUS.BOOKED,
            bookedBy: user.uid,
            bookedAt: Timestamp.now(),
            lessonType: 'overlap-block',
            duration: 0,
            blockedBy: selectedSlot.id
          });
        }

        // Create appointment
        const appointmentRef = doc(collection(db, 'appointments'));
        transaction.set(appointmentRef, {
          userId: user.uid,
          userName: userProfile?.displayName || user.displayName || '',
          userEmail: user.email || '',
          slotId: selectedSlot.id,
          nextSlotId: nextSlot?.id || null, // Track the second slot too
          lessonType: selectedLessonType.id,
          duration: selectedLessonType.duration,
          dateTime: selectedSlot.dateTime,
          status: 'confirmed',
          createdAt: Timestamp.now(),
        });
      });

      // Email notification
      const slotTime = selectedSlot.dateTime?.toDate ? selectedSlot.dateTime.toDate() : new Date(selectedSlot.dateTime);
      const emailParams = {
        from_name: userProfile?.displayName || user.displayName || 'A student',
        from_email: user.email,
        message: `Booked a new session: ${selectedLessonType.name} on ${formatFullDate(slotTime)} at ${formatTime(slotTime)} (Duration: ${selectedLessonType.duration}m)`,
        to_name: 'Dr. Li'
      };

      emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID,
        emailParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      ).catch(err => console.error('Booking email notification failed:', err));

      setBookingSuccess(true);
      // Refresh local slots
      await fetchSlots(); 
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.message || 'Failed to book. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
    setBookingSuccess(false);
  };

  // Filter slots for the bottom detail view
  const selectedDateSlots = slots.filter(s => {
    const d = s.dateTime?.toDate ? s.dateTime.toDate() : new Date(s.dateTime);
    return isSameDay(d, selectedDate);
  });

  return (
    <>
      <SEO title="Book a Session | Dr. Yirui Li" url="/booking" />
      <section className="min-h-screen bg-dark-900 pt-36 pb-16 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.03)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-10 animate-fadeInUp">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center space-x-2 text-gray-500 hover:text-gold text-xs uppercase tracking-widest transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">Book a Session</h1>
              <p className="text-gray-500 text-sm mt-2">Select a date and time to schedule your lesson.</p>
            </div>
            <Calendar className="w-8 h-8 text-gold/30 hidden md:block" />
          </div>

          {/* Removed Lesson Type Filter */}

          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <button onClick={() => navigateWeek(-1)} className="p-2 text-gray-400 hover:text-gold transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-gray-300 text-sm tracking-wider">
              {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
            </span>
            <button onClick={() => navigateWeek(1)} className="p-2 text-gray-400 hover:text-gold transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-2 mb-10 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            {weekDates.map((date, idx) => {
              const isSelected = isSameDay(date, selectedDate);
              const today = isToday(date);
              const isDisabled = isPast(date) || today;

              const dayAvailableCount = slots.filter(s => {
                const d = s.dateTime?.toDate ? s.dateTime.toDate() : new Date(s.dateTime);
                return s.status === SLOT_STATUS.AVAILABLE && isSameDay(d, date);
              }).length;

              return (
                <button
                  key={idx}
                  onClick={() => !isDisabled && setSelectedDate(date)}
                  disabled={isDisabled}
                  className={`h-24 px-1 rounded-sm flex flex-col items-center justify-center transition-all duration-300 border relative group ${
                    isSelected
                      ? 'border-gold bg-gold/10 text-gold shadow-[0_0_20px_rgba(197,160,89,0.1)]'
                      : isDisabled
                        ? 'border-white/5 text-gray-600 cursor-not-allowed'
                        : 'border-white/10 text-gray-300 hover:border-gold/30 hover:text-white'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                  </div>
                  <div className={`text-lg font-serif transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>{date.getDate()}</div>

                  {!isDisabled ? (
                    dayAvailableCount > 0 ? (
                      <div className={`mt-1.5 text-[9px] font-medium uppercase tracking-widest ${isSelected ? 'text-gold' : 'text-gold/60 group-hover:text-gold'}`}>
                        <span className="mr-1.5">{dayAvailableCount}</span>
                        {dayAvailableCount === 1 ? 'Slot' : 'Slots'}
                      </div>
                    ) : !loadingSlots ? (
                      <div className="mt-1.5 text-[9px] text-gray-700 uppercase tracking-widest">Full</div>
                    ) : (
                      <div className="h-[13px] mt-1.5" />
                    )
                  ) : (
                    <div className="h-[13px] mt-1.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected date + Slots */}
          <div className="animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            <h2 className="font-serif text-lg text-white mb-6">{formatFullDate(selectedDate)}</h2>

            {loadingSlots ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selectedDateSlots.length === 0 ? (
              <div className="text-center py-12 glass-card rounded-sm border border-white/[0.06]">
                <Clock className="w-8 h-8 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No available time slots for this date.</p>
                <p className="text-gray-600 text-xs mt-2">Try selecting a different date or lesson type.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedDateSlots.map(slot => {
                  const lt = getLessonTypeById(slot.lessonType);
                  const isAvailable = slot.status === SLOT_STATUS.AVAILABLE;
                  const slotTime = slot.dateTime?.toDate ? slot.dateTime.toDate() : new Date(slot.dateTime);
                  return (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      disabled={!isAvailable}
                      className={`p-5 rounded-sm border text-left transition-all duration-300 group ${
                        isAvailable ? 'border-gold/30 hover:border-gold hover:bg-gold/5 cursor-pointer' : 'border-white/[0.06] opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-serif text-lg group-hover:text-gold transition-colors">{formatTime(slotTime)}</span>
                        <span
                          className={`text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-sm border ${
                            isAvailable ? 'text-gold border-gold/30 bg-gold/5' : 'text-gray-500 border-white/5 bg-white/5'
                          }`}
                        >
                          {isAvailable ? 'Available' : 'Booked'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{isAvailable ? 'Open Slot' : (slot.lessonType === 'overlap-block' ? 'Private Lesson' : (lt?.name || 'Private Lesson'))}</p>
                      <p className="text-gray-600 text-xs mt-1">1 hour unit</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Booking Confirmation Modal */}
        {showModal && selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-fadeIn">
            <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={closeModal} />
            <div className="relative bg-dark-800 border border-white/10 rounded-sm p-8 max-w-md w-full animate-scaleIn shadow-2xl">
              {bookingSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="font-serif text-xl text-white mb-2">Session Booked!</h3>
                  <p className="text-gray-400 text-sm mb-6">Your appointment has been confirmed.</p>
                  <div className="flex space-x-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 border border-white/10 text-gray-300 py-3 text-xs uppercase tracking-widest hover:border-white/30 transition-colors"
                    >
                      Continue Browsing
                    </button>
                    <button
                      onClick={() => navigate('/appointments')}
                      className="flex-1 border border-gold bg-gold text-dark-900 py-3 text-xs uppercase tracking-widest hover:bg-gold-light transition-colors"
                    >
                      View Appointments
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-xl text-white">Confirm Booking</h3>
                    <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-8">
                    {/* LESSON TYPE SELECTOR */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">Choose Lesson Category</label>
                      <div className="grid grid-cols-1 gap-2">
                        {LESSON_TYPES.map(type => (
                          <button
                            key={type.id}
                            onClick={() => handleLessonTypeSelect(type)}
                            className={`p-3 text-left border rounded-sm transition-all duration-300 ${
                              selectedLessonType?.id === type.id 
                                ? 'border-gold bg-gold/10 text-gold' 
                                : 'border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{type.name}</span>
                              <span className="text-[10px] opacity-60">{type.duration}m</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedLessonType && (
                      <div className="animate-fadeIn p-4 bg-white/5 border border-white/10 rounded-sm">
                        <div className="flex justify-between py-1">
                          <span className="text-gray-500 text-xs">Date</span>
                          <span className="text-white text-xs lowercase">{selectedSlot.dateTime?.toDate && formatFullDate(selectedSlot.dateTime.toDate())}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-500 text-xs">Time</span>
                          <span className="text-white text-xs">{selectedSlot.dateTime?.toDate && formatTime(selectedSlot.dateTime.toDate())}</span>
                        </div>
                        
                        {/* Overlap Check UI */}
                        {selectedLessonType.duration > 60 && (
                          <div className="mt-2 pt-2 border-t border-white/5">
                            {checkingNextSlot ? (
                              <p className="text-[10px] text-gray-500 animate-pulse italic">Checking teacher availability for the second hour...</p>
                            ) : nextSlot?.error ? (
                              <p className="text-[10px] text-[#d9736c] flex items-center">
                                <X className="w-3 h-3 mr-1" />
                                {nextSlot.error === 'occupied' ? 'Conflict: The next hour is already booked.' : 'The next hour slot has not been opened by the teacher.'}
                              </p>
                            ) : nextSlot ? (
                              <p className="text-[10px] text-gold flex items-center">
                                <Check className="w-3 h-3 mr-1" />
                                Confirmed: 2-hour slot is available.
                              </p>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 border border-white/10 text-gray-300 py-3 text-xs uppercase tracking-widest hover:border-white/30 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={booking || !selectedLessonType || (selectedLessonType.duration > 60 && (!nextSlot || nextSlot.error))}
                      className={`flex-1 border py-3 text-xs uppercase tracking-widest transition-all duration-300 ${
                        booking || !selectedLessonType || (selectedLessonType.duration > 60 && (!nextSlot || nextSlot.error))
                          ? 'border-white/10 bg-white/5 text-gray-600 cursor-not-allowed'
                          : 'border-gold bg-gold text-dark-900 hover:bg-gold-light'
                      }`}
                    >
                      {booking ? 'Booking...' : 'Confirm Book'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Booking;
