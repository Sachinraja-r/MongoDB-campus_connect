import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  UserCheck,
  Award,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  User,
} from 'lucide-react';

export const LoginPage = () => {
  const { user, loginWithGoogle, loginWithDemo, loginWithPassword, loading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Credential form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'developer' || user.role === 'admin') {
        navigate('/dashboard');
      } else if (user.role === 'mentor' || user.role === 'faculty') {
        navigate('/mentor');
      } else if (user.role === 'club_admin') {
        navigate('/club-admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  // Check if session expired
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setErrorMessage('Your session has expired. Please sign in again.');
    }
  }, [location]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    const result = await loginWithGoogle();
    setLoading(false);
    if (!result.success && result.message !== 'Sign-in cancelled.') {
      setErrorMessage(result.message);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    const result = await loginWithPassword(username.trim(), password);
    setLoading(false);
    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  const handleDemoSignIn = async (email) => {
    setLoading(true);
    setErrorMessage('');
    const res = await loginWithDemo(email);
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const isLoading = loading || authLoading;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Col: Institutional Branding */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-kiot-darkmaroon p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            {/* KIOT Crest */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-xl shadow-black/40 border border-white/20 shrink-0">
                <img src="/kiot-logo.png" alt="KIOT Institutional Crest" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-xl text-white tracking-tight">CampusConnect</h2>
                <p className="text-[11px] text-kiot-gold font-semibold uppercase tracking-wider">
                  Knowledge Institute of Technology
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-kiot-lightgold border border-white/15">
                <Sparkles className="w-3 h-3 text-kiot-gold" />
                <span>Unified Campus Identity</span>
              </div>
              <h3 className="font-display text-2xl font-bold leading-tight">
                Your campus. <br />
                Your community. <br />
                Your opportunities.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Access is restricted to authorized KIOT institutional accounts (@kiot.ac.in). Use your credentials or sign in with Google Workspace.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Two-Layer Authorization Enforcement</span>
            </div>
            <p>KIOT-Campus, NH544, Kakapalayam, Salem – 637504</p>
          </div>

          {/* Ambient lighting */}
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-kiot-gold/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Right Col: Sign In Methods */}
        <div className="p-8 sm:p-10 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900">Sign in to your account</h3>
              <p className="text-xs text-slate-500 mt-1">
                Use your KIOT credentials or Google Workspace account.
              </p>
            </div>

            {/* Error Message Alert */}
            {(errorMessage || authError) && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-bold">Access Denied</p>
                  <p className="mt-0.5 text-[11px]">{errorMessage || authError}</p>
                </div>
              </div>
            )}

            {/* ── Username + Password Form ── */}
            <form onSubmit={handlePasswordLogin} className="space-y-3">
              {/* Username */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Email or Roll Number (e.g. 2K24CSE167)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-kiot-maroon/30 focus:border-kiot-maroon outline-none transition-all disabled:opacity-60 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-kiot-maroon/30 focus:border-kiot-maroon outline-none transition-all disabled:opacity-60 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Demo / Default password: <code className="font-mono font-semibold text-kiot-maroon bg-slate-100 px-1 py-0.5 rounded">kiot@2026</code></span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full py-2.5 rounded-xl bg-kiot-maroon hover:bg-kiot-darkmaroon text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-kiot-maroon/20"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2">
                or
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* Firebase Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all font-medium text-slate-700 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
              </svg>
              {isLoading ? 'Signing in…' : 'Sign in with Google'}
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Enforcing official{' '}
              <span className="font-mono text-kiot-maroon font-bold">@kiot.ac.in</span>{' '}
              institutional domain
            </p>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2">
                Rapid Persona Switcher
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* 1-Click Role Switcher for Hackathon Evaluation */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-500">
                Select a pre-seeded role to instantly test the full-stack system:
              </p>

              <div className="grid grid-cols-1 gap-1.5">
                {/* Student */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDemoSignIn('sachin.24cse167@kiot.ac.in')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-kiot-maroon hover:bg-kiot-maroon/5 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-kiot-maroon">Sachin V (Student)</p>
                      <p className="text-[10px] text-slate-500 font-mono">2K24CSE167 • Dept of CSE • Year 2</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-kiot-maroon group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Mentor */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDemoSignIn('mentor.rajesh@kiot.ac.in')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">Dr. K. Rajesh (Senior Mentor)</p>
                      <p className="text-[10px] text-slate-500">Assigned Cohort: 5 Mentees</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Club Leader */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDemoSignIn('priya.club@kiot.ac.in')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-600 hover:bg-amber-50/50 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800">Priya Dharshini S (Club Leader)</p>
                      <p className="text-[10px] text-slate-500">President — KIOT Coding Club (KCC)</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Admin */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDemoSignIn('admin@kiot.ac.in')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-100 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-kiot-gold flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Dr. P. Rajendran (Developer / Admin)</p>
                      <p className="text-[10px] text-slate-500">Full Developer CMS System Control Center</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-400 pt-2">
            Protected by KIOT Institutional Identity Gateway • All actions audited.
          </p>
        </div>
      </div>
    </div>
  );
};
