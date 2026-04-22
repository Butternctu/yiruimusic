import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Trash2, ArrowLeft, Repeat } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc, orderBy, Timestamp, limit, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { LESSON_TYPES, SLOT_STATUS, formatDate, formatTime, getLessonTypeById } from '../data/bookingData';
import { DatePicker, TimePicker } from '../components/DateTimePicker';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';

const AdminSlots = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('list'); // list | create | bulk
  const [slotFilter, setSlotFilter] = useState('upcoming'); // upcoming | past

  // Single slot creation
  const [newSlot, setNewSlot] = useState({
    date: '',
    time: '',
  });
  const [creating, setCreating] = useState(false);
  const [singleResult, setSingleResult] = useState({ type: '', message: '' });
  const [shakeError, setShakeError] = useState(false);

  // Bulk creation
  const [bulkData, setBulkData] = useState({
    startDate: '',
    endDate: '',
    days: [1, 2, 3, 4, 5], // Mon-Fri by default
    startTime: '09:00',
    endTime: '17:00',
  });
  const [bulkCreating, setBulkCreating] = useState(false);
  const [bulkResult, setBulkResult] = useState({ type: '', message: '' });
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, status: '' });
  const [cleaning, setCleaning] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);

  const getSlotId = date => {
    const d = new Date(date);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    const hr = String(d.getHours()).padStart(2, '0');
    const mn = String(d.getMinutes()).padStart(2, '0');
    return `slot_${yr}${mo}${dy}_${hr}${mn}`;
  };

  useEffect(() => {
    fetchSlots(slotFilter);
  }, [slotFilter]);

  const fetchSlots = async (mode = 'upcoming') => {
    setLoading(true);
    try {
      const now = new Date();
      const q =
        mode === 'upcoming'
          ? query(collection(db, 'timeSlots'), where('dateTime', '>=', Timestamp.fromDate(now)), orderBy('dateTime', 'asc'))
          : query(collection(db, 'timeSlots'), where('dateTime', '<', Timestamp.fromDate(now)), orderBy('dateTime', 'desc'), limit(100));
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
    setCleaning(true);
    setBulkProgress({ current: 0, total: 0, status: 'Identifying available slots...' });
    try {
      const q = query(collection(db, 'timeSlots'), where('status', '==', SLOT_STATUS.AVAILABLE));
      const snap = await getDocs(q);

      if (snap.empty) {
        showToast('No available slots to clear.', 'info');
        setShowCleanupModal(false);
        return;
      }

      setBulkProgress({ current: 0, total: snap.size, status: `Deleting ${snap.size} slots...` });

      let batch = writeBatch(db);
      let count = 0;
      let totalDeleted = 0;

      for (const docSnap of snap.docs) {
        batch.delete(docSnap.ref);
        count++;
        totalDeleted++;

        if (count === 500) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
          setBulkProgress(p => ({ ...p, current: totalDeleted }));
        }
      }

      if (count > 0) {
        await batch.commit();
        setBulkProgress(p => ({ ...p, current: totalDeleted }));
      }

      showToast(`Successfully cleared ${totalDeleted} slots.`, 'success');
      await fetchSlots(slotFilter);
    } catch (err) {
      console.error('Cleanup error:', err);
      showToast('Failed to cleanup slots.', 'error');
    } finally {
      setCleaning(false);
      setBulkProgress({ current: 0, total: 0, status: '' });
      setShowCleanupModal(false);
    }
  };

  // ── Single slot creation ──
  const handleCreateSlot = async e => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.time) {
      setSingleResult({ type: 'error', message: 'Please select both date and time.' });
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }
    setCreating(true);
    setSingleResult({ type: '', message: '' });

    try {
      const dateTime = new Date(`${newSlot.date}T${newSlot.time}:00`);
      const slotId = getSlotId(dateTime);

      const docRef = doc(db, 'timeSlots', slotId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSingleResult({ type: 'error', message: 'A slot already exists at this time.' });
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
        return;
      }

      await setDoc(docRef, {
        dateTime: Timestamp.fromDate(dateTime),
        duration: 60,
        lessonType: null,
        status: SLOT_STATUS.AVAILABLE,
        bookedBy: null,
        bookedAt: null,
        createdAt: Timestamp.now(),
      });
      setNewSlot({ date: '', time: '' });
      setSingleResult({ type: 'success', message: 'Time slot created successfully!' });
      await fetchSlots(slotFilter);
    } catch (err) {
      console.error('Error creating slot:', err);
      setSingleResult({ type: 'error', message: 'Failed to create slot.' });
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setCreating(false);
    }
  };

  // ── Bulk slot creation ──
  const handleBulkCreate = async e => {
    e.preventDefault();
    if (!bulkData.startDate || !bulkData.endDate) {
      setBulkResult({ type: 'error', message: 'Please select both start and end dates.' });
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }
    setBulkCreating(true);
    setBulkResult({ type: '', message: '' });
    setBulkProgress({ current: 0, total: 0, status: 'Analyzing schedule...' });

    try {
      const start = new Date(bulkData.startDate);
      const end = new Date(bulkData.endDate);
      const targetSlots = [];

      const current = new Date(start);
      while (current <= end) {
        if (bulkData.days.includes(current.getDay())) {
          const [startHour, startMin] = bulkData.startTime.split(':').map(Number);
          const [endHour, endMin] = bulkData.endTime.split(':').map(Number);
          const dayStart = startHour * 60 + startMin;
          const dayEnd = endHour * 60 + endMin;

          const interval = 60; // Default generation interval
          for (let minuteOfDay = dayStart; minuteOfDay + interval <= dayEnd; minuteOfDay += interval) {
            const slotDate = new Date(current);
            slotDate.setHours(Math.floor(minuteOfDay / 60), minuteOfDay % 60, 0, 0);
            targetSlots.push({
              id: getSlotId(slotDate),
              data: {
                dateTime: Timestamp.fromDate(slotDate),
                duration: 60,
                lessonType: null,
                status: SLOT_STATUS.AVAILABLE,
                bookedBy: null,
                bookedAt: null,
                createdAt: Timestamp.now(),
              },
            });
          }
        }
        current.setDate(current.getDate() + 1);
      }

      setBulkProgress(p => ({ ...p, total: targetSlots.length, status: 'Checking for duplicates...' }));

      // Filter out existing slots
      const finalSlots = [];
      // To prevent massive parallel getDocs, we fetch the range of existing slots first
      const rangeQ = query(
        collection(db, 'timeSlots'),
        where('dateTime', '>=', Timestamp.fromDate(start)),
        where('dateTime', '<=', Timestamp.fromDate(new Date(end.getTime() + 86400000))),
      );
      const existingSnap = await getDocs(rangeQ);
      const existingIds = new Set(existingSnap.docs.map(d => d.id));

      for (const slot of targetSlots) {
        if (!existingIds.has(slot.id)) {
          finalSlots.push(slot);
        }
      }

      const skipped = targetSlots.length - finalSlots.length;
      if (finalSlots.length === 0) {
        setBulkResult({ type: 'error', message: `No new slots created. ${skipped} slots were skipped (already exist).` });
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
        return;
      }

      setBulkProgress(p => ({ ...p, total: finalSlots.length, current: 0, status: `Creating ${finalSlots.length} new slots...` }));

      // Batch write in chunks of 500
      let batch = writeBatch(db);
      let count = 0;
      let totalCreated = 0;

      for (const slot of finalSlots) {
        batch.set(doc(db, 'timeSlots', slot.id), slot.data);
        count++;
        totalCreated++;

        if (count === 500) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
          setBulkProgress(p => ({ ...p, current: totalCreated }));
        }
      }

      if (count > 0) {
        await batch.commit();
        setBulkProgress(p => ({ ...p, current: totalCreated }));
      }

      setBulkResult({ type: 'success', message: `Successfully created ${totalCreated} time slots. ${skipped > 0 ? `${skipped} skipped.` : ''}` });
      await fetchSlots(slotFilter);
    } catch (err) {
      console.error('Bulk generation error:', err);
      setBulkResult({ type: 'error', message: 'An error occurred during bulk generation.' });
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setBulkCreating(false);
      setBulkProgress({ current: 0, total: 0, status: '' });
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
      showToast('Failed to delete.', 'error');
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
      <section className="min-h-screen bg-dark-900 pt-28 pb-12 relative flex flex-col overflow-x-clip">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.03)_0%,transparent_70%)]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-12 w-full z-10 relative">
          <div className="sticky top-[64px] md:top-[80px] z-30 bg-dark-900/95 backdrop-blur-md pt-6 pb-2 -mx-6 px-6 md:-mx-12 md:px-12">
            {/* Header */}
            <div className="flex items-center justify-between animate-fadeInUp shrink-0 mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/admin')}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-gold/30 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-400" />
                </button>
                <div>
                  <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">Manage Time Slots</h1>
                  <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mt-1">Admin Platform</p>
                </div>
              </div>

              <div className="flex items-center">
                {/* Mobile-only trash icon: aligned to right on small screens */}
                <button
                  onClick={() => setShowCleanupModal(true)}
                  disabled={cleaning}
                  className="md:hidden w-10 h-10 rounded-full border border-[#d9736c]/20 flex items-center justify-center text-[#d9736c] hover:bg-[#d9736c]/10 hover:border-[#d9736c]/40 transition-all duration-300"
                  title="Clear All Available Slots"
                >
                  {cleaning ? (
                    <div className="w-4 h-4 border-2 border-[#d9736c] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>

                {/* Desktop-only text button */}
                <button
                  onClick={() => setShowCleanupModal(true)}
                  disabled={cleaning}
                  className="hidden md:flex group items-center space-x-2 text-[10px] uppercase tracking-widest text-[#d9736c] hover:text-[#f4847d] transition-all duration-300 border border-[#d9736c]/20 hover:border-[#d9736c]/50 bg-[#d9736c]/5 px-4 py-2.5 rounded-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{cleaning ? 'Cleaning...' : 'Clear All Available Slots'}</span>
                </button>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex space-x-1 mb-4 border-b border-white/6 animate-fadeInUp shrink-0" style={{ animationDelay: '100ms' }}>
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
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 min-h-0">
            {/* LIST VIEW */}
            {activeView === 'list' && (
              <div className="h-full flex flex-col animate-fadeIn" style={{ animationDelay: '200ms' }}>
                {/* Upcoming / Past toggle */}
                <div className="flex items-center space-x-1 mb-6 shrink-0">
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
                  <div className="flex-1 flex justify-center items-center">
                    <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-16 glass-card rounded-sm border border-white/6">
                    <Calendar className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">{slotFilter === 'upcoming' ? 'No upcoming time slots' : 'No past bookings'}</p>
                    <p className="text-gray-600 text-sm">
                      {slotFilter === 'upcoming' ? 'Create some slots to get started.' : 'Completed or cancelled sessions with no booking are hidden.'}
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
                          className={`glass-card p-5 rounded-sm border flex items-center justify-between gap-6 transition-colors ${isBooked ? 'border-gold/10' : 'border-white/[0.04] hover:border-white/[0.08]'}`}
                        >
                          <div className="flex items-center space-x-6 flex-1 min-w-0">
                            <div className="flex flex-col items-center min-w-[70px]">
                              <span className="text-gold font-serif text-lg leading-none">{dateTime ? formatTime(dateTime) : '—'}</span>
                              {slot.status !== SLOT_STATUS.AVAILABLE && (
                                <span className="text-gray-600 text-[10px] mt-1">{slot.duration}m</span>
                              )}
                            </div>
                            <div className="h-10 w-px bg-white/5" />
                            <div className="truncate">
                              <div className="flex items-center space-x-2">
                                <p className="text-white text-sm truncate">
                                  {lt ? `${lt.format}: ${lt.category}` :
                                    (slot.lessonType === 'overlap-block'
                                      ? 'Extended Session Block'
                                      : slot.status === SLOT_STATUS.AVAILABLE
                                        ? 'Open Slot'
                                        : 'Private Lesson')}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <p className="text-gray-500 text-[11px]">{dateTime ? formatDate(dateTime) : '—'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 shrink-0">
                            <span
                              className={`text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-sm border ${
                                isBooked ? 'text-gray-500 border-white/10 bg-white/5' : 'text-gold border-gold/30 bg-gold/5 font-semibold'
                              }`}
                            >
                              {isBooked ? 'Booked' : 'Available'}
                            </span>
                            {!isBooked && (
                              <button
                                onClick={() => setDeleteTarget(slot)}
                                className="text-gray-600 hover:text-[#d9736c] transition-colors p-1"
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
              <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar pb-10">
                <div className="max-w-2xl mx-auto animate-fadeInUp pb-12" style={{ animationDelay: '200ms' }}>
                  <div className="p-8 md:p-10 rounded-sm border border-gold/20 bg-dark-800 shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="relative z-10">
                      <form onSubmit={handleCreateSlot} className="space-y-8" noValidate>
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Date</label>
                          <DatePicker value={newSlot.date} onChange={val => setNewSlot(p => ({ ...p, date: val }))} />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Time</label>
                          <TimePicker value={newSlot.time} onChange={val => setNewSlot(p => ({ ...p, time: val }))} />
                        </div>
                        {singleResult.message && (
                          <div
                            className={`mt-2 ${singleResult.type === 'error' ? (shakeError ? 'animate-error-shake' : 'animate-error-pulse') : 'animate-fadeIn'}`}
                          >
                            <p
                              className={`text-[11px] tracking-widest uppercase text-center font-medium ${singleResult.type === 'error' ? 'text-[#d9736c]' : 'text-gold'}`}
                            >
                              {singleResult.message}
                            </p>
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={creating}
                            className={`w-full md:w-auto inline-flex items-center justify-center space-x-2 border px-8 py-3 text-xs uppercase tracking-widest transition-all duration-300 ${
                              creating ? 'border-gold bg-gold/70 text-dark-900 cursor-wait' : 'border-gold text-gold hover:bg-gold hover:text-dark-900'
                            }`}
                          >
                            {creating ? (
                              <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            <span>{creating ? 'Creating...' : 'Create Slot'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'bulk' && (
              <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar pb-10">
                <div className="max-w-2xl mx-auto animate-fadeInUp pb-12" style={{ animationDelay: '200ms' }}>
                  <div className="p-8 md:p-10 rounded-sm border border-gold/20 bg-dark-800 shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="relative z-10">
                      <p className="text-gray-400 text-sm mb-8">Generate recurring time slots across a date range.</p>
                      <form onSubmit={handleBulkCreate} className="space-y-8" noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Start Date</label>
                            <DatePicker value={bulkData.startDate} onChange={val => setBulkData(p => ({ ...p, startDate: val }))} />
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">End Date</label>
                            <DatePicker value={bulkData.endDate} onChange={val => setBulkData(p => ({ ...p, endDate: val }))} />
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Start Time</label>
                            <TimePicker value={bulkData.startTime} onChange={val => setBulkData(p => ({ ...p, startTime: val }))} />
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">End Time</label>
                            <TimePicker value={bulkData.endTime} onChange={val => setBulkData(p => ({ ...p, endTime: val }))} />
                          </div>
                        </div>

                        {bulkCreating && (
                          <div className="space-y-3 animate-fadeIn">
                            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                              <span className="text-gold font-medium">{bulkProgress.status}</span>
                              <span className="text-gray-500">
                                {bulkProgress.total > 0 ? `${Math.round((bulkProgress.current / bulkProgress.total) * 100)}%` : ''}
                              </span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold transition-all duration-500 ease-out"
                                style={{ width: `${bulkProgress.total > 0 ? (bulkProgress.current / bulkProgress.total) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {bulkResult.message && (
                          <div
                            className={`mt-2 ${bulkResult.type === 'error' ? (shakeError ? 'animate-error-shake' : 'animate-error-pulse') : 'animate-fadeIn'}`}
                          >
                            <p
                              className={`text-[11px] tracking-widest uppercase text-center font-medium ${bulkResult.type === 'error' ? 'text-[#d9736c]' : 'text-gold'}`}
                            >
                              {bulkResult.message}
                            </p>
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={bulkCreating}
                            className={`w-full md:w-auto inline-flex items-center justify-center space-x-2 border px-10 py-4 text-xs uppercase tracking-widest transition-all duration-500 ${
                              bulkCreating ? 'border-gold bg-gold/10 text-gold cursor-wait' : 'border-gold text-gold hover:bg-gold hover:text-dark-900'
                            }`}
                          >
                            {bulkCreating ? (
                              <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Repeat className="w-4 h-4" />
                            )}
                            <span>{bulkCreating ? 'Processing...' : 'Generate Slots'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                  This will permanently delete all <span className="text-white">unbooked</span> time slots currently in the system. Booked lessons will not be
                  affected.
                </p>
                <p className="text-[#d9736c] text-[10px] uppercase tracking-widest mt-4 font-bold">This action cannot be undone.</p>
              </div>

              {cleaning ? (
                <div className="space-y-4 py-4 animate-fadeIn">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                    <span className="text-[#d9736c] font-medium">{bulkProgress.status}</span>
                    <span className="text-gray-500">{bulkProgress.total > 0 ? `${Math.round((bulkProgress.current / bulkProgress.total) * 100)}%` : ''}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#d9736c] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(217,115,108,0.4)]"
                      style={{ width: `${bulkProgress.total > 0 ? (bulkProgress.current / bulkProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default AdminSlots;
