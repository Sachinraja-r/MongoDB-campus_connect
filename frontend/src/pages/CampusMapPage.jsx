import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Building2,
  Users,
  ShieldCheck,
  Search,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

// ─── Hotspot positions (% relative to the map image) ───────────────────────
// Each key maps a location name fragment to [left%, top%] on the blueprint.
const LOCATION_HOTSPOTS = {
  'A-Block':              { left: 32, top: 68 },
  'B-Block':              { left: 32, top: 52 },
  'C-Block':              { left: 32, top: 36 },
  'D-Block':              { left: 32, top: 20 },
  'E-Block':              { left: 12, top: 40 },
  "Dean":                 { left: 8,  top: 28 },
  'MBA':                  { left: 82, top: 80 },
  'Library':              { left: 57, top: 88 },
  'Basketball':           { left: 68, top: 28 },
  'Play':                 { left: 84, top: 42 },
  'Computer':             { left: 28, top: 58 },
  'Seminar':              { left: 16, top: 44 },
};

// Match a location's name to the closest hotspot key
const getHotspot = (locName) => {
  if (!locName) return null;
  const lower = locName.toLowerCase();
  const key = Object.keys(LOCATION_HOTSPOTS).find((k) =>
    lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower.split(' ')[0]?.toLowerCase())
  );
  return key ? LOCATION_HOTSPOTS[key] : null;
};

export const CampusMapPage = () => {
  const { user } = useAuth();

  const [locations, setLocations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Zoom / pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // Mentor search state
  const [searchRegisterNumber, setSearchRegisterNumber] = useState('');
  const [searchedMentee, setSearchedMentee] = useState(null);
  const [mentorSearchError, setMentorSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Hovered hotspot for tooltip
  const [hoveredLoc, setHoveredLoc] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, friendsRes] = await Promise.all([
          api.get('/presence/locations'),
          api.get('/presence/friends'),
        ]);
        if (locRes.data.success) {
          setLocations(locRes.data.locations);
          if (locRes.data.locations.length > 0) setSelectedLocation(locRes.data.locations[0]);
        }
        if (friendsRes.data.success) setFriends(friendsRes.data.friends);
      } catch (err) {
        console.error('Failed to load campus map data:', err);
      }
    };
    fetchData();
  }, []);

  // ── Drag-to-pan handlers ──────────────────────────────────────────────────
  const onMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
    e.currentTarget.style.cursor = 'grabbing';
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    setPan({
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    });
  };
  const onMouseUp = (e) => {
    isDragging.current = false;
    if (e.currentTarget) e.currentTarget.style.cursor = 'grab';
  };

  const handleZoomIn  = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleReset   = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMentorSearch = async (e) => {
    e.preventDefault();
    if (!searchRegisterNumber.trim()) return;
    setSearchLoading(true);
    setMentorSearchError('');
    setSearchedMentee(null);
    try {
      const res = await api.get(
        `/presence/mentee?registerNumber=${encodeURIComponent(searchRegisterNumber.trim().toUpperCase())}`
      );
      if (res.data.success) setSearchedMentee(res.data.mentee);
    } catch (err) {
      setMentorSearchError(
        err.response?.data?.message || 'Access Denied: Student is not in your assigned mentorship cohort.'
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const isMentorOrAdmin = ['mentor', 'faculty', 'admin', 'developer'].includes(user?.role);
  const activeFriendsAtLocations = (locationName) =>
    friends.filter((f) => f.status === 'IN' && f.locationName === locationName);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            KIOT Campus Presence Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Campus Master Plan • NH544, Kakapalayam, Salem, Tamil Nadu.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero Background GPS • QR-Scoped Presence Only</span>
        </div>
      </div>

      {/* ── Mentor Scoped Search ─────────────────────────────────────────────── */}
      {isMentorOrAdmin && (
        <div className="kiot-card p-5 space-y-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-kiot-gold" />
              <h3 className="font-display font-bold text-xs sm:text-sm text-white">
                Mentor Scoped Presence Lookup
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Role: {user.role}
            </span>
          </div>

          <form onSubmit={handleMentorSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Mentee Register Number (e.g. 2K24CSE167)..."
              value={searchRegisterNumber}
              onChange={(e) => setSearchRegisterNumber(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-400 focus:ring-1 focus:ring-kiot-gold outline-none"
            />
            <button
              type="submit"
              disabled={searchLoading || !searchRegisterNumber.trim()}
              className="px-4 py-2 rounded-xl bg-kiot-gold hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{searchLoading ? 'Verifying...' : 'Search Mentee'}</span>
            </button>
          </form>

          {searchedMentee && (
            <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={searchedMentee.avatar}
                  alt={searchedMentee.name}
                  className="w-10 h-10 rounded-full border border-slate-600 object-cover"
                />
                <div>
                  <p className="font-bold text-white">{searchedMentee.name}</p>
                  <p className="text-[11px] text-slate-300 font-mono">
                    {searchedMentee.registerNumber} • {searchedMentee.department}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      searchedMentee.presence?.status === 'IN' ? 'bg-emerald-400' : 'bg-slate-400'
                    }`}
                  />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    {searchedMentee.presence?.status}
                  </span>
                </div>
                <p className="text-[11px] text-kiot-lightgold mt-0.5">
                  {searchedMentee.presence?.status === 'IN'
                    ? `🟢 Inside ${searchedMentee.presence?.locationName}`
                    : '⚪ Currently OUT of monitored rooms'}
                </p>
              </div>
            </div>
          )}

          {mentorSearchError && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{mentorSearchError}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Main Grid: Blueprint + Sidebar ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Custom Blueprint Map ─────────────────────────────────────────── */}
        <div
          className="lg:col-span-2 kiot-card overflow-hidden relative shadow-lg rounded-2xl"
          style={{ height: 520 }}
        >
          {/* Zoom Controls */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 hover:bg-white border border-slate-200 shadow text-slate-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 hover:bg-white border border-slate-200 shadow text-slate-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 hover:bg-white border border-slate-200 shadow text-slate-700 transition-colors"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom level badge */}
          <div className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded bg-black/50 text-white text-[10px] font-mono font-bold">
            {Math.round(zoom * 100)}%
          </div>

          {/* Draggable / Zoomable wrapper */}
          <div
            className="w-full h-full overflow-hidden select-none"
            style={{ cursor: 'grab', background: '#0d1b2a' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging.current ? 'none' : 'transform 0.15s ease',
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
            >
              {/* Blueprint Image */}
              <img
                src="/kiot-campus-map.png"
                alt="KIOT Campus Master Plan"
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />

              {/* Location Hotspot Pins */}
              {locations.map((loc) => {
                const hotspot = getHotspot(loc.name);
                if (!hotspot) return null;
                const isSelected = selectedLocation?._id === loc._id;
                const activeFriends = activeFriendsAtLocations(loc.name);
                const hasActiveFriends = activeFriends.length > 0;

                return (
                  <button
                    key={loc._id}
                    onClick={(e) => { e.stopPropagation(); setSelectedLocation(loc); }}
                    onMouseEnter={() => setHoveredLoc(loc)}
                    onMouseLeave={() => setHoveredLoc(null)}
                    style={{
                      position: 'absolute',
                      left: `${hotspot.left}%`,
                      top: `${hotspot.top}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10,
                    }}
                    className="group focus:outline-none"
                    title={loc.name}
                  >
                    {/* Pulse ring for occupied locations */}
                    {(loc.currentOccupancy > 0 || hasActiveFriends) && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          background: isSelected ? '#800000' : '#16a34a',
                          opacity: 0.35,
                          width: 20,
                          height: 20,
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )}

                    {/* Pin dot */}
                    <span
                      className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-125"
                      style={{
                        background: isSelected
                          ? '#800000'
                          : hasActiveFriends
                          ? '#16a34a'
                          : '#1e3a8a',
                      }}
                    >
                      <span className="text-[8px] leading-none">
                        {loc.locationType === 'Computer Laboratory'
                          ? '💻'
                          : loc.locationType === 'Seminar Hall'
                          ? '🎤'
                          : loc.locationType === 'Auditorium'
                          ? '🎭'
                          : loc.locationType === 'Library'
                          ? '📚'
                          : '🏛️'}
                      </span>
                    </span>

                    {/* Hover Tooltip */}
                    {hoveredLoc?._id === loc._id && (
                      <div className="absolute z-30 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 pointer-events-none">
                        <p className="font-bold text-xs">{loc.name}</p>
                        <p className="text-slate-400 text-[9px]">{loc.building} • {loc.floor}</p>
                        <p className="text-emerald-400 text-[9px] font-bold mt-0.5">
                          👥 {loc.currentOccupancy || 0} inside
                          {hasActiveFriends ? ` • ${activeFriends.length} friend(s)` : ''}
                        </p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-[9px] text-white font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#800000] border border-white inline-block" />
              Selected
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] border border-white inline-block" />
              Friends Inside
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a] border border-white inline-block" />
              Monitored
            </span>
          </div>
        </div>

        {/* ── Right Sidebar ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Monitored Locations List */}
          <div className="kiot-card p-5 space-y-3">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-kiot-maroon" />
              Monitored Locations ({locations.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Select a location to highlight it on the campus blueprint.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {locations.map((loc) => {
                const isSelected = selectedLocation?._id === loc._id;
                const activeFriends = activeFriendsAtLocations(loc.name);

                return (
                  <button
                    key={loc._id}
                    onClick={() => setSelectedLocation(loc)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-kiot-maroon/5 border-kiot-maroon ring-1 ring-kiot-maroon'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{loc.name}</p>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {loc.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{loc.building} • {loc.floor}</p>
                    <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-100 text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        ● Occupancy: {loc.currentOccupancy || 0}
                      </span>
                      {activeFriends.length > 0 && (
                        <span className="text-[10px] font-bold text-kiot-maroon">
                          {activeFriends.length} friend{activeFriends.length > 1 ? 's' : ''} inside
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Friends Summary */}
          <div className="kiot-card p-5 space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-kiot-maroon" />
              Permitted Peer Presence
            </h4>

            {friends.filter((f) => f.status === 'IN').length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                None of your accepted friends are currently checked IN.
              </p>
            ) : (
              <div className="space-y-2">
                {friends
                  .filter((f) => f.status === 'IN')
                  .map((f) => (
                    <div
                      key={f._id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={f.avatar}
                          alt={f.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{f.name}</p>
                          <p className="text-[10px] text-kiot-maroon font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {f.locationName}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        🟢 IN
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};