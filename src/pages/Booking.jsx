import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock, Music, X, Check, ArrowLeft, AlertTriangle } from 'lucide-react';
import { collection, query, where, getDocs, doc, runTransaction, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedLessonType, setSelectedLessonType] = useState(null);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const weekDates = getWeekDates(weekStart);

  const fetchSlots = React.useCallback(async () => {
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

      setSlots(fetchedSlots);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, [weekStart]);

  // Fetch slots for the entire week
  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const navigateWeek = direction => {
    const newWeek = new Date(weekStart);
    newWeek.setDate(newWeek.getDate() + direction * 7);
    setWeekStart(newWeek);

    // Auto-select a valid date in the new week
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const middleDate = new Date(newWeek);
    middleDate.setDate(newWeek.getDate() + 3);
    middleDate.setHours(0, 0, 0, 0);

    // If middle date of new week is today or past, default to tomorrow
    if (middleDate <= now) {
      // Only select tomorrow if it's actually within the new week range
      // Otherwise, we'll just stick to the middle date (which will be disabled)
      const weekEnd = new Date(newWeek);
      weekEnd.setDate(newWeek.getDate() + 7);
      if (tomorrow >= newWeek && tomorrow < weekEnd) {
        setSelectedDate(tomorrow);
      } else {
        setSelectedDate(middleDate);
      }
    } else {
      setSelectedDate(middleDate);
    }
  };

  const handleSlotClick = slot => {
    if (slot.status !== SLOT_STATUS.AVAILABLE) return;
    setSelectedSlot(slot);
    setSelectedLessonType(null);
    setBlockedSlots([]);
    setSlotsError(null);
    setBookingStep(1);
    setSelectedFormat(null);
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleLessonTypeSelect = async type => {
    setSelectedLessonType(type);
    setBookingStep(4); // Summary/Confirm step

    const slotsReq = Math.ceil(type.duration / 60);
    if (slotsReq > 1) {
      setCheckingSlots(true);
      setSlotsError(null);
      setBlockedSlots([]);
      try {
        const slotsToBlock = [];
        let hasError = false;

        for (let i = 1; i < slotsReq; i++) {
          const nextTime = new Date(selectedSlot.dateTime.toDate());
          nextTime.setHours(nextTime.getHours() + i, 0, 0, 0);

          const q = query(collection(db, 'timeSlots'), where('dateTime', '==', Timestamp.fromDate(nextTime)), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const s = { id: snap.docs[0].id, ...snap.docs[0].data() };
            if (s.status === SLOT_STATUS.AVAILABLE) {
              slotsToBlock.push(s);
            } else {
              setSlotsError(`Conflict: The hour at ${formatTime(nextTime)} is already booked.`);
              hasError = true;
              break;
            }
          } else {
            setSlotsError(`The teacher has not opened the slot at ${formatTime(nextTime)}.`);
            hasError = true;
            break;
          }
        }

        if (!hasError) {
          setBlockedSlots(slotsToBlock);
        }
      } catch (err) {
        console.error('Error checking slots:', err);
        setSlotsError('Error checking slot availability.');
      } finally {
        setCheckingSlots(false);
      }
    } else {
      setBlockedSlots([]);
      setSlotsError(null);
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

        // Verify extra slots if needed
        const slotsReq = Math.ceil(selectedLessonType.duration / 60);
        const verifiedBlockedDocs = [];
        if (slotsReq > 1) {
          if (slotsError || blockedSlots.length !== slotsReq - 1) {
            throw new Error('The required consecutive hours for this lesson are not available.');
          }
          for (const bSlot of blockedSlots) {
            const bDoc = await transaction.get(doc(db, 'timeSlots', bSlot.id));
            if (!bDoc.exists() || bDoc.data().status !== SLOT_STATUS.AVAILABLE) {
              throw new Error('One of the required consecutive hours is no longer available.');
            }
            verifiedBlockedDocs.push(bDoc);
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

        // Update blocked slots
        const blockedIds = [];
        for (const bDoc of verifiedBlockedDocs) {
          transaction.update(bDoc.ref, {
            status: SLOT_STATUS.BOOKED,
            bookedBy: user.uid,
            bookedAt: Timestamp.now(),
            lessonType: 'overlap-block',
            duration: 0,
            blockedBy: selectedSlot.id,
          });
          blockedIds.push(bDoc.id);
        }

        // Create appointment
        const appointmentRef = doc(collection(db, 'appointments'));
        transaction.set(appointmentRef, {
          userId: user.uid,
          userName: userProfile?.displayName || user.displayName || '',
          userEmail: user.email || '',
          slotId: selectedSlot.id,
          blockedSlotIds: blockedIds,
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
        message: `Dear Dr. Li,\n\nThis is an automated notification to inform you that ${userProfile?.displayName || user.displayName || 'a student'} has just booked a new session.\n\nBooking Details:\n- Lesson: ${selectedLessonType.name}\n- Date: ${formatFullDate(slotTime)}\n- Time: ${formatTime(slotTime)}\n- Duration: ${selectedLessonType.duration} minutes\n\nPlease review your updated schedule. Thank you!`,
        to_name: 'Dr. Li',
      };
      emailjs
        .send(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID, emailParams, import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
        .catch(err => console.error('Booking email notification failed:', err));

      setBookingSuccess(true);
      // Refresh local slots
      await fetchSlots();
    } catch (err) {
      console.error('Booking error:', err);
      showToast(err.message || 'Failed to book. Please try again.', 'error');
    } finally {
      setBooking(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
    setBookingSuccess(false);
    setBookingStep(1);
    setSelectedFormat(null);
    setSelectedCategory(null);
    setSelectedLessonType(null);
  };

  // Group LESSON_TYPES for UI
  const availableFormats = [...new Set(LESSON_TYPES.filter(lt => !lt.isLegacy).map(lt => lt.format))];
  const categoriesForFormat = selectedFormat
    ? [...new Set(LESSON_TYPES.filter(lt => !lt.isLegacy && lt.format === selectedFormat).map(lt => lt.category))]
    : [];
  const durationsForCategory =
    selectedFormat && selectedCategory ? LESSON_TYPES.filter(lt => !lt.isLegacy && lt.format === selectedFormat && lt.category === selectedCategory) : [];

  // Filter slots for the bottom detail view
  const selectedDateSlots = slots.filter(s => {
    const d = s.dateTime?.toDate ? s.dateTime.toDate() : new Date(s.dateTime);
    return isSameDay(d, selectedDate);
  });

  return (
    <>
      <SEO title="Book a Session | Dr. Yirui Li" url="/booking" />
      <section className="flex-1 bg-dark-900 pt-36 pb-8 relative flex flex-col overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.03)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 md:px-12 w-full flex-1 flex flex-col z-10 min-h-0">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6 animate-fadeInUp shrink-0">
            <Link
              to="/dashboard"
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-gold/30 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">Book a Session</h1>
              <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mt-1">Schedule your lesson</p>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6 animate-fadeInUp shrink-0" style={{ animationDelay: '100ms' }}>
            {(() => {
              const now = new Date();
              const day = now.getDay();
              const currentSunday = new Date(now);
              currentSunday.setDate(now.getDate() - day);
              currentSunday.setHours(0, 0, 0, 0);
              const isFirstWeek = weekStart.getTime() <= currentSunday.getTime();

              return (
                <button
                  onClick={() => !isFirstWeek && navigateWeek(-1)}
                  disabled={isFirstWeek}
                  className={`p-2 transition-colors ${isFirstWeek ? 'text-gray-800 cursor-not-allowed opacity-30' : 'text-gray-400 hover:text-gold'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              );
            })()}
            <span className="text-gray-300 text-sm tracking-wider">
              {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
            </span>
            <button onClick={() => navigateWeek(1)} className="p-2 text-gray-400 hover:text-gold transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-2 mb-2 animate-fadeInUp shrink-0" style={{ animationDelay: '300ms' }}>
            {weekDates.map((date, idx) => {
              const isSelected = isSameDay(date, selectedDate);
              const today = isToday(date);
              const isDisabled = isPast(date) || today;

              const daySlots = slots.filter(s => {
                const d = s.dateTime?.toDate ? s.dateTime.toDate() : new Date(s.dateTime);
                return isSameDay(d, date);
              });

              const dayAvailableCount = daySlots.filter(s => s.status === SLOT_STATUS.AVAILABLE).length;
              const hasSlots = daySlots.length > 0;

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
                      <div
                        className={`mt-1.5 text-[9px] font-bold uppercase tracking-tighter leading-tight text-center whitespace-nowrap ${isSelected ? 'text-gold' : 'text-gold/80'}`}
                      >
                        {dayAvailableCount}
                        <span className="ml-[3px]">{dayAvailableCount === 1 ? 'Slot' : 'Slots'}</span>
                      </div>
                    ) : !loadingSlots ? (
                      <div className="mt-1.5 text-[9px] text-gray-700 uppercase tracking-wider leading-tight text-center">{hasSlots ? 'Full' : 'Off'}</div>
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
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8 flex flex-col min-h-0 mt-8">
            <div className="animate-fadeInUp flex-1 min-h-0" style={{ animationDelay: '400ms' }}>
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
                  const slotTime = slot.dateTime?.toDate ? slot.dateTime.toDate() : new Date(slot.dateTime);
                  const isAvailable = slot.status === SLOT_STATUS.AVAILABLE && !isPast(slotTime);
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
                      <p className="text-gray-400 text-sm">
                        {isAvailable ? 'Open Slot' : slot.lessonType === 'overlap-block' ? 'Extended Session Block' : lt?.name || 'Private Lesson'}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">1 hour unit</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
                    <h3 className="font-serif text-xl text-white">
                      {bookingStep === 1 && 'Select Format'}
                      {bookingStep === 2 && 'Select Category'}
                      {bookingStep === 3 && 'Select Duration'}
                      {bookingStep === 4 && 'Confirm Booking'}
                    </h3>
                    <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-8">
                    {/* STEP 1: FORMAT */}
                    {bookingStep === 1 && (
                      <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                        {availableFormats.map(fmt => (
                          <button
                            key={fmt}
                            onClick={() => {
                              setSelectedFormat(fmt);
                              setBookingStep(2);
                            }}
                            className="p-6 rounded-sm border border-white/10 glass-card hover:border-gold hover:bg-gold/5 flex flex-col items-center justify-center text-center transition-all duration-300"
                          >
                            <span className="text-white font-serif text-lg mb-2">{fmt}</span>
                            <span className="text-xs text-gray-500">{fmt === 'In-Person' ? 'Studio / On-Site' : 'Via Zoom'}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* STEP 2: CATEGORY */}
                    {bookingStep === 2 && (
                      <div className="grid grid-cols-1 gap-2 animate-fadeInRight">
                        {categoriesForFormat.map(cat => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setBookingStep(3);
                            }}
                            className="p-4 text-left border border-white/5 rounded-sm hover:border-gold/50 hover:bg-white/5 transition-all duration-300"
                          >
                            <span className="text-white text-sm font-medium">{cat}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* STEP 3: DURATION */}
                    {bookingStep === 3 && (
                      <div className="grid grid-cols-1 gap-2 animate-fadeInRight">
                        {durationsForCategory.map(type => (
                          <button
                            key={type.id}
                            onClick={() => handleLessonTypeSelect(type)}
                            className="p-4 text-left border border-white/5 rounded-sm hover:border-gold hover:bg-gold/10 transition-all duration-300 flex justify-between items-center"
                          >
                            <span className="text-white text-sm font-medium">{type.duration} min</span>
                            <span className="text-[10px] uppercase tracking-widest text-gold opacity-80">{type.shortLabel}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* STEP 4: SUMMARY & OVERLAP CHECK */}
                    {bookingStep === 4 && selectedLessonType && (
                      <div className="animate-fadeIn p-5 rounded-sm bg-black/40 border border-white/10 shadow-inner">
                        <div className="mb-4 pb-4 border-b border-white/5">
                          <h4 className="text-gold font-serif text-lg mb-1">{selectedLessonType.name}</h4>
                          <div className="flex space-x-3 text-xs text-gray-400">
                            <span>{selectedLessonType.format}</span>
                            <span>•</span>
                            <span>{selectedLessonType.duration} mins</span>
                          </div>
                        </div>

                        <div className="flex justify-between py-1.5">
                          <span className="text-gray-500 text-xs uppercase tracking-widest">Date</span>
                          <span className="text-white text-sm">{selectedSlot.dateTime?.toDate && formatFullDate(selectedSlot.dateTime.toDate())}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-gray-500 text-xs uppercase tracking-widest">Time</span>
                          <span className="text-white text-sm">{selectedSlot.dateTime?.toDate && formatTime(selectedSlot.dateTime.toDate())}</span>
                        </div>

                        {/* Overlap Check UI */}
                        {Math.ceil(selectedLessonType.duration / 60) > 1 && (
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">Duration Extends Past 1 Hour</span>
                            {checkingSlots ? (
                              <p className="text-[11px] text-gold/70 animate-pulse italic">Checking consecutive availability...</p>
                            ) : slotsError ? (
                              <p className="text-[11px] text-[#d9736c] flex items-center bg-[#d9736c]/10 p-2 rounded-sm border border-[#d9736c]/20">
                                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                                {slotsError}
                              </p>
                            ) : (
                              <p className="text-[11px] text-gold flex items-center bg-gold/5 p-2 rounded-sm border border-gold/20">
                                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                                Confirmed: All {Math.ceil(selectedLessonType.duration / 60)} hours are available.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 mt-8">
                    {bookingStep > 1 && !booking && (
                      <button
                        onClick={() => {
                          if (bookingStep === 4) setBookingStep(3);
                          else if (bookingStep === 3) setBookingStep(2);
                          else if (bookingStep === 2) setBookingStep(1);
                        }}
                        className="flex-1 border border-white/10 text-gray-300 py-3 text-xs uppercase tracking-widest hover:bg-white/5 transition-colors"
                      >
                        Back
                      </button>
                    )}
                    {bookingStep === 1 && (
                      <button
                        onClick={closeModal}
                        className="flex-1 border border-white/10 text-gray-300 py-3 text-xs uppercase tracking-widest hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {bookingStep === 4 && (
                      <button
                        onClick={handleConfirmBooking}
                        disabled={booking || slotsError || checkingSlots}
                        className={`flex-1 border py-3 text-xs uppercase tracking-widest transition-all duration-300 ${
                          booking || slotsError || checkingSlots
                            ? 'border-white/10 bg-white/5 text-gray-600 cursor-not-allowed'
                            : 'border-gold bg-gold text-dark-900 hover:bg-gold-light'
                        }`}
                      >
                        {booking ? 'Booking...' : 'Confirm Book'}
                      </button>
                    )}
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
