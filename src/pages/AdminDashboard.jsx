import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Calendar,
  Clock,
  Users,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Activity,
  TrendingUp,
  Settings,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getLessonTypeById, formatDate, formatTime } from '../data/bookingData';
import SEO from '../components/SEO';

import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { hasUnreadMessages } = useAuth();
  const [stats, setStats] = useState({ upcomingCount: 0, todayCount: 0, totalMembers: 0 });
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [monthAppointments, setMonthAppointments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // Fetch all confirmed appointments
        const allAptsQ = query(collection(db, 'appointments'), where('status', '==', 'confirmed'));
        const allAptsSnap = await getDocs(allAptsQ);
        const allApts = allAptsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const upcoming = allApts.filter(a => {
          const dt = a.dateTime?.toDate?.() || a.dateTime;
          return dt >= now;
        });

        const todayApts = allApts.filter(a => {
          const dt = a.dateTime?.toDate?.() || a.dateTime;
          return dt >= todayStart && dt <= todayEnd;
        });

        const mApts = allApts.filter(a => {
          const dt = a.dateTime?.toDate?.() || a.dateTime;
          return dt >= startOfMonth && dt <= endOfMonth;
        });
        setMonthAppointments(mApts);
        // removed recentBookings logic
        const membersSnap = await getDocs(collection(db, 'users'));

        setStats({
          upcomingCount: upcoming.length,
          todayCount: todayApts.length,
          totalMembers: membersSnap.size,
        });
      } catch (err) {
        console.error('Error fetching admin data:', err);
        // No error state used currently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentMonth]);

  const today = new Date();
  const formattedToday = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getDaysInMonth = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // Filter appointments for the currently selected date
  const selectedDateApts = monthAppointments
    .filter(appt => {
      const dt = appt.dateTime?.toDate?.() ? appt.dateTime.toDate() : new Date(appt.dateTime);
      return dt.getDate() === selectedDate.getDate() && dt.getMonth() === selectedDate.getMonth() && dt.getFullYear() === selectedDate.getFullYear();
    })
    .sort((a, b) => {
      const dtA = a.dateTime?.toDate?.() || a.dateTime;
      const dtB = b.dateTime?.toDate?.() || b.dateTime;
      return dtA - dtB;
    });

  const hasAptOnDate = date => {
    return monthAppointments.some(appt => {
      const dt = appt.dateTime?.toDate?.() ? appt.dateTime.toDate() : new Date(appt.dateTime);
      return dt.getDate() === date.getDate() && dt.getMonth() === date.getMonth() && dt.getFullYear() === date.getFullYear();
    });
  };

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
      <section className="min-h-screen bg-dark-900 pt-30 pb-12 relative flex flex-col">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.04)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute top-60 left-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(197,160,89,0.02)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 md:px-12 w-full z-10 relative">
          <div className="sticky top-[72px] z-30 bg-dark-900/95 backdrop-blur-md pt-2 pb-7 -mx-6 px-6 md:-mx-12 md:px-12">
            {/* Header */}
            <div className="flex items-center justify-between animate-fadeInUp shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">Admin Platform</h1>
                  <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mt-1">{formattedToday}</p>
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
                    {hasUnreadMessages && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#d9736c] rounded-full animate-pulse" />}
                  </div>
                  <span>Inbox</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stat Cards - Slightly more compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 shrink-0">
            {statCards.map((stat, idx) => {
              const CardContent = (
                <div
                  className={`group relative glass-card rounded-sm border border-white/[0.06] transition-all duration-500 overflow-hidden ${stat.link ? 'cursor-pointer hover:border-gold/30 hover:-translate-y-1' : 'hover:border-gold/15'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-8 h-8 rounded-sm ${stat.iconBg} flex items-center justify-center`}>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <span className="text-[9px] uppercase tracking-widest text-gray-600">{stat.label}</span>
                    </div>
                    <p className="text-xl font-serif text-white mb-0.5 tracking-tight">{stat.value}</p>
                    <p className="text-gray-600 text-[10px] tracking-wider">{stat.sub}</p>
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

          {/* Main Content Grid: Calendar + Schedule */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 mb-4 animate-fadeInUp" style={{ animationDelay: '350ms' }}>
            {/* Calendar Widget - Flexible width box */}
            <div className="flex-[3] flex flex-col min-h-0">
              <div className="flex items-center space-x-3 mb-4 shrink-0">
                <div className="w-8 h-px bg-gradient-to-r from-gold/40 to-transparent" />
                <h2 className="font-serif text-lg text-white">Monthly Schedule</h2>
              </div>
              <div className="glass-card rounded-sm border border-white/[0.06] p-6 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <h2 className="font-serif text-lg text-white">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1.5 border border-white/10 rounded-sm text-gray-400 hover:text-gold hover:border-gold/30 transition-all bg-white/5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-1.5 border border-white/10 rounded-sm text-gray-400 hover:text-gold hover:border-gold/30 transition-all bg-white/5"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-3 shrink-0">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2 flex-1">
                  {loading ? (
                    <div className="col-span-7 flex justify-center items-center py-16">
                      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    getDaysInMonth(currentMonth).map((date, idx) => {
                      if (!date) return <div key={`empty-${idx}`} className="p-2 h-full min-h-[52px]" />;

                      const isSelected = selectedDate.getDate() === date.getDate() && selectedDate.getMonth() === date.getMonth();
                      const isToday = today.getDate() === date.getDate() && today.getMonth() === date.getMonth() && today.getFullYear() === date.getFullYear();
                      const hasApts = hasAptOnDate(date);

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            const newSelected = new Date(date);
                            newSelected.setHours(0, 0, 0, 0);
                            setSelectedDate(newSelected);
                          }}
                          className={`relative w-full h-full min-h-[52px] rounded-sm border transition-all duration-300 flex flex-col items-center justify-center ${
                            isSelected
                              ? 'border-gold bg-gold/10 text-gold'
                              : isToday
                                ? 'border-white/20 bg-white/5 text-white hover:border-gold/50'
                                : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                          }`}
                        >
                          <span className={`text-sm font-serif ${isToday && !isSelected ? 'font-bold underline underline-offset-4 decoration-gold' : ''}`}>
                            {date.getDate()}
                          </span>

                          {hasApts && (
                            <div className="mt-1 flex space-x-1">
                              <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-gold shadow-[0_0_8px_rgba(197,160,89,0.5)]' : 'bg-gold/50'}`} />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Schedule List - right 2 cols */}
            <div className="flex-[2] flex flex-col min-h-0 animate-fadeInUp" style={{ animationDelay: '420ms' }}>
              <div className="flex items-center space-x-3 mb-4 shrink-0">
                <div className="w-8 h-px bg-gradient-to-r from-gold/40 to-transparent" />
                <h2 className="font-serif text-lg text-white">{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h2>
                {!loading && selectedDateApts.length > 0 && (
                  <span className="text-[10px] uppercase tracking-widest text-gold bg-gold/10 px-2.5 py-0.5 rounded-sm ml-auto">
                    {selectedDateApts.length} Sessions
                  </span>
                )}
              </div>

              <div className="glass-card rounded-sm border border-white/[0.06] p-5 flex-1 flex flex-col min-h-0 bg-white/[0.01]">
                {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin mr-3" />
                    <span className="text-gray-500 text-sm italic">Loading...</span>
                  </div>
                ) : selectedDateApts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 opacity-40">
                    <Activity className="w-8 h-8 text-gold/30 mb-3" />
                    <p className="text-white text-xs mb-1">No sessions scheduled</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Select another date</p>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    {selectedDateApts.map(appt => {
                      const lt = getLessonTypeById(appt.lessonType);
                      const dateTime = appt.dateTime?.toDate ? appt.dateTime.toDate() : null;
                      const userName = appt.userName || 'Unknown';
                      const initials =
                        userName !== 'Unknown'
                          ? userName
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : 'U';

                      return (
                        <div key={appt.id} className="glass-card rounded-sm border border-white/[0.03] p-4 hover:border-gold/20 transition-all duration-300">
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <span className="text-gold font-serif text-base leading-none">{dateTime ? formatTime(dateTime) : '—'}</span>
                              <span className="text-gray-600 text-[10px] mt-1.5">{appt.duration}m</span>
                            </div>

                            <div className="h-10 w-px bg-white/5" />

                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium mb-1 truncate">{lt?.name || appt.lessonType}</p>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                                  <span className="text-gold text-[8px] font-semibold">{initials}</span>
                                </div>
                                <p className="text-gray-400 text-[11px] truncate">{userName}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
