import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Star, Plus, List, User, Shield, ArrowRight, Music, Sparkles, MessageSquare } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime, getLessonTypeById } from '../data/bookingData';
import SEO from '../components/SEO';

const Dashboard = () => {
  const { user, userProfile, isAdmin, hasUnreadMessages } = useAuth();
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [pastCount, setPastCount] = useState(0);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const now = new Date();
        const appointmentsRef = collection(db, 'appointments');

        // Single query: get all user's appointments
        const userAptsQ = query(appointmentsRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(userAptsQ);
        const allApts = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => a.status === 'confirmed');

        // Client-side filter for upcoming vs past
        const upcoming = allApts
          .filter(a => a.dateTime?.toDate?.() >= now || a.dateTime >= now)
          .sort((a, b) => (a.dateTime?.toDate?.() || a.dateTime) - (b.dateTime?.toDate?.() || b.dateTime));
        const past = allApts.filter(a => (a.dateTime?.toDate?.() || a.dateTime) < now);

        setUpcomingCount(upcoming.length);
        setPastCount(past.length);

        if (upcoming.length > 0) {
          setNextAppointment(upcoming[0]);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const memberSince = userProfile?.createdAt?.toDate ? formatDate(userProfile.createdAt.toDate()) : 'Today';

  const getInitials = () => {
    const name = userProfile?.displayName || user?.displayName || 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statCards = [
    {
      icon: Calendar,
      label: 'Upcoming',
      value: loading ? '—' : upcomingCount,
      sub: 'Sessions scheduled',
      accent: 'from-gold/20 to-gold/5',
      iconBg: 'bg-gold/10',
    },
    {
      icon: Clock,
      label: 'Completed',
      value: loading ? '—' : pastCount,
      sub: 'Lessons finished',
      accent: 'from-gold-light/15 to-gold-light/5',
      iconBg: 'bg-gold-light/10',
    },
    {
      icon: Star,
      label: 'Member Since',
      value: loading ? '—' : memberSince,
      sub: 'Your journey began',
      accent: 'from-gold-dark/20 to-gold-dark/5',
      iconBg: 'bg-gold-dark/10',
    },
  ];

  const quickActions = [
    {
      icon: List,
      label: 'My Appointments',
      desc: 'View upcoming and past session history',
      to: '/appointments',
    },
    {
      icon: MessageSquare,
      label: isAdmin ? 'Inbox' : 'Message Dr. Li',
      desc: isAdmin ? 'View and reply to student messages' : 'Send a direct inquiry or question',
      to: isAdmin ? '/admin/messages' : '/messages',
      badge: hasUnreadMessages,
    },
    {
      icon: User,
      label: 'Edit Profile',
      desc: 'Update your personal information',
      to: '/profile',
    },
  ];

  return (
    <>
      <SEO title="Dashboard | Dr. Yirui Li" url="/dashboard" />
      <section className="min-h-screen bg-dark-900 pt-30 pb-8 relative flex flex-col">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.04)_0%,transparent_60%)]" />
          <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(197,160,89,0.02)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(197,160,89,0.015)_0%,transparent_70%)]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10 w-full">
          {/* Welcome Header */}
          <div className="flex items-center justify-between mb-12 animate-fadeInUp shrink-0">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-gold/25 to-gold/5 border border-gold/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-serif text-xl">{getInitials()}</span>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="font-serif text-2xl md:text-3xl text-white tracking-wide">{userProfile?.displayName || user?.displayName || 'Member'}</h1>
                <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mt-1">{greeting()}</p>
              </div>
            </div>

            {/* Admin badge */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:inline-flex items-center space-x-2 border border-gold/20 bg-gold/5 px-4 py-2 rounded-full hover:bg-gold/10 hover:border-gold/40 transition-all duration-300"
              >
                <Shield className="w-3.5 h-3.5 text-gold" />
                <span className="text-gold text-[10px] uppercase tracking-widest">Admin</span>
              </Link>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-8 p-4 rounded-sm border border-[#d9736c]/20 bg-[#d9736c]/5 animate-fadeInUp">
              <p className="text-[#d9736c] text-sm">Unable to load some data. Please check your connection and refresh.</p>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {statCards.map((stat, idx) => (
              <div
                key={idx}
                className="group relative glass-card rounded-sm border border-white/6 hover:border-gold/20 transition-all duration-500 animate-fadeInUp overflow-hidden"
                style={{ animationDelay: `${100 + idx * 80}ms` }}
              >
                {/* Subtle gradient overlay on hover */}
                <div className={`absolute inset-0 bg-linear-to-br ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-10 h-10 rounded-sm ${stat.iconBg} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-gold" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-600">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-serif text-white mb-1 tracking-tight">{stat.value}</p>
                  <p className="text-gray-600 text-xs tracking-wider">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Next Appointment & Quick Book Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-10">
            {/* Next Appointment Card - spans 3 cols */}
            <div
              className="lg:col-span-3 h-full glass-card rounded-sm border border-gold/15 overflow-hidden animate-fadeInUp flex flex-col"
              style={{ animationDelay: '350ms' }}
            >
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                <div className="flex items-center space-x-2 mb-5">
                  <Music className="w-4 h-4 text-gold/60" />
                  <p className="text-[10px] uppercase tracking-widest text-gold/60">Next Session</p>
                </div>

                {loading ? (
                  <div className="flex items-center space-x-3 py-2">
                    <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500 text-sm">Loading...</span>
                  </div>
                ) : nextAppointment ? (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
                    <div className="space-y-3">
                      <p className="text-white font-serif text-xl leading-relaxed">{getLessonTypeById(nextAppointment.lessonType)?.name || nextAppointment.lessonType}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span className="flex items-center space-x-1.5 text-gold">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{nextAppointment.dateTime?.toDate && formatDate(nextAppointment.dateTime.toDate())}</span>
                        </span>
                        <span className="flex items-center space-x-1.5 text-gray-400">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{nextAppointment.dateTime?.toDate && formatTime(nextAppointment.dateTime.toDate())}</span>
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/appointments"
                      className="self-end md:self-auto inline-flex items-center space-x-2 text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors group shrink-0"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm">No upcoming sessions scheduled.</p>
                    <Link
                      to="/booking"
                      className="inline-flex items-center space-x-2 text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
              {/* Accent line at bottom */}
              <div className="h-px bg-linear-to-r from-transparent via-gold/20 to-transparent w-full mt-auto" />
            </div>

            {/* Quick Book CTA - spans 2 cols */}
            <Link
              to="/booking"
              className="lg:col-span-2 h-full group relative glass-card rounded-sm border border-gold/20 hover:border-gold/40 overflow-hidden transition-all duration-500 animate-fadeInUp flex flex-col justify-center"
              style={{ animationDelay: '420ms' }}
            >
              <div className="absolute inset-0 bg-linear-to-br from-gold/6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 text-center flex flex-col items-center justify-center h-full">
                <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:border-gold/40 transition-all duration-500">
                  <Sparkles className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-white font-serif text-lg mb-2 group-hover:text-gold transition-colors duration-300">Book a Lesson</h3>
                <p className="text-gray-500 text-xs tracking-wider">Find your perfect time slot</p>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="animate-fadeInUp" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-px bg-linear-to-r from-gold/40 to-transparent" />
              <h2 className="font-serif text-lg text-white">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.to}
                  className={`group glass-card rounded-sm border transition-all duration-500 animate-fadeInUp ${
                    action.highlight ? 'border-gold/15 hover:border-gold/30' : 'border-white/6 hover:border-gold/20'
                  }`}
                  style={{ animationDelay: `${580 + idx * 70}ms` }}
                >
                  <div className="p-5 flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-sm bg-gold/7 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/12 transition-colors duration-300 relative">
                      <action.icon className="w-5 h-5 text-gold group-hover:scale-110 transition-transform duration-300" />
                      {action.badge && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#d9736c] border border-dark-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(217,115,108,0.4)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white text-sm font-medium group-hover:text-gold transition-colors duration-300">{action.label}</h3>
                      </div>
                      <p className="text-gray-600 text-xs mt-0.5 truncate">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Admin Quick Link (Mobile) */}
          {isAdmin && (
            <div className="mt-8 md:hidden animate-fadeInUp" style={{ animationDelay: '800ms' }}>
              <Link
                to="/admin"
                className="inline-flex items-center space-x-3 border border-gold/30 bg-gold/5 px-6 py-3 rounded-sm hover:bg-gold/10 hover:border-gold/50 transition-all duration-300 w-full justify-center"
              >
                <Shield className="w-5 h-5 text-gold" />
                <span className="text-gold text-xs uppercase tracking-widest">Admin Panel</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Dashboard;
