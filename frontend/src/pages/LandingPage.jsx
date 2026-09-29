import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Users,
  Compass,
  MapPin,
  QrCode,
  GraduationCap,
  Building2,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-kiot-darkmaroon text-white p-8 sm:p-14 border border-slate-800 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-kiot-gold/10 text-kiot-gold border border-kiot-gold/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official KIOT Digital Campus Platform</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            One Campus. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiot-gold via-amber-300 to-white">
              One Connected Community.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 leading-relaxed">
            CampusConnect brings together students, faculty, mentors, and clubs across Knowledge Institute of Technology. Discover events, connect with peers, track your activities, and navigate campus presence with zero-tracking privacy.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white font-bold text-sm shadow-lg shadow-kiot-maroon/30 transition-all hover:gap-3"
            >
              <span>Access CampusConnect</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all"
            >
              <Calendar className="w-4 h-4 text-kiot-gold" />
              <span>Explore Events & Contests</span>
            </Link>
          </div>

          {/* Quick Institutional Credential Pill */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-kiot-gold" />
              <span>NH544, Kakapalayam, Salem</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Restricted to @kiot.ac.in Domain</span>
            </div>
          </div>
        </div>

        {/* Decorative background grid and ambient lighting */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-kiot-maroon/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-10 w-72 h-72 bg-kiot-gold/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Institutional Highlights Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed Exclusively for KIOT
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A cohesive campus layer built to replace fragmented groups, notice boards, and spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Hackathons & Events */}
          <div className="kiot-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-kiot-maroon/10 text-kiot-maroon flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Campus Events & Contests
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discover flagship hackathons, technical workshops, coding challenges, and cultural symposiums. Instant 1-click registration with real capacity controls.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-kiot-maroon hover:text-kiot-crimson"
            >
              <span>Browse Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Student Clubs Mini-Communities */}
          <div className="kiot-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Clubs & Student Societies
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every club gets its own mini-community. Coding Club, Robotics & IoT, GDSC KIOT, EDC, and Fine Arts. Join clubs, explore leadership rosters, and stay updated.
            </p>
            <Link
              to="/clubs"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800"
            >
              <span>Explore Clubs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Privacy-Preserving Presence */}
          <div className="kiot-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Privacy-Aware QR Presence
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Single-QR IN/OUT check-in at monitored locations (Seminar Halls, Computer Labs, Library). Zero continuous GPS tracking. When you scan OUT, location is completely hidden.
            </p>
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>View Presence System</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Scoped Mentorship & Peer Network Showcase */}
      <section className="rounded-3xl bg-slate-100 border border-slate-200 p-8 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200">
              <GraduationCap className="w-3.5 h-3.5 text-kiot-maroon" />
              <span>Academic Mentorship Framework</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Scoped Mentorship & Verified Peer Connections
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Faculty mentors have scoped access strictly to their designated mentee cohort. Search mentees by register number (e.g., 2K24CSE167) to check authorized presence during academic hours.
            </p>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mentors access only assigned mentees, protecting unauthorized surveillance.</span>
              </li>
              <li className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4 text-kiot-maroon shrink-0" />
                <span>Students search friends by Register Number and view mutual presence only when accepted.</span>
              </li>
              <li className="flex items-center gap-2 font-medium">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Interactive campus map centered on KIOT Campus, Kakapalayam, Salem.</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                <span>Sign In with Institutional ID</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Interactive Preview Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  🟢
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Current Presence Demonstration</p>
                  <p className="text-[11px] text-slate-500">Live Status Feed</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                ACTIVE IN
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-900">Sachin V (2K24CSE167)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Monitored Location:</span>
                <span className="font-semibold text-kiot-maroon">Seminar Hall A</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Check-in Time:</span>
                <span className="font-mono text-slate-700">1:05 PM</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic text-center">
              "When Sachin scans the same QR code again, his status immediately changes to OUT and location becomes completely hidden."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
