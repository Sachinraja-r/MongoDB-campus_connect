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
  Building2,
} from 'lucide-react';

export const LoginPage = () => {
  const { user, loginWithGoogle, loginWithDemo, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [customEmail, setCustomEmail] = useState('');

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

  // Handle Google Credential Response
  useEffect(() => {
    /* global google */
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: 'campusconnect-kiot-client-id',
        callback: async (response) => {
          setLoading(true);
          setErrorMessage('');
          const result = await loginWithGoogle(response.credential);
          setLoading(false);
          if (!result.success) {
            setErrorMessage(result.message);
          }
        },
      });

      const buttonDiv = document.getElementById('google-signin-btn');
      if (buttonDiv) {
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'pill',
        });
      }
    }
  }, [loginWithGoogle]);

  const handleDemoSignIn = async (email) => {
    setLoading(true);
    setErrorMessage('');
    const res = await loginWithDemo(email);
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleCustomEmailTest = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    handleDemoSignIn(customEmail);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Col: Institutional Branding & Welcome */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-kiot-darkmaroon p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            {/* KIOT Crest */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-kiot-maroon flex items-center justify-center text-kiot-gold font-bold text-base shadow-lg shadow-kiot-maroon/30">
                KIOT
              </div>
              <div>
                <h2 className="font-display font-extrabold text-xl text-white">CampusConnect</h2>
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
                Access is restricted to authorized KIOT institutional accounts (@kiot.ac.in). Unregistered accounts or non-institutional emails are rejected at the gateway.
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

        {/* Right Col: Sign In Methods & Rapid Persona Switcher */}
        <div className="p-8 sm:p-10 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900">Sign in to your account</h3>
              <p className="text-xs text-slate-600 mt-1">
                Use your official KIOT Google Workspace credentials.
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

            {/* Google Identity Services Container */}
            <div className="space-y-2">
              <div id="google-signin-btn" className="w-full flex justify-center min-h-[44px]" />
              <p className="text-[11px] text-center text-slate-600 font-medium">
                Enforcing official <span className="font-mono text-kiot-maroon font-bold">@kiot.ac.in</span> institutional domain
              </p>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-white px-2">
                Rapid Persona Switcher
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* 1-Click Role Switcher for Hackathon Evaluation & Testing */}
            <div className="space-y-2">
              <p className="text-[11px] text-slate-600 font-medium">
                Select a pre-seeded authorized role to test the full-stack system immediately:
              </p>

              <div className="grid grid-cols-1 gap-2">
                {/* 1. Student Persona: Sachin V */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoSignIn('sachin.24cse167@kiot.ac.in')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-kiot-maroon hover:bg-kiot-maroon/5 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-kiot-maroon">
                        Sachin V (Student)
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        2K24CSE167 • Dept of CSE • Year 2
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-kiot-maroon group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 2. Mentor Persona: Dr. K. Rajesh */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoSignIn('mentor.rajesh@kiot.ac.in')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                        Dr. K. Rajesh (Senior Mentor)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Assigned Cohort: 5 Mentees (incl. 2K24CSE167)
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 3. Club Leader Persona: Priya Dharshini S */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoSignIn('priya.club@kiot.ac.in')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-600 hover:bg-amber-50/50 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                        Priya Dharshini S (Club Leader)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        President — KIOT Coding Club (KCC)
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 4. Super Admin / Developer Persona: Dr. P. Rajendran */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoSignIn('admin@kiot.ac.in')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-100 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-kiot-gold flex items-center justify-center font-bold text-xs">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Dr. P. Rajendran (Developer / Admin)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Full Developer CMS System Control Center
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

            {/* Test Security Rejection Input */}
            <form onSubmit={handleCustomEmailTest} className="pt-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Security Test: Try Any Other Email (Verify Authorization Rejection)
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="e.g. unknown@gmail.com or test@kiot.ac.in"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !customEmail}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold disabled:opacity-50 transition-colors"
                >
                  Test
                </button>
              </div>
            </form>
          </div>

          <p className="text-[10px] text-center text-slate-400">
            Protected by KIOT Institutional Identity Gateway • All actions audited.
          </p>
        </div>
      </div>
    </div>
  );
};
