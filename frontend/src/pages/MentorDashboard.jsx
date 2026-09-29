import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  Search,
  Users,
  MapPin,
  Clock,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const MentorDashboard = () => {
  const { user } = useAuth();

  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('roster');

  // Announcement state
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceLoading, setAnnounceLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMentorData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/presence/mentees');
      if (res.data.success) {
        setMentees(res.data.mentees);
      }
    } catch (err) {
      console.error('Failed to load mentor cohort:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
  }, [user]);

  const handlePublishCohortAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle || !announceContent) return;

    setAnnounceLoading(true);
    setFeedbackMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/announcements', {
        title: announceTitle,
        content: announceContent,
        audience: 'department',
        targetDepartment: user?.department || 'CSE',
        priority: 'important',
      });

      if (res.data.success) {
        setFeedbackMsg('Mentorship cohort notice broadcasted successfully.');
        setAnnounceTitle('');
        setAnnounceContent('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to publish announcement.');
    } finally {
      setAnnounceLoading(false);
    }
  };

  const filteredMentees = mentees.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.registerNumber && m.registerNumber.toLowerCase().includes(q)) ||
      m.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Faculty Mentorship Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Scoped Mentorship Cohort • {user?.name} ({user?.department} Department)
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Cohort Access Scoped to Assigned Mentees Only</span>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kiot-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Assigned Mentees</span>
            <Users className="w-4 h-4 text-kiot-maroon" />
          </div>
          <p className="font-display font-extrabold text-2xl text-slate-900">{mentees.length}</p>
          <p className="text-[11px] text-slate-500">Cohort A & B Students</p>
        </div>

        <div className="kiot-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Presence Surveillance Scope</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-display font-extrabold text-lg text-emerald-700">Strictly Scoped</p>
          <p className="text-[11px] text-slate-500">Non-mentees are protected from query</p>
        </div>

        <div className="kiot-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Institution</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-display font-bold text-sm text-slate-900 truncate">
            Knowledge Institute of Tech
          </p>
          <p className="text-[11px] text-slate-500 font-mono">kiot.ac.in</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'roster'
              ? 'border-kiot-maroon text-kiot-maroon'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Mentee Cohort Roster ({mentees.length})</span>
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
          <span>Publish Cohort Announcement</span>
        </button>
      </div>

      {/* Tab 1: Mentee Roster with Search */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search assigned mentees by Register Number or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading mentees...</div>
          ) : filteredMentees.length === 0 ? (
            <div className="kiot-card p-12 text-center text-slate-500 text-xs">
              No assigned mentees match your search query.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMentees.map((m) => (
                <div key={m._id} className="kiot-card p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 bg-slate-100"
                    />
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-900">{m.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono font-semibold">
                        {m.registerNumber}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-slate-800">{m.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Year / Section:</span>
                      <span className="font-semibold text-slate-800">
                        Year {m.year} • Sec {m.section}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-mono text-slate-700">{m.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Presence Check Link */}
                  <a
                    href={`/map`}
                    className="block w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center transition-colors"
                  >
                    Check Presence on Map →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Broadcast Announcement */}
      {activeTab === 'announcements' && (
        <div className="kiot-card p-6 space-y-4 max-w-2xl">
          <h3 className="font-display font-bold text-base text-slate-900">
            Publish Notice to Mentorship Cohort
          </h3>
          <p className="text-xs text-slate-500">
            Broadcast important announcements, review schedules, or academic deadlines to your department students.
          </p>

          <form onSubmit={handlePublishCohortAnnouncement} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title</label>
              <input
                type="text"
                required
                placeholder="e.g. CIA-II Review Meeting & Project Progress Sync"
                value={announceTitle}
                onChange={(e) => setAnnounceTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notice Content</label>
              <textarea
                required
                rows={4}
                placeholder="Provide detailed instructions, venue, time..."
                value={announceContent}
                onChange={(e) => setAnnounceContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={announceLoading}
              className="px-5 py-2.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white font-bold text-xs shadow-md shadow-kiot-maroon/20 transition-all disabled:opacity-50"
            >
              {announceLoading ? 'Publishing...' : 'Broadcast Notice'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
