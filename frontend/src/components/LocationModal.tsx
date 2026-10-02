import React, { useState } from 'react';
import { 
  MapPin, 
  X, 
  Navigation, 
  Search, 
  Compass, 
  CheckCircle2, 
  Loader2, 
  Building2, 
  Sparkles,
  Plane
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { searchPlacesNominatim, reverseGeocodeNominatim } from '../services/api';

export const LocationModal: React.FC = () => {
  const { 
    isLocationModalOpen, 
    setIsLocationModalOpen, 
    currentLocation, 
    setCurrentLocation,
    selectCityLocation
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  if (!isLocationModalOpen) return null;

  const popularCities = [
    { 
      name: 'Tirunelveli', 
      area: 'FX Engineering College & Vannarpettai Bypass', 
      lat: 8.7300, 
      lng: 77.7126, 
      state: 'Tamil Nadu', 
      isFeatured: true,
      tag: 'ACTIVE COLLEGE CORRIDOR'
    },
    { 
      name: 'Thoothukudi', 
      area: 'Thoothukudi Airport (TCR) & Vagaikulam', 
      lat: 8.7242, 
      lng: 78.0264, 
      state: 'Tamil Nadu', 
      isFeatured: true,
      tag: 'AIRPORT GATEWAY'
    },
    { 
      name: 'Chennai', 
      area: 'Guindy Multi-Modal & Central Hub', 
      lat: 13.0067, 
      lng: 80.2023, 
      state: 'Tamil Nadu' 
    },
    { 
      name: 'Bengaluru', 
      area: 'Sector 17 & Silk Board Interchange', 
      lat: 12.9172, 
      lng: 77.6228, 
      state: 'Karnataka' 
    },
    { 
      name: 'Mumbai', 
      area: 'Dadar & Andheri Western Interchange', 
      lat: 19.0178, 
      lng: 72.8478, 
      state: 'Maharashtra' 
    },
    { 
      name: 'Delhi NCR', 
      area: 'Kashmere Gate & Anand Vihar Terminal', 
      lat: 28.6669, 
      lng: 77.2285, 
      state: 'Delhi' 
    }
  ];

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const geo = await reverseGeocodeNominatim(lat, lng);
        setCurrentLocation({
          name: geo.name,
          city: geo.city,
          lat: lat,
          lng: lng,
          isLiveGPS: true
        });
        setIsDetectingGPS(false);
        setIsLocationModalOpen(false);
      },
      (err) => {
        console.warn('GPS detection failed:', err);
        setIsDetectingGPS(false);
        alert('Could not retrieve GPS location. Please select Tirunelveli or Thoothukudi below.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchPlacesNominatim(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const parts = result.display_name.split(',');
    const name = parts[0] || 'Selected Location';
    const city = parts[1] ? parts[1].trim() : parts[0];

    setCurrentLocation({
      name,
      city,
      lat,
      lng,
      isLiveGPS: false
    });
    setIsLocationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-[#111827] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select Transit District / Corridor</h3>
              <p className="text-[11px] text-slate-400">
                Tirunelveli & Thoothukudi Districts, Tamil Nadu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Location Pill */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Currently Active Corridor:</span>
              <p className="font-bold text-white">{currentLocation.name}, {currentLocation.city}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">
            {currentLocation.lat.toFixed(4)}°N, {currentLocation.lng.toFixed(4)}°E
          </span>
        </div>

        {/* GPS Live Detection Action */}
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isDetectingGPS}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {isDetectingGPS ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Acquiring Device GPS Coordinates...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>Detect My Current GPS Location (Live Browser Sensor)</span>
            </>
          )}
        </button>

        {/* Real Place Search Bar */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Francis Xavier Engg College, Vagaikulam, Palayamkottai..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-slate-800 max-h-40 overflow-y-auto space-y-1">
            {searchResults.map((res, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSearchResult(res)}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between"
              >
                <span className="truncate max-w-[85%]">{res.display_name}</span>
                <span className="text-[10px] text-cyan-400 font-mono">Select</span>
              </button>
            ))}
          </div>
        )}

        {/* Featured Regions */}
        <div className="mt-5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
            Regional Transit Corridors (Tamil Nadu & India):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {popularCities.map((c) => {
              const isSelected = currentLocation.city.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    selectCityLocation(c.name, c.lat, c.lng, c.area);
                    setIsLocationModalOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between relative ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400'
                      : c.isFeatured
                      ? 'bg-slate-900 border-cyan-500/30 text-slate-200 hover:border-cyan-400/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      {c.name.includes('Thoothukudi') ? (
                        <Plane className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <span>{c.name}</span>
                      {c.tag && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                          {c.tag}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">{c.area}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/80 text-center text-[10px] text-slate-500">
          Thoothukudi Airport (TCR) to Francis Xavier Engineering College corridor loaded
        </div>
      </div>
    </div>
  );
};
