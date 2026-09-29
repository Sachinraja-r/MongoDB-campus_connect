import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Users,
  Calendar,
  Megaphone,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Building,
} from 'lucide-react';

export const ClubAdminDashboard = () => {
  const { user } = useAuth();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');

  // Create Event Form
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('Technical');
  const [eventDate, setEventDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('09:30 AM');
  const [eventEndTime, setEventEndTime] = useState('04:30 PM');
  const [eventVenue, setEventVenue] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventMaxParts, setEventMaxParts] = useState(100);
  const [eventPoster, setEventPoster] = useState('');
  const [eventPrizes, setEventPrizes] = useState('');
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Announcement Form
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [submittingAnnounce, setSubmittingAnnounce] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchClubData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clubs');
      if (res.data.success) {
        // Find club where user is clubLeader or coordinator
        const myClub = res.data.clubs.find(
          (c) =>
            c.clubLeader?._id === user?._id ||
            c.clubLeader === user?._id ||
            c.facultyAdvisor?._id === user?._id
        ) || res.data.clubs[0]; // fallback to first club for admin

        if (myClub) {
          const detailRes = await api.get(`/clubs/${myClub._id}`);
          if (detailRes.data.success) {
            setClub(detailRes.data.club);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load club admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubData();
  }, [user]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmittingEvent(true);
    setFeedbackMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/events', {
        title: eventTitle,
        category: eventCategory,
        poster: eventPoster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
        description: eventDesc,
        clubId: club._id,
        department: club.department,
        date: eventDate,
        startTime: eventStartTime,
        endTime: eventEndTime,
        venue: eventVenue,
        maxParticipants: Number(eventMaxParts),
        registrationDeadline: eventDate,
        prizes: eventPrizes,
        isFeatured: true,
      });

      if (res.data.success) {
        setFeedbackMsg(`Event "${eventTitle}" created and published successfully!`);
        setEventTitle('');
        setEventDesc('');
        setEventVenue('');
        setEventPoster('');
        setEventPrizes('');
        await fetchClubData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setSubmittingAnnounce(true);
    setFeedbackMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/announcements', {
        title: announceTitle,
        content: announceContent,
        audience: 'club',
        targetClub: club._id,
        priority: 'important',
      });

      if (res.data.success) {
        setFeedbackMsg('Club announcement published successfully.');
        setAnnounceTitle('');
        setAnnounceContent('');
        await fetchClubData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to post announcement.');
    } finally {
      setSubmittingAnnounce(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-500">Loading club studio...</div>;
  }

  if (!club) {
    return (
      <div className="py-16 text-center text-xs text-slate-500">
        No assigned club found under your credentials.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Club Leadership Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Managing <span className="font-bold text-kiot-maroon">{club.name}</span> ({club.code})
          </p>
        </div>
      </div>

      {/* Alerts */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Club Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kiot-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Enrolled Club Members</span>
            <Users className="w-4 h-4 text-kiot-maroon" />
          </div>
          <p className="font-display font-extrabold text-2xl text-slate-900">
            {club.members?.length || 0}
          </p>
        </div>

        <div className="kiot-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Published Events</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-display font-extrabold text-2xl text-slate-900">
            {club.events?.length || 0}
          </p>
        </div>

        <div className="kiot-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Announcements</span>
            <Megaphone className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-display font-extrabold text-2xl text-slate-900">
            {club.announcements?.length || 0}
          </p>
        </div>
      </div>

      {/* Tabs: Create Event, Post Announcement, Member Roster */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'events'
              ? 'border-kiot-maroon text-kiot-maroon'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Create & Manage Events</span>
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'border-kiot-maroon text-kiot-maroon'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Publish Announcements</span>
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'roster'
              ? 'border-kiot-maroon text-kiot-maroon'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Member Roster</span>
        </button>
      </div>

      {/* Tab 1: Event Creation Wizard */}
      {activeTab === 'events' && (
        <div className="kiot-card p-6 space-y-4 max-w-2xl">
          <h3 className="font-display font-bold text-base text-slate-900">
            Create & Publish Club Event
          </h3>

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. CodeStorm: 24-Hour Hackathon"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none bg-white"
                >
                  <option value="Technical">Technical</option>
                  <option value="Coding">Coding</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Competition">Competition</option>
                  <option value="Innovation">Innovation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                <input
                  type="text"
                  placeholder="09:30 AM"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                <input
                  type="text"
                  placeholder="04:30 PM"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Capacity</label>
                <input
                  type="number"
                  min="10"
                  value={eventMaxParts}
                  onChange={(e) => setEventMaxParts(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Venue</label>
              <input
                type="text"
                required
                placeholder="e.g. Seminar Hall A, Main Academic Block"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                placeholder="Detailed event agenda, schedule, eligibility..."
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prizes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. ₹10,000 Cash Pool + Certificates"
                value={eventPrizes}
                onChange={(e) => setEventPrizes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingEvent}
              className="px-6 py-2.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white font-bold text-xs shadow-md shadow-kiot-maroon/20 transition-all disabled:opacity-50"
            >
              {submittingEvent ? 'Publishing...' : 'Publish Event'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Announcements */}
      {activeTab === 'announcements' && (
        <div className="kiot-card p-6 space-y-4 max-w-2xl">
          <h3 className="font-display font-bold text-base text-slate-900">
            Publish Club Announcement
          </h3>
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Weekly Club Hack Session"
                value={announceTitle}
                onChange={(e) => setAnnounceTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Content</label>
              <textarea
                required
                rows={4}
                placeholder="Message for members..."
                value={announceContent}
                onChange={(e) => setAnnounceContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingAnnounce}
              className="px-6 py-2.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white font-bold text-xs shadow-md shadow-kiot-maroon/20 transition-all disabled:opacity-50"
            >
              {submittingAnnounce ? 'Publishing...' : 'Publish to Club'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Member Roster */}
      {activeTab === 'roster' && (
        <div className="kiot-card p-5">
          <div className="divide-y divide-slate-100">
            {club.members?.map((m, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={m.user?.avatar}
                    alt={m.user?.name}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{m.user?.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {m.user?.registerNumber} • {m.user?.department}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {m.clubRole || 'Member'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
