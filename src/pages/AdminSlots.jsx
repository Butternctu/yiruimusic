import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Trash2, ArrowLeft, Clock, ChevronDown, Check, X, Repeat } from 'lucide-react';
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, orderBy, Timestamp, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { LESSON_TYPES, SLOT_STATUS, formatDate, formatTime, getLessonTypeById } from '../data/bookingData';
import { DatePicker, TimePicker } from '../components/DateTimePicker';
import SEO from '../components/SEO';

const AdminSlots = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('list'); // list | create | bulk
  const [slotFilter, setSlotFilter] = useState('upcoming'); // upcoming | past

  // Single slot creation
  const [newSlot, setNewSlot] = useState({
    date: '',
    time: '',
    lessonType: LESSON_TYPES[0].id,
    duration: LESSON_TYPES[0].duration,
  });
  const [creating, setCreating] = useState(false);

  // Bulk creation
  const [bulkData, setBulkData] = useState({
    startDate: '',
    endDate: '',
    days: [1, 2, 3, 4, 5], // Mon-Fri by default
    startTime: '09:00',
    endTime: '17:00',
    interval: 60,
    lessonType: LESSON_TYPES[0].id,
  });
  const [bulkCreating, setBulkCreating] = useState(false);
  const [bulkResult, setBulkResult] = useState('');
  const [cleaning, setCleaning] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  useEffect(() => {
    fetchSlots(slotFilter);
  }, [slotFilter]);

  const fetchSlots = async (mode = 'upcoming') => {
    setLoading(true);
    try {
      const now = new Date();
      const q = mode === 'upcoming'
        ? query(
            collection(db, 'timeSlots'),
            where('dateTime', '>=', Timestamp.fromDate(now)),
            orderBy('dateTime', 'asc')
          )
        : query(
            collection(db, 'timeSlots'),
            where('dateTime', '<', Timestamp.fromDate(now)),
            orderBy('dateTime', 'desc'),
            limit(100)
          );
      const snap = await getDocs(q);
      let fetchedSlots = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Client-side filtering for 'past' to avoid mandatory composite index errors
      if (mode === 'past') {
        fetchedSlots = fetchedSlots.filter(s => s.status === SLOT_STATUS.BOOKED);
      }
      
      setSlots(fetchedSlots);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupSlots = async () => {
    setShowCleanupModal(false);
    setCleaning(true);
    try {
      const q = query(collection(db, 'timeSlots'), where('status', '==', SLOT_STATUS.AVAILABLE));
      const snap = await getDocs(q);
      const deletions = snap.docs.map(d => deleteDoc(doc(db, 'timeSlots', d.id)));
      await Promise.all(deletions);
      await fetchSlots(slotFilter);
    } catch (err) {
      console.error('Cleanup error:', err);
      alert('Failed to cleanup slots.');
    } finally {
      setCleaning(false);
    }
  };

  // ── Single slot creation ──
  const handleCreateSlot = async e => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.time) return;
    setCreating(true);
    try {
      const dateTime = new Date(`${newSlot.date}T${newSlot.time}:00`);
      await addDoc(collection(db, 'timeSlots'), {
        dateTime: Timestamp.fromDate(dateTime),
        duration: 60,
        lessonType: null,
        status: SLOT_STATUS.AVAILABLE,
        bookedBy: null,
        bookedAt: null,
        createdAt: Timestamp.now(),
      });
      setNewSlot({ date: '', time: '' });
      await fetchSlots(slotFilter);
    } catch (err) {
      console.error('Error creating slot:', err);
      alert('Failed to create slot.');
    } finally {
      setCreating(false);
    }
  };

  // ── Bulk slot creation ──
  const handleBulkCreate = async e => {
    e.preventDefault();
    if (!bulkData.startDate || !bulkData.endDate) return;
    setBulkCreating(true);
    setBulkResult('');
    try {
      const start = new Date(bulkData.startDate);
      const end = new Date(bulkData.endDate);
      let count = 0;

      const current = new Date(start);
      while (current <= end) {
        if (bulkData.days.includes(current.getDay())) {
          const [startHour, startMin] = bulkData.startTime.split(':').map(Number);
          const [endHour, endMin] = bulkData.endTime.split(':').map(Number);
          const dayStart = startHour * 60 + startMin;
          const dayEnd = endHour * 60 + endMin;

          for (let minuteOfDay = dayStart; minuteOfDay + 60 <= dayEnd; minuteOfDay += 60) {
            const slotDate = new Date(current);
            slotDate.setHours(Math.floor(minuteOfDay / 60), minuteOfDay % 60, 0, 0);

            await addDoc(collection(db, 'timeSlots'), {
              dateTime: Timestamp.fromDate(slotDate),
              duration: 60,
              lessonType: null,
              status: SLOT_STATUS.AVAILABLE,
              bookedBy: null,
              bookedAt: null,
              createdAt: Timestamp.now(),
            });
            count++;
          }
        }
        current.setDate(current.getDate() + 1);
      }

      setBulkResult(`Successfully created ${count} time slots.`);
      await fetchSlots(slotFilter);
    } catch (err) {
      console.error('Error bulk creating:', err);
      setBulkResult('Error creating slots. Please try again.');
    } finally {
      setBulkCreating(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'timeSlots', deleteTarget.id));
      setSlots(prev => prev.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting slot:', err);
      alert('Failed to delete.');
    } finally {
      setDeleting(false);
    }
  };

  const toggleDay = day => {
    setBulkData(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
    }));
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];



  return (
    <>
      <SEO title="Manage Time Slots | Admin" url="/admin/slots" />
      <section className="min-h-screen bg-dark-900 pt-36 pb-16 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.03)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-10 animate-fadeInUp flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0">
            <div>
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center space-x-2 text-gray-500 hover:text-gold text-xs uppercase tracking-widest transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
              <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">Manage Time Slots</h1>
            </div>
            <button
              onClick={() => setShowCleanupModal(true)}
              disabled={cleaning}
              className="group flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[#d9736c] hover:text-[#f4847d] transition-all duration-300 border border-[#d9736c]/20 hover:border-[#d9736c]/50 bg-[#d9736c]/5 px-4 py-2.5 rounded-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{cleaning ? 'Cleaning...' : 'Clear All Available Slots'}</span>
            </button>
          </div>

          {/* View Tabs */}
          <div className="flex space-x-1 mb-8 border-b border-white/[0.06] animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            {[
              { id: 'list', label: 'All Slots', icon: Calendar },
              { id: 'create', label: 'Add Single Slot', icon: Plus },
              { id: 'bulk', label: 'Bulk Create', icon: Repeat },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center space-x-2 px-5 py-3 text-xs uppercase tracking-widest transition-all duration-300 border-b-2 -mb-px ${
                  activeView === tab.id ? 'border-gold text-gold' : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* LIST VIEW */}
          {activeView === 'list' && (
            <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              {/* Upcoming / Past toggle */}
              <div className="flex items-center space-x-1 mb-6">
                {['upcoming', 'past'].map(f => (
                  <button
                    key={f}
                    onClick={() => setSlotFilter(f)}
                    className={`px-4 py-2 text-[10px] uppercase tracking-widest rounded-sm border transition-all duration-300 ${
                      slotFilter === f ? 'border-gold/40 text-gold bg-gold/5' : 'border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20'
                    }`}
                  >
                    {f === 'upcoming' ? 'Upcoming' : 'Past'}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-16 glass-card rounded-sm border border-white/[0.06]">
                  <Calendar className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">{slotFilter === 'upcoming' ? 'No upcoming time slots' : 'No past bookings'}</p>
                  <p className="text-gray-600 text-sm">
                    {slotFilter === 'upcoming' 
                      ? 'Create some slots to get started.' 
                      : 'Completed or cancelled sessions with no booking are hidden.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.map(slot => {
                    const lt = getLessonTypeById(slot.lessonType);
                    const dateTime = slot.dateTime?.toDate ? slot.dateTime.toDate() : null;
                    const isBooked = slot.status === SLOT_STATUS.BOOKED;
                    return (
                      <div
                        key={slot.id}
                        className={`glass-card p-5 rounded-sm border flex items-center justify-between ${isBooked ? 'border-gold/10' : 'border-white/[0.06]'}`}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <span className="text-gold font-serif text-lg min-w-[80px]">{dateTime ? formatTime(dateTime) : '—'}</span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-white text-sm">{lt?.name || (slot.status === SLOT_STATUS.AVAILABLE ? 'Open Slot' : 'Private Lesson')}</p>
                              <span className="text-gray-600 text-xs">· {slot.duration} min</span>
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5">{dateTime ? formatDate(dateTime) : '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-sm border ${
                              isBooked ? 'text-gray-500 border-white/10 bg-white/5' : 'text-gold border-gold/30 bg-gold/5'
                            }`}
                          >
                            {isBooked ? 'Booked' : 'Available'}
                          </span>
                          {!isBooked && (
                            <button
                              onClick={() => setDeleteTarget(slot)}
                              className="text-gray-500 hover:text-[#d9736c] transition-colors p-1"
                              title="Delete slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SINGLE CREATE VIEW */}
          {activeView === 'create' && (
            <div className="max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              <div className="p-8 md:p-10 rounded-sm border border-gold/20 bg-dark-800 shadow-2xl relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="relative z-10">
                  <form onSubmit={handleCreateSlot} className="space-y-8">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Date</label>
                      <DatePicker
                        value={newSlot.date}
                        onChange={val => setNewSlot(p => ({ ...p, date: val }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Time</label>
                      <TimePicker
                        value={newSlot.time}
                        onChange={val => setNewSlot(p => ({ ...p, time: val }))}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={creating}
                      className={`inline-flex items-center space-x-2 border px-8 py-3 text-xs uppercase tracking-widest transition-all duration-300 ${
                        creating ? 'border-gold bg-gold/70 text-dark-900 cursor-wait' : 'border-gold text-gold hover:bg-gold hover:text-dark-900'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{creating ? 'Creating...' : 'Create Slot'}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeView === 'bulk' && (
            <div className="max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              <div className="p-8 md:p-10 rounded-sm border border-gold/20 bg-dark-800 shadow-2xl relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-gray-400 text-sm mb-8">Generate recurring time slots across a date range.</p>
                  <form onSubmit={handleBulkCreate} className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Start Date</label>
                        <DatePicker
                          value={bulkData.startDate}
                          onChange={val => setBulkData(p => ({ ...p, startDate: val }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">End Date</label>
                        <DatePicker
                          value={bulkData.endDate}
                          onChange={val => setBulkData(p => ({ ...p, endDate: val }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Days of Week</label>
                      <div className="flex flex-wrap gap-2">
                        {dayLabels.map((label, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleDay(idx)}
                            className={`px-4 py-2 text-xs uppercase tracking-wider border rounded-sm transition-all duration-300 ${
                              bulkData.days.includes(idx) ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-gray-500 hover:border-white/30'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Start Time</label>
                        <TimePicker
                          value={bulkData.startTime}
                          onChange={val => setBulkData(p => ({ ...p, startTime: val }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">End Time</label>
                        <TimePicker
                          value={bulkData.endTime}
                          onChange={val => setBulkData(p => ({ ...p, endTime: val }))}
                        />
                      </div>
                    </div>

                    {bulkResult && (
                      <p className={`text-sm tracking-widest uppercase font-medium ${bulkResult.includes('Error') ? 'text-[#d9736c]' : 'text-gold'}`}>
                        {bulkResult}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={bulkCreating}
                      className={`inline-flex items-center space-x-2 border px-8 py-3 text-xs uppercase tracking-widest transition-all duration-300 ${
                        bulkCreating ? 'border-gold bg-gold/70 text-dark-900 cursor-wait' : 'border-gold text-gold hover:bg-gold hover:text-dark-900'
                      }`}
                    >
                      <Repeat className="w-4 h-4" />
                      <span>{bulkCreating ? 'Creating...' : 'Generate Slots'}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-fadeIn">
            <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <div className="relative bg-dark-800 border border-white/10 rounded-sm p-8 max-w-md w-full animate-scaleIn shadow-2xl">
              <h3 className="font-serif text-xl text-white mb-4">Delete Time Slot?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This will permanently remove the{' '}
                <span className="text-white">{deleteTarget.dateTime?.toDate && formatTime(deleteTarget.dateTime.toDate())}</span> slot on{' '}
                <span className="text-white">{deleteTarget.dateTime?.toDate && formatDate(deleteTarget.dateTime.toDate())}</span>.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 border border-white/10 text-gray-300 py-3 text-xs uppercase tracking-widest hover:border-white/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 border border-[#d9736c] bg-[#d9736c] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#c0625b] transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Bulk Cleanup Modal */}
        {showCleanupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-fadeIn">
            <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setShowCleanupModal(false)} />
            <div className="relative bg-dark-800 border border-white/10 rounded-sm p-8 max-w-md w-full animate-scaleIn shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[#d9736c]/10 border border-[#d9736c]/30 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-[#d9736c]" />
                </div>
                <h3 className="font-serif text-xl text-white mb-2">Clear All Available Slots?</h3>
                <p className="text-gray-400 text-sm">
                  This will permanently delete all <span className="text-white">unbooked</span> time slots currently in the system. Booked lessons will not be affected.
                </p>
                <p className="text-[#d9736c] text-[10px] uppercase tracking-widest mt-4 font-bold">This action cannot be undone.</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCleanupModal(false)}
                  className="flex-1 border border-white/10 text-gray-300 py-3 text-xs uppercase tracking-widest hover:border-white/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCleanupSlots}
                  className="flex-1 border border-[#d9736c] bg-[#d9736c] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#c0625b] transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default AdminSlots;
