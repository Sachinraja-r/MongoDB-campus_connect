import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { HeroSlider } from '../components/HeroSlider';
import {
  Calendar,
  Compass,
  Megaphone,
  QrCode,
  Users,
  Award,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { openQrScanner } = useOutletContext() || {};

  const [slides, setSlides] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student weekly activity chart mock data
  const activityData = [
    { name: 'Mon', hours: 2, points: 20 },
    { name: 'Tue', hours: 3.5, points: 35 },
    { name: 'Wed', hours: 1.5, points: 15 },
    { name: 'Thu', hours: 4, points: 40 },
    { name: 'Fri', hours: 5, points: 50 },
    { name: 'Sat', hours: 3, points: 30 },
    { name: 'Sun', hours: 1, points: 10 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [slidesRes, eventsRes, regRes, announceRes, clubsRes] = await Promise.all([
          api.get('/hero-slides/active'),
          api.get('/events?featured=true'),
          api.get('/events/my/registrations'),
          api.get('/announcements'),
          api.get('/clubs'),
        ]);

        if (slidesRes.data.success) setSlides(slidesRes.data.slides);
        if (eventsRes.data.success) setUpcomingEvents(eventsRes.data.events.slice(0, 4));
        if (regRes.data.success) setRegisteredEvents(regRes.data.registrations.slice(0, 3));
        if (announceRes.data.success) setAnnouncements(announceRes.data.announcements.slice(0, 3));
        if (clubsRes.data.success) setClubs(clubsRes.data.clubs.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const isCurrentlyIn = user?.presence?.status === 'IN';

  return (
    <div className="space-y-8 pb-10">
      {/* Moving Hero Promotional Section */}
      <HeroSlider slides={slides} />

      {/* Live Campus Presence Banner Card */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
              isCurrentlyIn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCurrentlyIn ? 'bg-emerald-400 pulse-green' : 'bg-slate-400'
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Campus Presence
              </span>
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-white mt-0.5">
              {isCurrentlyIn ? (
                <>
                  Checked IN at <span className="text-kiot-gold">{user?.presence?.locationName}</span>
                </>
              ) : (
                'Currently OUT of Monitored Locations'
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isCurrentlyIn
                ? `Active session since ${new Date(user?.presence?.enteredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Visible only to accepted peers.`
                : 'Zero GPS tracking active. Scan any campus location placard to check in.'}
            </p>
          </div>
        </div>

        <button
          onClick={openQrScanner}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 shrink-0 ${
            isCurrentlyIn
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-kiot-maroon hover:bg-kiot-crimson text-white shadow-kiot-maroon/30'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>{isCurrentlyIn ? 'Scan to Check OUT' : 'Scan Location QR'}</span>
        </button>
      </div>

      {/* Grid: Events & Registered Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recommended Events & Contests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
                Upcoming Events & Contests
              </h3>
              <p className="text-xs text-slate-500">
                Personalized for {user?.department || 'CSE'} Department • Year {user?.year || 2}
              </p>
            </div>
            <Link
              to="/events"
              className="text-xs font-bold text-kiot-maroon hover:text-kiot-crimson flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcomingEvents.map((evt) => (
              <div
                key={evt._id}
                className="kiot-card overflow-hidden flex flex-col group"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={evt.poster}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-950/80 text-kiot-gold backdrop-blur-sm border border-white/10">
                      {evt.category}
                    </span>
                  </div>
                  {evt.isRegistered && (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Registered
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 group-hover:text-kiot-maroon transition-colors line-clamp-1">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(evt.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="max-w-[120px] truncate">{evt.venue}</span>
                    </div>
                  </div>

                  <Link
                    to={`/events/${evt._id}`}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-kiot-maroon hover:text-white text-slate-800 text-xs font-bold transition-all text-center"
                  >
                    {evt.isRegistered ? 'View Registration' : 'Event Details & Register'}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Metrics Chart */}
          <div className="kiot-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-kiot-maroon/10 text-kiot-maroon">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    Campus Engagement & Activity Points
                  </h4>
                  <p className="text-[11px] text-slate-500">Weekly participation tracking</p>
                </div>
              </div>
              <span className="text-xs font-bold text-kiot-maroon font-mono">195 Total Pts</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="points" fill="#800000" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Registered Events, Announcements & Club Highlights */}
        <div className="space-y-6">
          {/* My Registered Events */}
          <div className="kiot-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-kiot-maroon" />
                My Enrolled Events
              </h4>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {registeredEvents.length}
              </span>
            </div>

            {registeredEvents.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                You haven't enrolled in any events yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {registeredEvents.map((reg) => (
                  <Link
                    key={reg._id}
                    to={`/events/${reg.event?._id}`}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 block transition-all group"
                  >
                    <p className="text-xs font-bold text-slate-900 group-hover:text-kiot-maroon truncate">
                      {reg.event?.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
                      <span>{new Date(reg.event?.date).toLocaleDateString()}</span>
                      <span className="text-emerald-700 font-semibold uppercase text-[10px]">
                        ● {reg.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Official Campus Announcements */}
          <div className="kiot-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-kiot-amber" />
                Campus Notices
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Official
              </span>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        ann.priority === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : ann.priority === 'important'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.publishDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 leading-snug">
                    {ann.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Club Communities */}
          <div className="kiot-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                Active Campus Clubs
              </h4>
              <Link to="/clubs" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                Explore
              </Link>
            </div>

            <div className="space-y-2">
              {clubs.map((c) => (
                <Link
                  key={c._id}
                  to={`/clubs/${c._id}`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={c.logo}
                      alt={c.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-kiot-maroon truncate max-w-[150px]">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{c.department}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {c.memberCount} members
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
