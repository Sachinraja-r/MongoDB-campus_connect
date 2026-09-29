import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Compass, Users, Calendar, ArrowRight, Search, ShieldCheck } from 'lucide-react';

const CATEGORIES = ['All', 'Technical', 'Innovation', 'Cultural', 'Social'];

export const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/clubs', { params });
      if (res.data.success) {
        setClubs(res.data.clubs);
      }
    } catch (err) {
      console.error('Failed to load clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClubs();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Campus Clubs & Societies
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore student-led societies, technical guilds, and innovation clubs at Knowledge Institute of Technology.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-kiot-maroon text-white shadow-sm shadow-kiot-maroon/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search clubs by name or dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-1 focus:ring-kiot-maroon outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="kiot-card h-64 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-display font-bold text-slate-800 text-base">No Clubs Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div
              key={club._id}
              className="kiot-card overflow-hidden flex flex-col group"
            >
              {/* Cover Banner */}
              <div className="relative h-32 overflow-hidden bg-slate-900">
                <img
                  src={club.coverImage}
                  alt={club.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-950/80 text-kiot-gold backdrop-blur-sm border border-white/10">
                    {club.category}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 relative">
                {/* Floating Logo */}
                <div className="absolute -top-7 left-5 w-14 h-14 rounded-2xl bg-white p-1 shadow-md border border-slate-200">
                  <img
                    src={club.logo}
                    alt={club.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <div className="pt-6">
                  <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-kiot-maroon transition-colors line-clamp-1">
                    {club.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    Dept: {club.department} • Code: <span className="font-mono">{club.code}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {club.description}
                  </p>
                </div>

                {/* Footer counts */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{club.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-kiot-maroon">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{club.upcomingEventsCount} events</span>
                  </div>
                </div>

                <Link
                  to={`/clubs/${club._id}`}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-kiot-maroon hover:text-white text-slate-800 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <span>Explore Mini-Community</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
