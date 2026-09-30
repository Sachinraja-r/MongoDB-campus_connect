import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Calendar,
  Compass,
  QrCode,
  Megaphone,
  UserCheck,
  Sliders,
  FileText,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Search,
  Lock,
  KeyRound,
} from 'lucide-react';

export const CmsDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authorized Users State
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  const [authUserSearch, setAuthUserSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: 'CSE',
    year: 1,
    section: 'A',
    role: 'student',
    status: 'active',
    password: '',
  });

  // Mentor Assignment State
  const [facultyList, setFacultyList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // QR Locations State
  const [locations, setLocations] = useState([]);
  const [newLocName, setNewLocName] = useState('');
  const [newLocCode, setNewLocCode] = useState('');
  const [newLocType, setNewLocType] = useState('Classroom');
  const [newLocBuilding, setNewLocBuilding] = useState('Main Academic Block');
  const [newLocFloor, setNewLocFloor] = useState('Ground Floor');

  // Hero Slides State
  const [slides, setSlides] = useState([]);
  const [newSlide, setNewSlide] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    tag: 'FEATURED',
    ctaLabel: 'Explore Now',
    ctaDestination: '/events',
    order: 1,
  });

  // System Settings State
  const [settings, setSettings] = useState(null);

  // Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cms/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentLogs(res.data.recentLogs);
      }
    } catch (err) {
      console.error('Failed to load CMS stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorizedUsers = async () => {
    try {
      const res = await api.get('/cms/authorized-users');
      if (res.data.success) setAuthorizedUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMentorAssignData = async () => {
    try {
      const [facRes, studRes] = await Promise.all([
        api.get('/cms/users?role=faculty'),
        api.get('/cms/users?role=student'),
      ]);
      if (facRes.data.success) setFacultyList(facRes.data.users);
      if (studRes.data.success) setStudentList(studRes.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get('/cms/locations');
      if (res.data.success) setLocations(res.data.locations);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHeroSlides = async () => {
    try {
      const res = await api.get('/hero-slides/all');
      if (res.data.success) setSlides(res.data.slides);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/cms/settings');
      if (res.data.success) setSettings(res.data.settings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchAuthorizedUsers();
    if (activeTab === 'mentors') fetchMentorAssignData();
    if (activeTab === 'locations') fetchLocations();
    if (activeTab === 'slides') fetchHeroSlides();
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab]);

  // Seed / Reset Demo Data Action
  const handleSeedDemoData = async () => {
    if (
      !window.confirm(
        'Are you sure you want to reset and re-seed the full KIOT prototype dataset? This will repopulate authentic students, mentors, clubs, QR locations, and events.'
      )
    ) {
      return;
    }

    setActionLoading(true);
    setFeedbackMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/cms/seed-demo-data');
      if (res.data.success) {
        setFeedbackMsg('KIOT CampusConnect Demo Data successfully synchronized and seeded!');
        await fetchOverview();
        if (activeTab === 'users') await fetchAuthorizedUsers();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to seed demo data.');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Authorized User
  const handleCreateAuthorizedUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/cms/authorized-users', newUser);
      if (res.data.success) {
        setFeedbackMsg(`User ${newUser.name} authorized successfully.`);
        setShowAddUserModal(false);
        setNewUser({
          name: '',
          email: '',
          registerNumber: '',
          department: 'CSE',
          year: 1,
          section: 'A',
          role: 'student',
          status: 'active',
          password: '',
        });
        await fetchAuthorizedUsers();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add user.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reset User Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModalUser) return;
    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await api.put(`/cms/authorized-users/${resetModalUser._id}/reset-password`, {
        newPassword: newPasswordInput || 'kiot@2026',
      });
      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        setShowResetPasswordModal(false);
        setResetModalUser(null);
        setNewPasswordInput('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setActionLoading(false);
    }
  };

  // Assign Mentor to Students
  const handleAssignMentor = async (e) => {
    e.preventDefault();
    if (!selectedMentorId || selectedStudentIds.length === 0) {
      setErrorMsg('Please select a faculty mentor and at least one student.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/cms/mentors/assign', {
        mentorId: selectedMentorId,
        studentIds: selectedStudentIds,
      });

      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        setSelectedStudentIds([]);
        await fetchMentorAssignData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to assign mentor.');
    } finally {
      setActionLoading(false);
    }
  };

  // Create QR Location
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/cms/locations', {
        name: newLocName,
        code: newLocCode,
        locationType: newLocType,
        building: newLocBuilding,
        floor: newLocFloor,
      });

      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        setNewLocName('');
        setNewLocCode('');
        await fetchLocations();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create QR location.');
    } finally {
      setActionLoading(false);
    }
  };

  // Regenerate QR
  const handleRegenerateQr = async (locationId) => {
    try {
      const res = await api.post(`/cms/locations/${locationId}/regenerate`);
      if (res.data.success) {
        setFeedbackMsg('QR Code regenerated successfully.');
        await fetchLocations();
      }
    } catch (err) {
      setErrorMsg('Failed to regenerate QR code.');
    }
  };

  // Add Hero Slide
  const handleCreateHeroSlide = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/hero-slides', newSlide);
      if (res.data.success) {
        setFeedbackMsg('Hero slide created successfully.');
        setNewSlide({
          title: '',
          subtitle: '',
          description: '',
          image: '',
          tag: 'FEATURED',
          ctaLabel: 'Explore Now',
          ctaDestination: '/events',
          order: 1,
        });
        await fetchHeroSlides();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create slide.');
    } finally {
      setActionLoading(false);
    }
  };

  // Broadcast Notification
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    setActionLoading(true);
    try {
      const res = await api.post('/cms/broadcast', {
        title: broadcastTitle,
        message: broadcastMessage,
        targetRole: 'all',
      });
      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        setBroadcastTitle('');
        setBroadcastMessage('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to broadcast notification.');
    } finally {
      setActionLoading(false);
    }
  };

  // Update System Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.put('/cms/settings', settings);
      if (res.data.success) {
        setFeedbackMsg('System settings saved successfully.');
      }
    } catch (err) {
      setErrorMsg('Failed to update settings.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* CMS Privileged Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-kiot-darkmaroon text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-kiot-gold text-slate-950 shadow-sm">
            <Lock className="w-3 h-3" />
            <span>Privileged System Control Center</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            CampusConnect System Architecture CMS
          </h1>
          <p className="text-xs text-slate-300">
            Administrative governance layer for Knowledge Institute of Technology.
          </p>
        </div>

        {/* 1-Click Demo Seed / Reset Action */}
        <button
          onClick={handleSeedDemoData}
          disabled={actionLoading}
          className="px-5 py-3 rounded-2xl bg-kiot-gold hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
          <span>Sync / Reset KIOT Demo Data</span>
        </button>
      </div>

      {/* Global Alerts */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CMS Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & Stats', icon: ShieldCheck },
          { id: 'users', label: 'Authorized Users DB', icon: Users },
          { id: 'mentors', label: 'Mentor Assignments', icon: UserCheck },
          { id: 'locations', label: 'QR Locations & Placards', icon: QrCode },
          { id: 'slides', label: 'Dashboard Hero Slides', icon: Sliders },
          { id: 'broadcast', label: 'Broadcast Center', icon: Megaphone },
          { id: 'audit', label: 'System Audit Trail', icon: FileText },
          { id: 'settings', label: 'Institutional Config', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFeedbackMsg('');
                setErrorMsg('');
              }}
              className={`pb-3 px-2 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-kiot-maroon text-kiot-maroon'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Overview & Stats */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="kiot-card p-5 space-y-1">
                <span className="text-slate-500 text-xs font-semibold">Total Students</span>
                <p className="font-display font-extrabold text-2xl text-slate-900">
                  {stats.totalStudents}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold">Active in DB</span>
              </div>

              <div className="kiot-card p-5 space-y-1">
                <span className="text-slate-500 text-xs font-semibold">Faculty & Mentors</span>
                <p className="font-display font-extrabold text-2xl text-slate-900">
                  {stats.totalFaculty}
                </p>
                <span className="text-[10px] text-blue-600 font-bold">Scoped Mentorship</span>
              </div>

              <div className="kiot-card p-5 space-y-1">
                <span className="text-slate-500 text-xs font-semibold">Active Presence Sessions</span>
                <p className="font-display font-extrabold text-2xl text-emerald-600">
                  {stats.currentActivePresence}
                </p>
                <span className="text-[10px] text-emerald-700 font-bold">🟢 Checked IN Now</span>
              </div>

              <div className="kiot-card p-5 space-y-1">
                <span className="text-slate-500 text-xs font-semibold">Event Registrations</span>
                <p className="font-display font-extrabold text-2xl text-kiot-maroon">
                  {stats.totalRegistrations}
                </p>
                <span className="text-[10px] text-slate-500 font-bold">Across all events</span>
              </div>
            </div>
          )}

          {/* Recent Audit Logs & System Health */}
          <div className="kiot-card p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-kiot-maroon" />
              Live System Activity & Audit Trail
            </h3>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {recentLogs.map((log) => (
                <div key={log._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{log.action}</span>
                    <p className="text-[11px] text-slate-500 font-mono">
                      By {log.actorEmail} ({log.actorRole}) • Target: {log.targetType}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Authorized Users DB (Layer 2 Auth Enforcement) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Authorized User Database (Gateway Authorization)
              </h3>
              <p className="text-xs text-slate-500">
                Only emails pre-registered and marked Active can log in via Google Workspace.
              </p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 rounded-xl bg-kiot-maroon text-white font-bold text-xs hover:bg-kiot-crimson flex items-center gap-1.5 shadow-md shadow-kiot-maroon/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Authorize New User</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search authorized accounts by email, register number, or name..."
              value={authUserSearch}
              onChange={(e) => setAuthUserSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Users Table */}
          <div className="kiot-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">User & Register No</th>
                    <th className="p-3">Institutional Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {authorizedUsers
                    .filter((u) => {
                      if (!authUserSearch.trim()) return true;
                      const q = authUserSearch.toLowerCase();
                      return (
                        u.name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        (u.registerNumber && u.registerNumber.toLowerCase().includes(q))
                      );
                    })
                    .map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {u.registerNumber || 'N/A'}
                          </p>
                        </td>
                        <td className="p-3 font-mono text-slate-700">{u.email}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">{u.department}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => {
                                setResetModalUser(u);
                                setNewPasswordInput('');
                                setShowResetPasswordModal(true);
                              }}
                              className="text-[11px] font-bold text-amber-750 hover:text-amber-900 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all"
                              title="Reset login credentials"
                            >
                              <KeyRound className="w-3 h-3 text-amber-600" />
                              <span>Reset Pass</span>
                            </button>
                            <button
                              onClick={async () => {
                                const newStatus = u.status === 'active' ? 'disabled' : 'active';
                                await api.put(`/cms/authorized-users/${u._id}`, { status: newStatus });
                                await fetchAuthorizedUsers();
                              }}
                              className="text-[11px] font-bold text-kiot-maroon hover:underline"
                            >
                              Toggle {u.status === 'active' ? 'Disable' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Mentor Assignments Wizard */}
      {activeTab === 'mentors' && (
        <div className="kiot-card p-6 space-y-6">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Mentor-to-Mentee Assignment Wizard
            </h3>
            <p className="text-xs text-slate-500">
              Select a faculty mentor, then choose which students belong to their scoped mentorship cohort. Mentors can only query presence for their assigned cohort.
            </p>
          </div>

          <form onSubmit={handleAssignMentor} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Select Faculty Mentor
              </label>
              <select
                required
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="w-full max-w-md px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none bg-white"
              >
                <option value="">-- Choose Faculty Mentor --</option>
                {facultyList.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.department} - {f.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Select Students to Assign ({selectedStudentIds.length} selected)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50">
                {studentList.map((s) => {
                  const isChecked = selectedStudentIds.includes(s._id);
                  return (
                    <label
                      key={s._id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-kiot-maroon/10 border-kiot-maroon text-kiot-maroon font-bold'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudentIds((prev) => [...prev, s._id]);
                          } else {
                            setSelectedStudentIds((prev) => prev.filter((id) => id !== s._id));
                          }
                        }}
                        className="rounded text-kiot-maroon focus:ring-kiot-maroon"
                      />
                      <div className="truncate">
                        <p className="truncate font-semibold">{s.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {s.registerNumber} • {s.department}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading || !selectedMentorId || selectedStudentIds.length === 0}
              className="px-6 py-2.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white font-bold text-xs shadow-md shadow-kiot-maroon/20 transition-all disabled:opacity-50"
            >
              Save Mentorship Assignment
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: QR Locations & Placards */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="kiot-card p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Create Monitored Campus QR Location
            </h3>
            <form onSubmit={handleCreateLocation} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical CAD Lab"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Code (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MECH_CAD_LAB"
                  value={newLocCode}
                  onChange={(e) => setNewLocCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                <select
                  value={newLocType}
                  onChange={(e) => setNewLocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none bg-white"
                >
                  <option value="Seminar Hall">Seminar Hall</option>
                  <option value="Computer Laboratory">Computer Laboratory</option>
                  <option value="Auditorium">Auditorium</option>
                  <option value="Library">Library</option>
                  <option value="Classroom">Classroom</option>
                  <option value="Innovation Center">Innovation Center</option>
                  <option value="Campus Entrance">Campus Entrance</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white font-bold text-xs shadow-md shadow-kiot-maroon/20 transition-all"
                >
                  Generate Location QR Placard
                </button>
              </div>
            </form>
          </div>

          {/* Locations Grid with QR Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div
                key={loc._id}
                className="kiot-card p-5 space-y-3 flex flex-col items-center text-center"
              >
                <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  {loc.qrCodeDataUrl ? (
                    <img src={loc.qrCodeDataUrl} alt={loc.name} className="w-36 h-36" />
                  ) : (
                    <QrCode className="w-36 h-36 text-slate-300" />
                  )}
                </div>

                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900">{loc.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    {loc.building} • {loc.floor}
                  </p>
                  <p className="text-[10px] font-mono text-kiot-maroon font-bold mt-1">
                    {loc.qrIdentifier}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleRegenerateQr(loc._id)}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
                  >
                    Regenerate QR
                  </button>
                  <a
                    href={loc.qrCodeDataUrl}
                    download={`${loc.code}_QR.png`}
                    className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Dashboard Hero Slides */}
      {activeTab === 'slides' && (
        <div className="space-y-6">
          <div className="kiot-card p-6 space-y-4 max-w-2xl">
            <h3 className="font-display font-bold text-base text-slate-900">
              Create Promotional Hero Slide
            </h3>
            <form onSubmit={handleCreateHeroSlide} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slide Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Technical Symposium 2026"
                  value={newSlide.title}
                  onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Knowledge Institute of Technology"
                  value={newSlide.subtitle}
                  onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newSlide.image}
                  onChange={(e) => setNewSlide({ ...newSlide, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white font-bold text-xs shadow-md shadow-kiot-maroon/20"
              >
                Add Hero Slide
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slides.map((s) => (
              <div key={s._id} className="kiot-card overflow-hidden">
                <img src={s.image} alt={s.title} className="w-full h-36 object-cover" />
                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase bg-kiot-gold text-slate-900 px-2 py-0.5 rounded">
                    {s.tag}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">{s.title}</h4>
                  <p className="text-xs text-slate-500">{s.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Broadcast Center */}
      {activeTab === 'broadcast' && (
        <div className="kiot-card p-6 space-y-4 max-w-xl">
          <h3 className="font-display font-bold text-base text-slate-900">
            Institution-Wide Notification Broadcast
          </h3>
          <p className="text-xs text-slate-500">
            Sends high-priority notifications to all active students and faculty across KIOT.
          </p>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alert Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Campus Holiday / Special Orientation Schedule"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
              <textarea
                required
                rows={4}
                placeholder="Detailed message..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white font-bold text-xs shadow-md shadow-kiot-maroon/20"
            >
              Broadcast Alert to All Users
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: System Audit Trail */}
      {activeTab === 'audit' && (
        <div className="kiot-card p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-slate-900">
            Security & Administrative Audit Logs
          </h3>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {recentLogs.map((log) => (
              <div key={log._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono font-bold text-slate-900">{log.action}</p>
                  <p className="text-[11px] text-slate-500">
                    Actor: {log.actorEmail} ({log.actorRole}) • IP: {log.ipAddress}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: Institutional Config */}
      {activeTab === 'settings' && settings && (
        <div className="kiot-card p-6 space-y-4 max-w-xl">
          <h3 className="font-display font-bold text-base text-slate-900">
            Institutional Settings & Domain Security
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Allowed College Domain
              </label>
              <input
                type="text"
                value={settings.allowedDomain}
                onChange={(e) => setSettings({ ...settings, allowedDomain: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Google logins are verified against this domain (e.g. kiot.ac.in).
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={settings.enforceDomainRestriction}
                  onChange={(e) =>
                    setSettings({ ...settings, enforceDomainRestriction: e.target.checked })
                  }
                  className="rounded text-kiot-maroon focus:ring-kiot-maroon"
                />
                <span>Strictly enforce domain restriction on login</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={settings.allowDemoBypass}
                  onChange={(e) =>
                    setSettings({ ...settings, allowDemoBypass: e.target.checked })
                  }
                  className="rounded text-kiot-maroon focus:ring-kiot-maroon"
                />
                <span>Enable Rapid Persona Switcher for evaluation/testing</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white font-bold text-xs shadow-md shadow-kiot-maroon/20"
            >
              Save Institutional Configuration
            </button>
          </form>
        </div>
      )}

      {/* Authorize User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Authorize New KIOT User
            </h3>

            <form onSubmit={handleCreateAuthorizedUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar S"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.24cse080@kiot.ac.in"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Register No</label>
                  <input
                    type="text"
                    placeholder="2K24CSE080"
                    value={newUser.registerNumber}
                    onChange={(e) => setNewUser({ ...newUser, registerNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="mentor">Mentor</option>
                    <option value="club_admin">Club Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Login Password <span className="text-slate-400 font-normal">(Default: kiot@2026)</span>
                </label>
                <input
                  type="text"
                  placeholder="Leave blank for default: kiot@2026"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold bg-kiot-maroon text-white rounded-xl hover:bg-kiot-crimson shadow-md"
                >
                  Authorize User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Reset User Password
                </h3>
                <p className="text-xs text-slate-500">
                  Manage login credentials for <strong className="text-slate-800">{resetModalUser.name}</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1 text-slate-600 font-mono">
              <p>Username / Email: <span className="text-slate-900 font-bold">{resetModalUser.email}</span></p>
              <p>Roll Number: <span className="text-slate-900 font-bold">{resetModalUser.registerNumber || 'N/A'}</span></p>
              <p>Institutional Role: <span className="uppercase text-slate-900 font-bold">{resetModalUser.role}</span></p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  placeholder="Enter new password (or leave blank for kiot@2026)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave blank to reset to the default institution password (<code>kiot@2026</code>).
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setResetModalUser(null);
                    setNewPasswordInput('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold bg-kiot-maroon text-white rounded-xl hover:bg-kiot-crimson shadow-md flex items-center gap-1.5"
                >
                  {actionLoading ? 'Updating…' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
