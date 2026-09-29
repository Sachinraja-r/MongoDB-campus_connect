import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
  Sparkles,
  Building,
} from 'lucide-react';

export const EventDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
      }

      // If user is organizer/admin, fetch participants
      if (
        user &&
        ['club_admin', 'faculty', 'mentor', 'admin', 'developer'].includes(user.role)
      ) {
        const pRes = await api.get(`/events/${id}/participants`).catch(() => ({ data: {} }));
        if (pRes.data.success) {
          setParticipants(pRes.data.participants);
        }
      }
    } catch (err) {
      console.error('Failed to load event details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setFeedbackMsg('');

    try {
      const res = await api.post(`/events/${id}/register`);
      if (res.data.success) {
        // Trigger celebratory confetti fireworks!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#800000', '#F59E0B', '#10B981'],
        });

        setFeedbackMsg(res.data.message);
        await fetchEvent();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you wish to cancel your registration for this event?')) {
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setFeedbackMsg('');

    try {
      const res = await api.post(`/events/${id}/cancel`);
      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        await fetchEvent();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-kiot-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Loading KIOT event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20 space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-800">Event Not Found</h3>
        <Link to="/events" className="text-xs text-kiot-maroon font-bold">
          ← Back to Events Hub
        </Link>
      </div>
    );
  }

  const isStudent = user?.role === 'student';
  const progress = Math.min(100, Math.round((event.registrationCount / event.maxParticipants) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Hub</span>
      </Link>

      {/* Hero Poster Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900 h-64 sm:h-96">
        <img
          src={event.poster}
          alt={event.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-kiot-gold text-slate-950 shadow-sm">
              {event.category}
            </span>
            {event.department && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/20">
                Dept: {event.department}
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Feedback Alerts */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Details & Registration Action */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description, Rules, Organizers */}
        <div className="md:col-span-2 space-y-6">
          <div className="kiot-card p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">About this Event</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            {event.prizes && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Prizes & Recognition</span>
                </div>
                <p className="text-xs text-amber-800 font-semibold">{event.prizes}</p>
              </div>
            )}
          </div>

          {/* Coordinators & Club */}
          <div className="kiot-card p-6 space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-900">Organizing Leadership</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {event.club && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <img
                    src={event.club.logo}
                    alt={event.club.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{event.club.name}</p>
                    <Link
                      to={`/clubs/${event.club._id}`}
                      className="text-[11px] text-kiot-maroon font-semibold hover:underline"
                    >
                      View Club Community →
                    </Link>
                  </div>
                </div>
              )}

              {event.facultyCoordinator && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Faculty Coordinator</p>
                  <p className="text-xs font-bold text-slate-900">{event.facultyCoordinator.name}</p>
                  <p className="text-[11px] text-slate-500">{event.facultyCoordinator.department} Dept</p>
                </div>
              )}
            </div>
          </div>

          {/* Participant Roster (For Staff / Club Admins) */}
          {participants.length > 0 && (
            <div className="kiot-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-slate-900">
                  Registered Participants ({participants.length})
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Organizer Access
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {participants.map((p) => (
                  <div key={p._id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{p.studentName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {p.registerNumber} • {p.department} (Yr {p.year})
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Event Logistics & 1-Click Registration Box */}
        <div className="space-y-6">
          <div className="kiot-card p-6 space-y-5 sticky top-20">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">Event Logistics</h3>
              <p className="text-xs text-slate-500">Knowledge Institute of Technology</p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-kiot-maroon mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Date & Schedule</p>
                  <p className="text-slate-500">
                    {new Date(event.date).toLocaleDateString([], {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    {event.startTime} – {event.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Venue</p>
                  <p className="text-slate-500">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Eligibility</p>
                  <p className="text-slate-500">{event.eligibility}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div className="w-full space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Enrolled Participants</span>
                    <span>
                      {event.registrationCount} / {event.maxParticipants}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress > 90 ? 'bg-red-500' : 'bg-kiot-maroon'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {event.isRegistered ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registration Confirmed</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 mt-0.5">
                      Your seat is reserved. See you at {event.venue}!
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleCancelRegistration}
                    className="w-full py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                  >
                    Cancel Registration
                  </button>
                </div>
              ) : event.isFull ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold cursor-not-allowed text-center"
                >
                  Event Reached Full Capacity
                </button>
              ) : isStudent ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleRegister}
                  className="w-full py-3.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white font-bold text-xs sm:text-sm shadow-lg shadow-kiot-maroon/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-kiot-gold" />
                  <span>{submitting ? 'Registering...' : 'Confirm 1-Click Registration'}</span>
                </button>
              ) : (
                <p className="text-[11px] text-slate-500 text-center">
                  Only enrolled students can register for student events.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
