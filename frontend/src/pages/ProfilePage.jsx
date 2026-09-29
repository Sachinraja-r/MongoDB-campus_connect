import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  GraduationCap,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Building2,
  Lock,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [skillsText, setSkillsText] = useState((user?.skills || []).join(', '));
  const [interestsText, setInterestsText] = useState((user?.interests || []).join(', '));
  const [showPresence, setShowPresence] = useState(
    user?.privacySettings?.showPresenceToFriends !== false
  );
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setFeedbackMsg('');

    try {
      const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
      const interests = interestsText.split(',').map((i) => i.trim()).filter(Boolean);

      const res = await api.put('/auth/profile', {
        bio,
        phone,
        skills,
        interests,
        privacySettings: {
          showPresenceToFriends: showPresence,
        },
      });

      if (res.data.success) {
        setFeedbackMsg('Profile updated successfully.');
        setIsEditing(false);
        await refreshUser();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            My Institutional Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Knowledge Institute of Technology Verified Student Account
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
        </button>
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

      {/* Top Profile Card */}
      <div className="kiot-card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={
            user?.avatar ||
            `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'User')}`
          }
          alt={user?.name}
          className="w-24 h-24 rounded-3xl object-cover border-2 border-slate-200 shadow-md bg-slate-100"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="font-display font-bold text-xl text-slate-900">{user?.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-kiot-maroon/10 text-kiot-maroon">
              {user?.role}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              {user?.status}
            </span>
          </div>

          <p className="text-xs text-slate-500 font-mono font-semibold">
            {user?.registerNumber || 'No Register Number'} • Department of {user?.department}
            {user?.year ? ` (Year ${user?.year}, Sec ${user?.section})` : ''}
          </p>

          <p className="text-xs text-slate-700 max-w-xl leading-relaxed pt-1">
            {user?.bio || 'No personal bio added yet.'}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editing Form */}
      {isEditing && (
        <div className="kiot-card p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-slate-900">Update Profile Details</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Personal Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your academic interests..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="React, Python, Data Structures..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Interests (comma separated)
                </label>
                <input
                  type="text"
                  value={interestsText}
                  onChange={(e) => setInterestsText(e.target.value)}
                  placeholder="Hackathons, AI, Competitive Coding..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98421..."
                className="w-full max-w-xs px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={showPresence}
                  onChange={(e) => setShowPresence(e.target.checked)}
                  className="rounded text-kiot-maroon focus:ring-kiot-maroon"
                />
                <span>Share permitted campus presence with accepted friends when checked IN</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold bg-kiot-maroon text-white rounded-xl hover:bg-kiot-crimson shadow-md"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Mentor & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Designated Faculty Mentor */}
        <div className="kiot-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-kiot-maroon" />
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900">
                Assigned Faculty Mentor
              </h4>
              <p className="text-[11px] text-slate-500">Official KIOT Academic Advisor</p>
            </div>
          </div>

          {user?.assignedMentor ? (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <img
                src={
                  user.assignedMentor.avatar ||
                  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.assignedMentor.name)}`
                }
                alt={user.assignedMentor.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-slate-900">{user.assignedMentor.name}</p>
                <p className="text-xs text-slate-600 font-semibold">
                  Department of {user.assignedMentor.department}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">{user.assignedMentor.email}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
              No faculty mentor assigned yet. Institutional administrators assign mentors via the Developer CMS.
            </div>
          )}
        </div>

        {/* Skills & Interests */}
        <div className="kiot-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Award className="w-5 h-5 text-kiot-gold" />
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900">
                Skills & Technical Competencies
              </h4>
              <p className="text-[11px] text-slate-500">Verified student profile attributes</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Technical Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {user?.skills?.length > 0 ? (
                  user.skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No skills listed.</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Interests & Focus Areas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {user?.interests?.length > 0 ? (
                  user.interests.map((it, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-kiot-maroon/5 text-kiot-maroon"
                    >
                      {it}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No interests listed.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
