import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Calendar, Clock, Users, ArrowRight, ChevronRight, Activity, TrendingUp, Settings, AlertCircle, MessageSquare } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { getLessonTypeById, formatDate, formatTime } from '../data/bookingData';
import SEO from '../components/SEO';

import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { hasUnreadMessages } = useAuth();
  const [stats, setStats] = useState({ upcomingCount: 0, todayCount: 0, totalMembers: 0 });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // Single query: fetch all confirmed appointments
        const allAptsQ = query(collection(db, 'appointments'), where('status', '==', 'confirmed'));
        const allAptsSnap = await getDocs(allAptsQ);
        const allApts = allAptsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Client-side filtering
        const upcoming = allApts.filter(a => {
          const dt = a.dateTime?.toDate?.() || a.dateTime;
          return dt >= now;
        });

        const todayApts = allApts
          .filter(a => {
            const dt = a.dateTime?.toDate?.() || a.dateTime;
            return dt >= todayStart && dt <= todayEnd;
          })
          .sort((a, b) => {
            const dtA = a.dateTime?.toDate?.() || a.dateTime;
            const dtB = b.dateTime?.toDate?.() || b.dateTime;
            return dtA - dtB;
          });
        setTodayAppointments(todayApts);

        // Recent bookings (sorted by createdAt desc, limit 10 then filter)
        const recentQ = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'), limit(10));
        let recentApts = [];
        try {
          const recentSnap = await getDocs(recentQ);
          recentApts = recentSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch {
          // If index not ready, fallback to client-side sort
          const allDocsSnap = await getDocs(collection(db, 'appointments'));
          recentApts = allDocsSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => {
              const ca = a.createdAt?.toDate?.() || new Date(0);
              const cb = b.createdAt?.toDate?.() || new Date(0);
              return cb - ca;
            });
        }
        // Only show upcoming bookings
        recentApts = recentApts
          .filter(a => {
            const dt = a.dateTime?.toDate?.() || a.dateTime;
            return dt >= now && a.status === 'confirmed';
          })
          .slice(0, 5);
        setRecentBookings(recentApts);

        // Total members
        const membersSnap = await getDocs(collection(db, 'users'));

        setStats({
          upcomingCount: upcoming.length,
          todayCount: todayApts.length,
          totalMembers: membersSnap.size,
        });
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date();
  const formattedToday = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const statCards = [
    {
      icon: Calendar,
      label: 'Upcoming',
      value: loading ? '—' : stats.upcomingCount,
      sub: 'Sessions scheduled',
      color: 'text-gold',
      bgGlow: 'from-gold/15 to-gold/5',
      iconBg: 'bg-gold/10',
    },
    {
      icon: Clock,
      label: formatDate(new Date()),
      value: loading ? '—' : stats.todayCount,
      sub: 'Sessions today',
      color: 'text-gold/90',
      bgGlow: 'from-gold/15 to-gold/5',
      iconBg: 'bg-gold/10',
    },
    {
      icon: Users,
      label: 'Members',
      value: loading ? '—' : stats.totalMembers,
      sub: 'Registered users',
      color: 'text-gold/80',
      bgGlow: 'from-gold/15 to-gold/5',
      iconBg: 'bg-gold/10',
      link: '/admin/members',
    },
  ];

  return (
    <>
      <SEO title="Admin Dashboard | Dr. Yirui Li" url="/admin" />
      <section className="min-h-screen bg-dark-900 pt-36 pb-20 px-6 md:px-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.04)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute top-60 left-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(197,160,89,0.02)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-12 animate-fadeInUp">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">Admin Panel</h1>
                <p className="text-gray-600 text-xs tracking-wider mt-0.5">{formattedToday}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/admin/members"
                className="inline-flex items-center space-x-2 border border-white/20 bg-dark-800 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest text-gray-300 hover:border-gold hover:text-gold transition-all duration-300 group"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Manage Members</span>
              </Link>
              <Link
                to="/admin/slots"
                className="inline-flex items-center space-x-2 border border-white/20 bg-dark-800 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest text-gray-300 hover:border-gold hover:text-gold transition-all duration-300 group"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Manage Slots</span>
              </Link>
              <Link
                to="/admin/messages"
                className="inline-flex items-center space-x-2 border border-gold/30 bg-gold/5 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest text-gold hover:bg-gold hover:text-dark-900 transition-all duration-300 group relative"
              >
                <div className="relative">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {hasUnreadMessages && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#d9736c] rounded-full animate-pulse" />
                  )}
                </div>
                <span>Student Inbox</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-8 p-4 rounded-sm border border-[#d9736c]/20 bg-[#d9736c]/5 flex items-center space-x-3 animate-fadeInUp">
              <AlertCircle className="w-4 h-4 text-[#d9736c] flex-shrink-0" />
              <p className="text-[#d9736c] text-sm">Unable to load data — you may be offline. Displayed values may be incomplete.</p>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {statCards.map((stat, idx) => {
              const CardContent = (
                <div
                  className={`group relative glass-card rounded-sm border border-white/[0.06] transition-all duration-500 overflow-hidden ${stat.link ? 'cursor-pointer hover:border-gold/30 hover:-translate-y-1' : 'hover:border-gold/15'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-10 h-10 rounded-sm ${stat.iconBg} flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-gray-600">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-serif text-white mb-1 tracking-tight">{stat.value}</p>
                    <p className="text-gray-600 text-xs tracking-wider">{stat.sub}</p>
                  </div>
                </div>
              );

              return (
                <div key={idx} className="animate-fadeInUp" style={{ animationDelay: `${80 + idx * 80}ms` }}>
                  {stat.link ? (
                    <Link to={stat.link} className="block relative z-20 h-full w-full">
                      {CardContent}
                    </Link>
                  ) : (
                    CardContent
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile manage buttons */}
          <div className="mb-8 md:hidden animate-fadeInUp flex flex-col space-y-3" style={{ animationDelay: '320ms' }}>
            <Link
              to="/admin/slots"
              className="flex items-center justify-center space-x-3 border border-white/20 text-gray-300 px-8 py-4 text-xs uppercase tracking-widest hover:border-gold hover:text-gold transition-all duration-300 w-full"
            >
              <Calendar className="w-4 h-4" />
              <span>Manage Time Slots</span>
            </Link>
            <Link
              to="/admin/messages"
              className="flex items-center justify-center space-x-3 border border-gold text-gold px-8 py-4 text-xs uppercase tracking-widest hover:bg-gold hover:text-dark-900 transition-all duration-300 w-full relative"
            >
              <div className="relative">
                <MessageSquare className="w-4 h-4" />
                {hasUnreadMessages && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#d9736c] rounded-full animate-pulse" />
                )}
              </div>
              <span>Student Inbox</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Today's Schedule - left 3 cols */}
            <div className="lg:col-span-3 animate-fadeInUp flex flex-col h-full" style={{ animationDelay: '350ms' }}>
              <div className="flex items-center space-x-3 mb-5 shrink-0">
                <div className="w-8 h-px bg-gradient-to-r from-gold/40 to-transparent" />
                <h2 className="font-serif text-lg text-white">Today&apos;s Schedule</h2>
                {!loading && todayAppointments.length > 0 && (
                  <span className="text-[10px] uppercase tracking-widest text-gold bg-gold/10 px-2.5 py-0.5 rounded-full">{todayAppointments.length}</span>
                )}
              </div>

              {loading ? (
                <div className="glass-card rounded-sm border border-white/[0.06] flex items-center justify-center py-14 flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500 text-sm">Loading schedule...</span>
                  </div>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="glass-card rounded-sm border border-white/[0.06] py-14 flex-1 flex flex-col items-center justify-center text-center">
                  <Activity className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-1">No sessions today</p>
                  <p className="text-gray-700 text-xs">Enjoy your free time</p>
                </div>
              ) : (
                <div className="space-y-2 flex-1">
                  {todayAppointments.map((appt) => {
                    const lt = getLessonTypeById(appt.lessonType);
                    const dateTime = appt.dateTime?.toDate ? appt.dateTime.toDate() : null;
                    return (
                      <div key={appt.id} className="glass-card rounded-sm border border-white/[0.06] overflow-hidden">
                        <div className="flex items-center p-4">
                          {/* Time pill */}
                          <div className="flex-shrink-0 mr-4">
                            <div className="bg-gold/[0.07] rounded-sm px-3 py-1.5">
                              <span className="text-gold font-serif text-base">{dateTime ? formatTime(dateTime) : '—'}</span>
                            </div>
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{lt?.name || appt.lessonType}</p>
                            <p className="text-gray-500 text-xs mt-0.5 truncate">
                              {appt.userName || appt.userEmail || 'Unknown'} · {appt.duration} min
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Bookings - right 2 cols */}
            <div className="lg:col-span-2 animate-fadeInUp flex flex-col h-full" style={{ animationDelay: '420ms' }}>
              <div className="flex items-center space-x-3 mb-5 shrink-0">
                <div className="w-8 h-px bg-gradient-to-r from-gold/40 to-transparent" />
                <h2 className="font-serif text-lg text-white">Recent Bookings</h2>
              </div>

              {loading ? (
                <div className="glass-card rounded-sm border border-white/[0.06] flex items-center justify-center py-14 flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500 text-sm">Loading...</span>
                  </div>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="glass-card rounded-sm border border-white/[0.06] py-14 flex-1 flex flex-col items-center justify-center text-center">
                  <TrendingUp className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-2.5 flex-1">
                  {recentBookings.map(appt => {
                    const lt = getLessonTypeById(appt.lessonType);
                    const dateTime = appt.dateTime?.toDate ? appt.dateTime.toDate() : null;
                    const isCancelled = appt.status === 'cancelled';
                    const userName = appt.userName || 'Unknown';
                    const userEmail = appt.userEmail || '';
                    const initials = userName !== 'Unknown'
                      ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      : 'U';
                    return (
                      <div
                        key={appt.id}
                        className={`glass-card rounded-sm border p-4 transition-all duration-300 ${
                          isCancelled ? 'border-white/[0.04] opacity-40' : 'border-white/[0.06] hover:border-gold/20'
                        }`}
                      >
                        {/* Row 1: Avatar + Name + Status */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-gold text-[10px] font-semibold tracking-wide">{initials}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-white text-sm font-medium truncate">{userName}</p>
                              {isCancelled && (
                                <span className="text-[9px] uppercase tracking-widest text-[#d9736c] bg-[#d9736c]/10 px-2 py-0.5 rounded-sm flex-shrink-0">
                                  Cancelled
                                </span>
                              )}
                            </div>
                            {userEmail && <p className="text-gray-600 text-[11px] truncate">{userEmail}</p>}
                          </div>
                        </div>

                        {/* Row 2: Date/Time + Lesson */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {dateTime && (
                            <span className="text-[10px] uppercase tracking-[0.12em] text-gold border border-gold/20 bg-gold/5 px-2 py-0.5 rounded-sm flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(dateTime)}
                            </span>
                          )}
                          {dateTime && (
                            <span className="text-[10px] uppercase tracking-[0.12em] text-gold border border-gold/20 bg-gold/5 px-2 py-0.5 rounded-sm flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(dateTime)}
                            </span>
                          )}
                          <span className="text-gray-500 text-[11px]">
                            {lt?.name || appt.lessonType} · {appt.duration || lt?.duration} min
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
