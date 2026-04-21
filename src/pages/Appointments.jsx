import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, X, AlertTriangle, Plus, ArrowLeft } from 'lucide-react';
import { collection, query, where, getDocs, doc, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, formatTime, getLessonTypeById } from '../data/bookingData';
import SEO from '../components/SEO';
import emailjs from '@emailjs/browser';

const Appointments = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'appointments'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        fetched.sort((a, b) => {
          const dta = a.dateTime?.toDate ? a.dateTime.toDate() : new Date(0);
          const dtb = b.dateTime?.toDate ? b.dateTime.toDate() : new Date(0);
          return dta - dtb;
        });
        setAppointments(fetched);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  const now = new Date();
  const upcomingAppointments = appointments.filter(a => a.status === 'confirmed' && a.dateTime?.toDate && a.dateTime.toDate() >= now);
  const pastAppointments = appointments.filter(a => a.status !== 'confirmed' || (a.dateTime?.toDate && a.dateTime.toDate() < now));

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      // Find all slots with the same dateTime to release them all
      const batch = writeBatch(db);

      // Update appointment status
      batch.update(doc(db, 'appointments', cancelTarget.id), {
        status: 'cancelled',
        cancelledAt: Timestamp.now(),
      });

      // Release the primary slot
      if (cancelTarget.slotId) {
        batch.update(doc(db, 'timeSlots', cancelTarget.slotId), {
          status: 'available',
          bookedBy: null,
          bookedAt: null,
          lessonType: null,
          duration: 60,
        });
      }

      // Release all blocked slots if they exist
      if (cancelTarget.blockedSlotIds && Array.isArray(cancelTarget.blockedSlotIds)) {
        cancelTarget.blockedSlotIds.forEach(bId => {
          batch.update(doc(db, 'timeSlots', bId), {
            status: 'available',
            bookedBy: null,
            bookedAt: null,
            lessonType: null,
            duration: 60,
            blockedBy: null,
          });
        });
      }

      // Fallback for legacy nextSlotId
      if (cancelTarget.nextSlotId) {
        batch.update(doc(db, 'timeSlots', cancelTarget.nextSlotId), {
          status: 'available',
          bookedBy: null,
          bookedAt: null,
          lessonType: null,
          duration: 60,
          blockedBy: null,
        });
      }

      await batch.commit();

      // Update local state
      setAppointments(prev => prev.map(a => (a.id === cancelTarget.id ? { ...a, status: 'cancelled' } : a)));
      // Send Email Notification to Admin
      const apptDate = cancelTarget.dateTime?.toDate ? cancelTarget.dateTime.toDate() : new Date(cancelTarget.dateTime);
      const lesson = getLessonTypeById(cancelTarget.lessonType);

      const emailParams = {
        from_name: user?.displayName || 'A student',
        from_email: user?.email || '',
        message: `Dear Dr. Li,\n\nThis is an automated notification to inform you that ${user?.displayName || 'a student'} has cancelled their upcoming session.\n\nSession Details:\n- Lesson: ${lesson?.name || cancelTarget.lessonType}\n- Date: ${formatDate(apptDate)}\n- Time: ${formatTime(apptDate)}\n\nThe schedule has been updated accordingly. Thank you.`,
        to_name: 'Dr. Li',
      };
      emailjs
        .send(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID, emailParams, import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
        .catch(err => console.error('Cancellation email notification failed:', err));

      setCancelTarget(null);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      showToast('Failed to cancel. Please try again.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const renderAppointmentCard = (appt, showCancel = false) => {
    const lt = getLessonTypeById(appt.lessonType);
    const dateTime = appt.dateTime?.toDate ? appt.dateTime.toDate() : null;
    const isCancelled = appt.status === 'cancelled';

    return (
      <div
        key={appt.id}
        className={`glass-card p-6 rounded-sm border transition-all duration-300 ${
          isCancelled ? 'border-white/[0.04] opacity-50' : 'border-white/[0.06] hover:border-gold/20'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-white font-serif text-lg">{lt?.name || appt.lessonType}</span>
              {isCancelled && <span className="text-[10px] uppercase tracking-widest text-[#d9736c] bg-[#d9736c]/10 px-2 py-0.5 rounded-sm">Cancelled</span>}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{dateTime ? formatDate(dateTime) : '—'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{dateTime ? formatTime(dateTime) : '—'}</span>
              </span>
            </div>
            <p className="text-gray-600 text-xs mt-2">{appt.duration} minutes</p>
          </div>
          {showCancel && !isCancelled && (
            <button onClick={() => setCancelTarget(appt)} className="text-gray-500 hover:text-[#d9736c] transition-colors p-1" title="Cancel appointment">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO title="My Appointments | Dr. Yirui Li" url="/appointments" />
      <section className="min-h-screen bg-dark-900 pt-28 pb-12 relative flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.03)_0%,transparent_70%)]" />
        </div>
        <div className="max-w-5xl mx-auto px-6 md:px-12 w-full z-10 relative">
          <div className="sticky top-[64px] md:top-[80px] z-30 bg-dark-900/95 backdrop-blur-md pt-6 pb-6 -mx-6 px-6 md:-mx-12 md:px-12">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6 animate-fadeInUp shrink-0">
              <Link
                to="/dashboard"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-gold/30 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400" />
              </Link>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">My Appointments</h1>
                <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mt-1">Schedule overview</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-8 border-b border-white/[0.06] animate-fadeInUp shrink-0" style={{ animationDelay: '100ms' }}>
              {[
                { id: 'upcoming', label: 'Upcoming', count: upcomingAppointments.length },
                { id: 'past', label: 'Past', count: pastAppointments.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-xs uppercase tracking-widest transition-all duration-300 border-b-2 -mb-px ${
                    activeTab === tab.id ? 'border-gold text-gold' : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && <span className="ml-2 text-[10px] bg-white/5 px-2 py-0.5 rounded-full">{tab.count}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 pb-8 flex flex-col min-h-0">
            {/* Content */}
            <div className="animate-fadeInUp flex-1 min-h-0" style={{ animationDelay: '200ms' }}>
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activeTab === 'upcoming' ? (
                upcomingAppointments.length === 0 ? (
                  <div className="text-center py-16 glass-card rounded-sm border border-white/[0.06]">
                    <Calendar className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No upcoming appointments</p>
                    <p className="text-gray-600 text-sm mb-6">Book a session to get started.</p>
                    <Link
                      to="/booking"
                      className="inline-flex items-center space-x-2 border border-gold text-gold px-6 py-3 text-xs uppercase tracking-widest hover:bg-gold hover:text-dark-900 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Book a Session</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">{upcomingAppointments.map(appt => renderAppointmentCard(appt, true))}</div>
                )
              ) : pastAppointments.length === 0 ? (
                <div className="text-center py-16 glass-card rounded-sm border border-white/[0.06]">
                  <Clock className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No past appointments yet.</p>
                </div>
              ) : (
                <div className="space-y-4">{pastAppointments.map(appt => renderAppointmentCard(appt, false))}</div>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {cancelTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-fadeIn">
            <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setCancelTarget(null)} />
            <div className="relative bg-dark-800 border border-white/10 rounded-sm p-8 max-w-md w-full animate-scaleIn shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#d9736c]/10 border border-[#d9736c]/30 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-[#d9736c]" />
                </div>
                <h3 className="font-serif text-xl text-white mb-2">Cancel Appointment?</h3>
                <p className="text-gray-400 text-sm">
                  This will cancel your <span className="text-white">{getLessonTypeById(cancelTarget.lessonType)?.name || cancelTarget.lessonType}</span> on{' '}
                  <span className="text-white">{cancelTarget.dateTime?.toDate && formatDate(cancelTarget.dateTime.toDate())}</span>.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setCancelTarget(null)}
                  className="flex-1 border border-white/10 text-gray-300 py-3 text-xs uppercase tracking-widest hover:border-white/30 transition-colors"
                >
                  Keep It
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 border border-[#d9736c] bg-[#d9736c] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#c0625b] transition-colors"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Appointments;
