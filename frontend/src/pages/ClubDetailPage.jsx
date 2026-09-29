import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Users,
  Calendar,
  Megaphone,
  Award,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export const ClubDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [club, setClub] = useState(null);
  const [activeTab, setActiveTab] = useState('events');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Announcement modal state for club leaders
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');

  const fetchClub = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/clubs/${id}`);
      if (res.data.success) {
        setClub(res.data.club);
      }
    } catch (err) {
      console.error('Failed to load club:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClub();
  }, [id]);

  const handleJoinClub = async () => {
    setSubmitting(true);
    setErrorMsg('');
    setFeedbackMsg('');

    try {
      const res = await api.post(`/clubs/${id}/join`);
      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        await fetchClub();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to join club.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveClub = async () => {
    if (!window.confirm('Are you sure you wish to leave this club?')) return;

    setSubmitting(true);
    setErrorMsg('');
    setFeedbackMsg('');

    try {
      const res = await api.post(`/clubs/${id}/leave`);
      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        await fetchClub();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to leave club.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle || !announceContent) return;

    try {
      const res = await api.post('/announcements', {
        title: announceTitle,
        content: announceContent,
        audience: 'club',
        targetClub: id,
        priority: 'important',
      });

      if (res.data.success) {
        setShowAnnounceModal(false);
        setAnnounceTitle('');
        setAnnounceContent('');
        setFeedbackMsg('Club announcement published successfully.');
        await fetchClub();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to publish announcement.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-kiot-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Loading club mini-community...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-20">
        <h3 className="font-display font-bold text-lg text-slate-800">Club Not Found</h3>
        <Link to="/clubs" className="text-xs text-kiot-maroon font-bold">
          ← Back to Clubs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <Link
        to="/clubs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campus Clubs</span>
      </Link>

      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900">
        <div className="h-44 sm:h-64 overflow-hidden relative">
          <img
            src={club.coverImage}
            alt={club.name}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Profile Info Overlay */}
        <div className="p-6 sm:p-8 relative -mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6 z-10">
          <div className="flex items-end gap-4">
            <img
              src={club.logo}
              alt={club.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-white p-1 shadow-xl border border-slate-200"
            />
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-kiot-gold text-slate-950 shadow-sm">
                {club.category}
              </span>
              <h1 className="font-display text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                {club.name}
              </h1>
              <p className="text-xs text-slate-300">
                Department: {club.department} • Code: <span className="font-mono text-kiot-lightgold">{club.code}</span>
              </p>
            </div>
          </div>

          {/* Membership Actions */}
          <div className="flex items-center gap-3">
            {club.isLeader && (
              <button
                onClick={() => setShowAnnounceModal(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-4 h-4 text-kiot-gold" />
                <span>Post Announcement</span>
              </button>
            )}

            {club.isMember ? (
              <button
                type="button"
                disabled={submitting}
                onClick={handleLeaveClub}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-red-400 font-bold text-xs border border-slate-700 transition-colors"
              >
                Joined (Leave Club)
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleJoinClub}
                className="px-5 py-2.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white font-bold text-xs sm:text-sm shadow-md shadow-kiot-maroon/30 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-kiot-gold" />
                <span>Join Mini-Community</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Leadership & Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="kiot-card p-5 space-y-2 md:col-span-2">
          <h3 className="font-display font-bold text-sm text-slate-900">About the Club</h3>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
            {club.description}
          </p>
        </div>

        <div className="kiot-card p-5 space-y-3">
          <h3 className="font-display font-bold text-sm text-slate-900">Club Leadership</h3>
          <div className="space-y-3">
            {club.facultyAdvisor && (
              <div className="flex items-center gap-3">
                <img
                  src={club.facultyAdvisor.avatar}
                  alt={club.facultyAdvisor.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">{club.facultyAdvisor.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Faculty Advisor</p>
                </div>
              </div>
            )}

            {club.clubLeader && (
              <div className="flex items-center gap-3">
                <img
                  src={club.clubLeader.avatar}
                  alt={club.clubLeader.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">{club.clubLeader.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Club Leader (President)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Events, Announcements, Members */}
      <div className="space-y-4">
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
            <span>Club Events ({club.events?.length || 0})</span>
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
            <span>Announcements ({club.announcements?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'members'
                ? 'border-kiot-maroon text-kiot-maroon'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Member Roster ({club.members?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Events */}
        {activeTab === 'events' && (
          <div>
            {!club.events || club.events.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center bg-white rounded-2xl border border-slate-200">
                No events published by this club yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {club.events.map((evt) => (
                  <Link
                    key={evt._id}
                    to={`/events/${evt._id}`}
                    className="kiot-card overflow-hidden block group"
                  >
                    <img
                      src={evt.poster}
                      alt={evt.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-extrabold uppercase text-kiot-gold bg-slate-900 px-2 py-0.5 rounded">
                        {evt.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                        {evt.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {new Date(evt.date).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Announcements */}
        {activeTab === 'announcements' && (
          <div className="space-y-3">
            {!club.announcements || club.announcements.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center bg-white rounded-2xl border border-slate-200">
                No club announcements published yet.
              </p>
            ) : (
              club.announcements.map((ann) => (
                <div key={ann._id} className="kiot-card p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold uppercase text-kiot-maroon">Official Club Notice</span>
                    <span>{new Date(ann.publishDate).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{ann.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Members */}
        {activeTab === 'members' && (
          <div className="kiot-card p-4">
            <div className="divide-y divide-slate-100">
              {club.members?.map((m, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        m.user?.avatar ||
                        `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(m.user?.name || 'Student')}`
                      }
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

      {/* Post Announcement Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Publish Club Announcement
            </h3>
            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Workshop Schedule"
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
                  placeholder="Details of the announcement..."
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-kiot-maroon text-white rounded-xl hover:bg-kiot-crimson shadow-md"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
