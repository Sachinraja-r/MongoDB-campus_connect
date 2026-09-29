import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  MapPin,
  QrCode,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export const Navbar = ({ onOpenQrScan, onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const isStudent = user?.role === 'student';
  const isCurrentlyIn = user?.presence?.status === 'IN';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Institutional Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
              {/* KIOT Emblem Icon */}
              <div className="w-10 h-10 rounded-xl bg-kiot-maroon flex items-center justify-center text-white font-bold shadow-md shadow-kiot-maroon/20 group-hover:scale-105 transition-transform">
                <span className="font-display tracking-tight text-kiot-gold font-extrabold text-sm">KIOT</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                  Campus<span className="text-kiot-maroon">Connect</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 hidden sm:block">
                  Knowledge Institute of Technology
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Presence Status, QR Scan Action, Notifications, Profile */}
          <div className="flex items-center gap-3">
            {/* Live Presence Chip for Students */}
            {isStudent && (
              <button
                onClick={onOpenQrScan}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isCurrentlyIn
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title="Click to scan campus location QR"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCurrentlyIn ? 'bg-emerald-500 pulse-green' : 'bg-slate-400'
                  }`}
                />
                <span className="max-w-[130px] truncate">
                  {isCurrentlyIn ? `IN: ${user?.presence?.locationName || 'Campus'}` : 'Status: OUT'}
                </span>
                <QrCode className="w-3.5 h-3.5 ml-0.5 text-slate-600" />
              </button>
            )}

            {/* Quick QR Scanner Button */}
            <button
              onClick={onOpenQrScan}
              className="p-2 rounded-xl text-slate-600 hover:text-kiot-maroon hover:bg-slate-100 transition-colors"
              title="Campus QR Scanner"
            >
              <QrCode className="w-5 h-5" />
            </button>

            {/* Notifications Bell */}
            <Link
              to="/notifications"
              className="p-2 rounded-xl text-slate-600 hover:text-kiot-maroon hover:bg-slate-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {user?.unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-kiot-crimson text-white text-[10px] font-bold flex items-center justify-center">
                  {user.unreadNotifications > 9 ? '9+' : user.unreadNotifications}
                </span>
              )}
            </Link>

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-colors"
              >
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'User')}`
                  }
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-slate-100"
                />
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-600 truncate">{user?.email}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-kiot-maroon/10 text-kiot-maroon">
                        {user?.role}
                      </span>
                      {user?.registerNumber && (
                        <span className="text-[11px] font-mono text-slate-600 font-semibold">
                          {user.registerNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <User className="w-4 h-4 text-slate-600" />
                      My Profile & Activity
                    </Link>
                    <Link
                      to="/map"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <MapPin className="w-4 h-4 text-slate-600" />
                      Campus Presence Map
                    </Link>

                    {['admin', 'developer'].includes(user?.role) && (
                      <Link
                        to="/cms"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-kiot-maroon hover:bg-kiot-maroon/5"
                      >
                        <Shield className="w-4 h-4 text-kiot-maroon" />
                        System Control Center (CMS)
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out of KIOT Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
