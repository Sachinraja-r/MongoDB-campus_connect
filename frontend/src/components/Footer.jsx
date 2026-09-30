import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm shrink-0">
                <img src="/kiot-logo.png" alt="KIOT Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-extrabold text-base text-white">
                Campus<span className="text-kiot-gold">Connect</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed text-xs">
              Next-generation digital campus community platform engineered specifically for Knowledge Institute of Technology (KIOT), Kakapalayam, Salem. Connecting students, mentors, clubs, and events.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-tracking privacy-aware presence architecture</span>
            </div>
          </div>

          {/* Col 2: Institutional Campus */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Campus Reference</h4>
            <address className="not-italic text-slate-400 text-xs space-y-1">
              <p className="text-white font-medium">Knowledge Institute of Technology</p>
              <p>KIOT-Campus, NH544, Kakapalayam</p>
              <p>Salem, Tamil Nadu – 637504</p>
              <p className="text-kiot-gold font-mono pt-1">Domain: kiot.ac.in</p>
            </address>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Platform Hubs</h4>
            <ul className="space-y-1 text-slate-400">
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Campus Events & Hackathons
                </Link>
              </li>
              <li>
                <Link to="/clubs" className="hover:text-white transition-colors">
                  Student Clubs & Societies
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition-colors">
                  Campus Presence Map
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Institutional Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Knowledge Institute of Technology. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for KIOT Campus Community with high-reliability full-stack architecture.
          </p>
        </div>
      </div>
    </footer>
  );
};
