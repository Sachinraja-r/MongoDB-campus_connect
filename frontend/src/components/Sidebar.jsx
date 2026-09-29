import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  MapPin,
  QrCode,
  Bell,
  User,
  ShieldCheck,
  Compass,
  Megaphone,
  Award,
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  // Navigation items scoped by role
  let navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Events & Contests', path: '/events', icon: Calendar },
    { label: 'Campus Clubs', path: '/clubs', icon: Compass },
  ];

  if (role === 'student') {
    navItems.push(
      { label: 'Friends & Peers', path: '/friends', icon: Users },
      { label: 'Campus Map', path: '/map', icon: MapPin },
      { label: 'Presence & QR', path: '/presence', icon: QrCode },
      { label: 'My Profile & Activity', path: '/profile', icon: User },
      { label: 'Notifications', path: '/notifications', icon: Bell }
    );
  } else if (role === 'mentor' || role === 'faculty') {
    navItems.push(
      { label: 'Assigned Mentees', path: '/mentor', icon: UserCheck },
      { label: 'Campus Map & Presence', path: '/map', icon: MapPin },
      { label: 'Announcements', path: '/announcements', icon: Megaphone },
      { label: 'My Profile', path: '/profile', icon: User },
      { label: 'Notifications', path: '/notifications', icon: Bell }
    );
  } else if (role === 'club_admin') {
    navItems.push(
      { label: 'Club Management', path: '/club-admin', icon: Award },
      { label: 'Campus Map', path: '/map', icon: MapPin },
      { label: 'Presence & QR', path: '/presence', icon: QrCode },
      { label: 'My Profile', path: '/profile', icon: User },
      { label: 'Notifications', path: '/notifications', icon: Bell }
    );
  }

  // Developer / Admin CMS Link
  const isCmsAuthorized = ['admin', 'developer'].includes(role);

  const navContent = (
    <div className="flex flex-col h-full py-4">
      {/* User Quick Info */}
      <div className="px-4 pb-4 border-b border-slate-200/80 mb-4">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}`}
            alt={user.name}
            className="w-10 h-10 rounded-xl border border-slate-200 object-cover bg-slate-100"
          />
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-slate-900 truncate">{user.name}</h4>
            <p className="text-xs text-slate-600 truncate font-mono">
              {user.registerNumber || user.department}
            </p>
          </div>
        </div>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-kiot-maroon text-white shadow-sm shadow-kiot-maroon/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Privileged CMS Section */}
      {isCmsAuthorized && (
        <div className="px-3 pt-4 border-t border-slate-200/80 mt-auto">
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-600 px-3 mb-2">
            Privileged Control
          </div>
          <NavLink
            to="/cms"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-kiot-gold shadow-md'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`
            }
          >
            <ShieldCheck className="w-4 h-4 text-kiot-amber shrink-0" />
            <span>Developer CMS</span>
          </NavLink>
        </div>
      )}

      {/* Institutional Location Badge */}
      <div className="px-4 pt-4 mt-3 text-[11px] text-slate-600 leading-tight">
        <p className="font-semibold text-slate-700">KIOT Campus</p>
        <p className="text-[10px]">Kakapalayam, Salem – 637504</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-10 flex flex-col">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
