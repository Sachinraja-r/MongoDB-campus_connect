import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  QrCode,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

export const QrScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const { user, refreshUser, updatePresence } = useAuth();
  const [locations, setLocations] = useState([]);
  const [selectedSimLocation, setSelectedSimLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('simulate'); // default to simulate for desktop convenience

  // Fetch active QR locations for quick simulation
  useEffect(() => {
    if (!isOpen) return;

    const fetchLocations = async () => {
      try {
        const res = await api.get('/presence/locations');
        if (res.data.success) {
          setLocations(res.data.locations);
          if (res.data.locations.length > 0) {
            setSelectedSimLocation(res.data.locations[0].qrIdentifier);
          }
        }
      } catch (err) {
        console.error('Failed to load campus locations:', err);
      }
    };

    fetchLocations();
  }, [isOpen]);

  // Setup HTML5 Camera Scanner if camera tab selected
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        await handleScanSubmit(decodedText);
      },
      (error) => {
        // ignore continuous scanning frame errors
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [isOpen, activeTab]);

  const handleScanSubmit = async (qrIdentifier) => {
    setLoading(true);
    setErrorMsg('');
    setScanResult(null);

    try {
      const res = await api.post('/presence/scan', {
        qrIdentifier,
        presenceSource: 'QR',
      });

      if (res.data.success) {
        setScanResult(res.data);
        updatePresence(res.data.presence);
        await refreshUser();
        if (onScanSuccess) onScanSuccess(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to process QR presence scan.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-kiot-maroon text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-kiot-gold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base">Campus Presence Check-In</h3>
              <p className="text-xs text-kiot-lightgold/80">Single-QR IN / OUT Mechanism</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers: Simulator vs Camera */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            onClick={() => {
              setActiveTab('simulate');
              setScanResult(null);
            }}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'simulate'
                ? 'border-kiot-maroon text-kiot-maroon'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Interactive QR Simulator (Instant)
          </button>
          <button
            onClick={() => {
              setActiveTab('camera');
              setScanResult(null);
            }}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'camera'
                ? 'border-kiot-maroon text-kiot-maroon'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            Webcam / Phone Scanner
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Privacy Note */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Zero-Tracking Privacy Guarantee:</span> The same QR code toggles your status. When you scan OUT, your location is completely cleared. No background GPS or historical location is exposed to peers.
            </div>
          </div>

          {/* Current Student Status */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">Your Current Status:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  user?.presence?.status === 'IN' ? 'bg-emerald-500 pulse-green' : 'bg-slate-400'
                }`}
              />
              <span className="text-xs font-bold text-slate-800">
                {user?.presence?.status === 'IN'
                  ? `🟢 IN — ${user?.presence?.locationName}`
                  : '⚪ OUT of Monitored Locations'}
              </span>
            </div>
          </div>

          {/* Scan Result Feedback Alert */}
          {scanResult && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 animate-in zoom-in-95 duration-150 ${
                scanResult.action === 'CHECK_IN'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-slate-100 border-slate-300 text-slate-900'
              }`}
            >
              <CheckCircle2
                className={`w-5 h-5 shrink-0 ${
                  scanResult.action === 'CHECK_IN' ? 'text-emerald-600' : 'text-slate-600'
                }`}
              />
              <div>
                <p className="text-xs font-bold">{scanResult.message}</p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {scanResult.action === 'CHECK_IN'
                    ? `Status updated to IN. Mutual friends and assigned mentor can see your presence.`
                    : `Status updated to OUT. Your campus location is now private.`}
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tab 1: Interactive Simulator (Select Location & Scan) */}
          {activeTab === 'simulate' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Approved Campus Location:
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {locations.map((loc) => {
                    const isSelected = selectedSimLocation === loc.qrIdentifier;
                    return (
                      <button
                        key={loc.qrIdentifier}
                        type="button"
                        onClick={() => setSelectedSimLocation(loc.qrIdentifier)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-kiot-maroon/5 border-kiot-maroon ring-1 ring-kiot-maroon text-kiot-maroon'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 shrink-0 text-slate-500" />
                          <div>
                            <p className="text-xs font-bold">{loc.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {loc.building} • {loc.floor}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {loc.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={loading || !selectedSimLocation}
                onClick={() => handleScanSubmit(selectedSimLocation)}
                className="w-full py-3 px-4 rounded-xl bg-kiot-maroon text-white font-bold text-xs sm:text-sm hover:bg-kiot-crimson shadow-md shadow-kiot-maroon/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <QrCode className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Processing Scan...'
                    : user?.presence?.status === 'IN'
                    ? 'Scan Again to Check OUT'
                    : 'Scan QR to Check IN'}
                </span>
              </button>
            </div>
          )}

          {/* Tab 2: Webcam Scanning */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div id="qr-reader" className="w-full rounded-2xl overflow-hidden border border-slate-200" />
              <p className="text-[11px] text-center text-slate-500">
                Point your mobile or laptop camera at the physical campus location QR code placard.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
