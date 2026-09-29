import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  AlertCircle,
} from 'lucide-react';

export const FriendsPage = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({ incoming: [], outgoing: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const [friendsRes, pendingRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/pending'),
      ]);

      if (friendsRes.data.success) setFriends(friendsRes.data.friends);
      if (pendingRes.data.success) setPendingRequests(pendingRes.data);
    } catch (err) {
      console.error('Failed to load friends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      setErrorMsg('');
      const res = await api.get(`/friends/search?query=${encodeURIComponent(searchQuery.trim())}`);
      if (res.data.success) {
        setSearchResults(res.data.users);
      }
    } catch (err) {
      setErrorMsg('Search failed.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (recipientId) => {
    try {
      setErrorMsg('');
      setFeedbackMsg('');
      const res = await api.post('/friends/request', { recipientId });
      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        // Refresh search state
        setSearchResults((prev) =>
          prev.map((u) => (u._id === recipientId ? { ...u, friendship: { status: 'pending', isRequester: true } } : u))
        );
        await fetchFriends();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send friend request.');
    }
  };

  const handleAcceptRequest = async (friendshipId) => {
    try {
      const res = await api.put(`/friends/request/${friendshipId}/accept`);
      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        await fetchFriends();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to accept request.');
    }
  };

  const handleRejectRequest = async (friendshipId) => {
    try {
      const res = await api.delete(`/friends/request/${friendshipId}/reject`);
      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        await fetchFriends();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reject request.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Friends & Peer Connections
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Connect with peers across departments. Only accepted friends can view permitted campus presence when checked IN.
        </p>
      </div>

      {/* Alerts */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Student Search Bar (by Register Number / Name) */}
      <div className="kiot-card p-6 space-y-4">
        <h3 className="font-display font-bold text-sm text-slate-900">
          Search KIOT Students
        </h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Register Number (e.g. 2K24CSE167), Name, or Department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
          <button
            type="submit"
            disabled={searchLoading || !searchQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-kiot-maroon hover:bg-kiot-crimson text-white text-xs font-bold shadow-md shadow-kiot-maroon/20 transition-all disabled:opacity-50"
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Search Results ({searchResults.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchResults.map((s) => (
                <div
                  key={s._id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {s.registerNumber} • {s.department}
                      </p>
                    </div>
                  </div>

                  {s.friendship.status === 'accepted' ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      Connected
                    </span>
                  ) : s.friendship.status === 'pending' ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(s._id)}
                      className="px-3 py-1.5 rounded-xl bg-kiot-maroon text-white font-bold text-[11px] hover:bg-kiot-crimson transition-colors flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Friend</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs: Connected Friends vs Pending Requests */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('friends')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'friends'
                ? 'border-kiot-maroon text-kiot-maroon'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Connected Friends ({friends.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-kiot-maroon text-kiot-maroon'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              Pending Requests ({pendingRequests.incoming.length + pendingRequests.outgoing.length})
            </span>
          </button>
        </div>

        {/* Tab 1: Friends with Live Presence Status */}
        {activeTab === 'friends' && (
          <div>
            {friends.length === 0 ? (
              <div className="kiot-card p-12 text-center space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-display font-bold text-slate-800 text-base">No Connected Friends Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Search by Register Number above (e.g. 2K24CSE167 or 2K24CSE101) to connect with your classmates.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {friends.map((f) => {
                  const isFriendIn = f.presence?.status === 'IN';

                  return (
                    <div
                      key={f._id}
                      className="kiot-card p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={f.avatar}
                            alt={f.name}
                            className="w-11 h-11 rounded-full object-cover border border-slate-200 bg-slate-100"
                          />
                          <div>
                            <h4 className="font-display font-bold text-sm text-slate-900 truncate">
                              {f.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {f.registerNumber} • {f.department}
                            </p>
                          </div>
                        </div>

                        {/* Live Presence Status Chip */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isFriendIn
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isFriendIn ? 'bg-emerald-500 pulse-green' : 'bg-slate-400'
                            }`}
                          />
                          <span>{f.presence?.status}</span>
                        </span>
                      </div>

                      {/* Presence Location Details (Strictly hidden if OUT) */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Current Campus Location:</span>
                        </div>
                        {isFriendIn ? (
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-kiot-maroon" />
                              <span>{f.presence?.locationName}</span>
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Checked in at {new Date(f.presence?.enteredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-500 italic text-[11px]">
                            ⚪ OUT of monitored locations (Location hidden)
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pending Requests */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {/* Incoming Requests */}
            <div className="kiot-card p-5 space-y-3">
              <h4 className="font-display font-bold text-sm text-slate-900">
                Incoming Requests ({pendingRequests.incoming.length})
              </h4>
              {pendingRequests.incoming.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No pending incoming friend requests.</p>
              ) : (
                <div className="space-y-2">
                  {pendingRequests.incoming.map((req) => (
                    <div
                      key={req._id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={req.requester?.avatar}
                          alt={req.requester?.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{req.requester?.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {req.requester?.registerNumber} • {req.requester?.department} (Yr {req.requester?.year})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAcceptRequest(req._id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req._id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Requests */}
            <div className="kiot-card p-5 space-y-3">
              <h4 className="font-display font-bold text-sm text-slate-900">
                Outgoing Requests Sent ({pendingRequests.outgoing.length})
              </h4>
              {pendingRequests.outgoing.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No outgoing requests waiting for approval.</p>
              ) : (
                <div className="space-y-2">
                  {pendingRequests.outgoing.map((req) => (
                    <div
                      key={req._id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={req.recipient?.avatar}
                          alt={req.recipient?.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{req.recipient?.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {req.recipient?.registerNumber} • {req.recipient?.department}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                        Awaiting Response
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
