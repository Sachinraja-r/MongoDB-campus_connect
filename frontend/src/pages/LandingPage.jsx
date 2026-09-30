import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Building2,
  GraduationCap,
  Users,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="space-y-12 py-6 sm:py-8">
      {/* Institutional Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-kiot-darkmaroon text-white p-8 sm:p-14 border border-slate-800 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-kiot-gold/10 text-kiot-gold border border-kiot-gold/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Institutional Digital Campus Gateway</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            One Campus. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiot-gold via-amber-300 to-white">
              One Connected Community.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            CampusConnect is the centralized digital governance and collaboration platform for Knowledge Institute of Technology (KIOT). Providing authenticated institutional access for students, faculty mentors, club directors, and administrators.
          </p>

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white font-bold text-sm shadow-xl shadow-kiot-maroon/30 transition-all hover:gap-3"
            >
              <span>Sign In with Institutional ID</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Institutional Compliance Indicators */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-kiot-gold" />
              <span>KIOT Campus, NH544, Kakapalayam, Salem</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Restricted to Official @kiot.ac.in Domain</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Two-Layer RBAC Access Enforcement</span>
            </div>
          </div>
        </div>

        {/* Decorative lighting elements */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-kiot-maroon/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-10 w-72 h-72 bg-kiot-gold/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Institutional Architecture Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Architecture & Security
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Engineered exclusively for Knowledge Institute of Technology to deliver a zero-vulnerability, role-governed digital campus environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Verified Campus Identity */}
          <div className="kiot-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-kiot-maroon/10 text-kiot-maroon flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Verified Institutional Identity
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict access governance enforcing pre-authorized Google Workspace credentials and official institutional roll numbers. External and unverified domains are strictly rejected at the gateway.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Domain Restricting Enforcement</span>
            </div>
          </div>

          {/* Pillar 2: Scoped Academic Advisory */}
          <div className="kiot-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Scoped Faculty Mentorship
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Faculty mentors receive cryptographically scoped access restricted strictly to their assigned cohort of mentees, preserving privacy and eliminating unauthorized surveillance.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-semibold text-blue-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cohort Isolation Protocol</span>
            </div>
          </div>

          {/* Pillar 3: Privacy-Preserving Check-ins */}
          <div className="kiot-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Zero-Continuous-Tracking Privacy
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Single-point checkpoint QR verification at authorized campus zones. Zero persistent GPS tracking. Checkpoint status is completely cleared the moment an exit scan occurs.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>No Background Location Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Accreditations Strip */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="space-y-1 p-2">
            <p className="text-lg font-extrabold text-slate-900 font-display">NAAC 'A'</p>
            <p className="text-[11px] text-slate-500 font-medium">Accredited Institution</p>
          </div>
          <div className="space-y-1 p-2">
            <p className="text-lg font-extrabold text-slate-900 font-display">Autonomous</p>
            <p className="text-[11px] text-slate-500 font-medium">Affiliated to Anna University</p>
          </div>
          <div className="space-y-1 p-2">
            <p className="text-lg font-extrabold text-slate-900 font-display">NBA</p>
            <p className="text-[11px] text-slate-500 font-medium">Accredited Departments</p>
          </div>
          <div className="space-y-1 p-2">
            <p className="text-lg font-extrabold text-kiot-maroon font-display">Estd. 2009</p>
            <p className="text-[11px] text-slate-500 font-medium">Salem, Tamil Nadu</p>
          </div>
        </div>
      </section>
    </div>
  );
};
