import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Building2,
  Users,
  ShieldCheck,
  Search,
  AlertCircle,
  QrCode,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

// Custom Leaflet Pin Icon Generator
const createCustomIcon = (color = '#800000', iconLabel = '🏛️') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">${iconLabel}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const KIOT_COORDINATES = [11.5997, 77.9868]; // KIOT Campus, Kakapalayam, Salem

export const CampusMapPage = () => {
  const { user } = useAuth();

  const [locations, setLocations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Scoped mentor search state
  const [searchRegisterNumber, setSearchRegisterNumber] = useState('');
  const [searchedMentee, setSearchedMentee] = useState(null);
  const [mentorSearchError, setMentorSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, friendsRes] = await Promise.all([
          api.get('/presence/locations'),
          api.get('/presence/friends'),
        ]);

        if (locRes.data.success) {
          setLocations(locRes.data.locations);
          if (locRes.data.locations.length > 0) {
            setSelectedLocation(locRes.data.locations[0]);
          }
        }
        if (friendsRes.data.success) {
          setFriends(friendsRes.data.friends);
        }
      } catch (err) {
        console.error('Failed to load campus map data:', err);
      }
    };

    fetchData();
  }, []);

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
      if (res.data.success) {
        setSearchedMentee(res.data.mentee);
      }
    } catch (err) {
      setMentorSearchError(
        err.response?.data?.message || 'Access Denied: Student is not in your assigned mentorship cohort.'
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const isMentorOrAdmin = ['mentor', 'faculty', 'admin', 'developer'].includes(user?.role);

  // Filter friends currently IN to show on map markers
  const activeFriendsAtLocations = (locationName) => {
    return friends.filter((f) => f.status === 'IN' && f.locationName === locationName);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            KIOT Campus Presence Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official Geographic Campus Layout • NH544, Kakapalayam, Salem, Tamil Nadu.
          </p>
        </div>

        {/* Privacy Assurance Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero Background GPS • QR-Scoped Presence Only</span>
        </div>
      </div>

      {/* Scoped Mentee Search Bar (for Faculty/Mentors & Admins) */}
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

          {/* Mentee Search Result Card */}
          {searchedMentee && (
            <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs animate-in fade-in duration-200">
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
                      searchedMentee.presence?.status === 'IN'
                        ? 'bg-emerald-400 pulse-green'
                        : 'bg-slate-400'
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

      {/* Main Map + Location Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map (2 Cols) */}
        <div className="lg:col-span-2 kiot-card p-2 overflow-hidden h-[480px] sm:h-[550px] relative shadow-lg">
          <MapContainer
            center={KIOT_COORDINATES}
            zoom={16}
            scrollWheelZoom={false}
            className="w-full h-full rounded-2xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Campus perimeter circle marker */}
            <Circle
              center={KIOT_COORDINATES}
              radius={220}
              pathOptions={{
                color: '#800000',
                fillColor: '#800000',
                fillOpacity: 0.08,
                weight: 2,
                dashArray: '4, 8',
              }}
            />

            {/* Monitored Location Markers */}
            {locations.map((loc) => {
              const activeFriends = activeFriendsAtLocations(loc.name);
              const isSelected = selectedLocation?._id === loc._id;

              return (
                <Marker
                  key={loc._id}
                  position={[loc.latitude, loc.longitude]}
                  icon={createCustomIcon(
                    isSelected ? '#800000' : '#1e3a8a',
                    loc.locationType === 'Computer Laboratory'
                      ? '💻'
                      : loc.locationType === 'Seminar Hall'
                      ? '🎤'
                      : loc.locationType === 'Auditorium'
                      ? '🎭'
                      : loc.locationType === 'Library'
                      ? '📚'
                      : '🏛️'
                  )}
                  eventHandlers={{
                    click: () => setSelectedLocation(loc),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1.5 text-xs">
                      <p className="font-bold text-slate-900">{loc.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {loc.building} • {loc.floor}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <Users className="w-3 h-3" />
                        <span>Current Occupancy: {loc.currentOccupancy || 0}</span>
                      </div>
                      {activeFriends.length > 0 && (
                        <div className="pt-1 border-t border-slate-200">
                          <p className="text-[10px] font-bold text-slate-700">Friends Inside:</p>
                          <div className="flex items-center gap-1 mt-1">
                            {activeFriends.map((af) => (
                              <img
                                key={af._id}
                                src={af.avatar}
                                alt={af.name}
                                title={af.name}
                                className="w-5 h-5 rounded-full border border-slate-300"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Right Col: Monitored Locations List & Active Peer Presence */}
        <div className="space-y-4">
          <div className="kiot-card p-5 space-y-3">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-kiot-maroon" />
              Monitored Campus Placards ({locations.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Select any location to focus details or view active student occupancy.
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

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {loc.building} • {loc.floor}
                    </p>

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

          {/* Active Friends Summary Card */}
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
