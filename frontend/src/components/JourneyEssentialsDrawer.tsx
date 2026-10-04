import React, { useState, useEffect } from 'react';
import { NearbyPlace, PlaceCategory } from '../types/places';
import { fetchNearbyPlaces, addPlaceToActiveJourney } from '../services/api';
import { 
  X, 
  Hospital, 
  Pill, 
  Utensils, 
  Bath, 
  Fuel, 
  CreditCard, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ExternalLink,
  Footprints,
  Compass
} from 'lucide-react';

interface JourneyEssentialsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentStopName: string;
  anchorLat: number;
  anchorLng: number;
  busEtaMin: number;
  busRouteName: string;
  onOpenFullNearbyPage: () => void;
  onPlaceSelectedOnMap?: (place: NearbyPlace) => void;
}

const ESSENTIAL_CATEGORIES = [
  { id: 'hospital', label: 'Emergency', icon: Hospital, color: 'text-rose-400 bg-rose-500/15 border-rose-500/40' },
  { id: 'pharmacy', label: 'Medicine', icon: Pill, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40' },
  { id: 'restaurant', label: 'Food', icon: Utensils, color: 'text-amber-400 bg-amber-500/15 border-amber-500/40' },
  { id: 'toilet', label: 'Toilet', icon: Bath, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/40' },
  { id: 'fuel', label: 'Fuel / EV', icon: Fuel, color: 'text-orange-400 bg-orange-500/15 border-orange-500/40' },
  { id: 'atm', label: 'ATM', icon: CreditCard, color: 'text-blue-400 bg-blue-500/15 border-blue-500/40' },
];

export const JourneyEssentialsDrawer: React.FC<JourneyEssentialsDrawerProps> = ({
  isOpen,
  onClose,
  currentStopName,
  anchorLat,
  anchorLng,
  busEtaMin,
  busRouteName,
  onOpenFullNearbyPage,
  onPlaceSelectedOnMap
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('pharmacy');
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addedSuccessMsg, setAddedSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchNearbyPlaces({
        lat: anchorLat,
        lng: anchorLng,
        category: selectedCat,
        radius_meters: 2500,
        bus_eta_min: busEtaMin
      }).then(res => {
        setPlaces(res);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen, selectedCat, anchorLat, anchorLng, busEtaMin]);

  if (!isOpen) return null;

  const handleAddStop = async (p: NearbyPlace) => {
    const res = await addPlaceToActiveJourney(p.id);
    if (res && res.status === 'success') {
      setAddedSuccessMsg(`Added ${p.name} (+${res.recalculated_journey.additional_walking_minutes}m walk, +${res.recalculated_journey.additional_friction_pts} friction)`);
      setTimeout(() => setAddedSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-[1250] flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl p-5 flex flex-col text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Journey Essentials</h3>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">
                Near {currentStopName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Bus Time Reminder */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Bus <strong className="text-white">{busRouteName}</strong> ETA:</span>
          </div>
          <span className="font-black text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
            ~{busEtaMin} min available
          </span>
        </div>

        {/* Quick Category Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {ESSENTIAL_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isAct = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isAct 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950/50' 
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px] font-bold">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Success toast if added */}
        {addedSuccessMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-xs text-emerald-200 mb-3 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{addedSuccessMsg}</span>
          </div>
        )}

        {/* Places List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <span className="inline-block w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
              <p>Scanning corridor essentials...</p>
            </div>
          ) : places.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl p-4 border border-slate-800">
              <p>No places found in this category near this stop.</p>
            </div>
          ) : (
            places.map((place) => (
              <div
                key={place.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate max-w-[240px]">
                    {place.name}
                  </h4>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-900">
                    {place.distance_meters} m
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {place.address}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Footprints className="w-3.5 h-3.5" />
                    <span>~{place.walking_minutes}m walk</span>
                  </span>

                  {place.has_time_verdict && (
                    <span className={`font-bold ${place.has_time_verdict === 'Not recommended' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {place.has_time_verdict === 'Likely feasible' ? '● Likely Feasible' : '⚠ Tight'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (onPlaceSelectedOnMap) onPlaceSelectedOnMap(place);
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold py-1.5 px-2 rounded-lg border border-slate-700 text-center"
                  >
                    View on Map
                  </button>

                  <button
                    onClick={() => handleAddStop(place)}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-[11px] font-black py-1.5 px-2 rounded-lg shadow flex items-center justify-center gap-1 transition-transform hover:scale-102"
                  >
                    <span>Add Stop</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 mt-3">
          <button
            onClick={() => {
              onClose();
              onOpenFullNearbyPage();
            }}
            className="w-full bg-slate-800/90 hover:bg-slate-700 text-cyan-300 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 border border-cyan-500/30 transition-colors"
          >
            <span>Open Full Mobility Nearby Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
