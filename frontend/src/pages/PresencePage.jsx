import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  QrCode,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  History,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const PresencePage = () => {
  const { user } = useAuth();
  const { openQrScanner } = useOutletContext() || {};

  const [myPresence, setMyPresence] = useState(null);
  const [history, setHistory] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPresenceData = async () => {
    try {
      setLoading(true);
      const [presRes, locRes] = await Promise.all([
        api.get('/presence/me'),
        api.get('/presence/locations'),
      ]);

      if (presRes.data.success) {
        setMyPresence(presRes.data.presence);
        setHistory(presRes.data.history || []);
      }
      if (locRes.data.success) {
        setLocations(locRes.data.locations);
      }
    } catch (err) {
      console.error('Failed to load presence data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresenceData();
  }, []);

  const isCurrentlyIn = myPresence?.status === 'IN';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Campus Presence & QR Check-In
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Single-QR IN/OUT presence system engineered for Knowledge Institute of Technology.
        </p>
      </div>

      {/* Current Active Presence Status Box */}
      <div className="kiot-card p-6 sm:p-8 space-y-6 bg-gradient-to-br from-slate-900 via-slate-900 to-kiot-darkmaroon text-white border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-kiot-gold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
              Live Session Status
            </span>
            <h3 className="font-display text-2xl font-bold text-white pt-1">
              {isCurrentlyIn ? (
                <span>
                  🟢 Checked IN at <span className="text-kiot-gold">{myPresence.locationName}</span>
                </span>
              ) : (
                '⚪ Checked OUT of Campus Locations'
              )}
            </h3>
            <p className="text-xs text-slate-300">
              {isCurrentlyIn
                ? `Entered at ${new Date(myPresence.enteredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Scanning the same QR again will toggle your status to OUT.`
                : 'You are currently outside monitored campus rooms. Scan any location QR placard to check in.'}
            </p>
          </div>

          <button
            onClick={openQrScanner}
            className={`px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 shrink-0 ${
              isCurrentlyIn
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                : 'bg-kiot-maroon hover:bg-kiot-crimson text-white shadow-kiot-maroon/40'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>{isCurrentlyIn ? 'Scan Again to Check OUT' : 'Scan Location QR to Check IN'}</span>
          </button>
        </div>

        {/* Privacy Framework Bullet Points */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Zero GPS Tracking:</strong> No continuous location polling or battery drain.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>No Last-Location:</strong> Once checked OUT, location is completely erased.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Future IoT Ready:</strong> Modular backend supports QR, RFID, NFC, and BLE.
            </span>
          </div>
        </div>
      </div>

      {/* Campus Location Placards & Generated QR Codes */}
      <div className="kiot-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Campus Location QR Placards
            </h3>
            <p className="text-xs text-slate-500">
              Official QR codes deployed at physical campus room entrances.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div
              key={loc._id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col items-center text-center group hover:border-kiot-maroon transition-all"
            >
              <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                {loc.qrCodeDataUrl ? (
                  <img
                    src={loc.qrCodeDataUrl}
                    alt={loc.name}
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <QrCode className="w-32 h-32 text-slate-300 p-4" />
                )}
              </div>

              <div>
                <h4 className="font-display font-bold text-xs text-slate-900 group-hover:text-kiot-maroon">
                  {loc.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {loc.building} • {loc.floor}
                </p>
                <span className="inline-block text-[10px] font-mono text-slate-600 font-semibold px-2 py-0.5 rounded bg-slate-200 mt-1">
                  {loc.code}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Check-In Logs */}
      <div className="kiot-card p-6 space-y-4">
        <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-kiot-maroon" />
          My Personal Presence History
        </h3>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No check-in events recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((item) => (
              <div
                key={item._id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      item.action === 'CHECK_IN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.action === 'CHECK_IN' ? 'IN' : 'OUT'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.locationName}</p>
                    <p className="text-[11px] text-slate-500">
                      Source: {item.presenceSource} •{' '}
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {item.durationMinutes !== null && (
                  <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {item.durationMinutes} min stay
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
