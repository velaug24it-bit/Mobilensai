import React from 'react';
import { NearbyPlace } from '../types/places';
import { CATEGORY_COLOR_MAP } from '../data/placesData';
import { 
  Footprints, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Accessibility, 
  ArrowRight, 
  ExternalLink,
  Phone,
  Zap,
  Star,
  Navigation
} from 'lucide-react';

interface NearbyPlaceCardProps {
  place: NearbyPlace;
  isSelected?: boolean;
  onSelect: (place: NearbyPlace) => void;
  onOpenDetails: (place: NearbyPlace) => void;
  onAddToJourney?: (place: NearbyPlace) => void;
  onNavigateExternal?: (place: NearbyPlace) => void;
}

export const NearbyPlaceCard: React.FC<NearbyPlaceCardProps> = ({
  place,
  isSelected = false,
  onSelect,
  onOpenDetails,
  onAddToJourney,
  onNavigateExternal
}) => {
  const colorScheme = CATEGORY_COLOR_MAP[place.category] || {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30'
  };

  const getFeasibilityBadge = (verdict?: string) => {
    if (!verdict) return null;
    if (verdict === 'Likely feasible') {
      return (
        <span className="text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Likely Feasible ({place.time_window_minutes}m visit)</span>
        </span>
      );
    }
    if (verdict === 'Tight buffer') {
      return (
        <span className="text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Tight Buffer ({place.time_window_minutes}m visit)</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
        <AlertTriangle className="w-3 h-3 text-rose-400" />
        <span>Not Recommended ({place.time_window_minutes}m visit)</span>
      </span>
    );
  };

  return (
    <div
      onClick={() => onSelect(place)}
      className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border ${
        isSelected
          ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-400'
          : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 shadow-lg'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`}>
            {place.category_label}
          </span>

          {place.accessibility.step_free_entrance && (
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-1" title="Step-free accessible entrance">
              <Accessibility className="w-3 h-3" />
              <span>Step-Free</span>
            </span>
          )}

          {place.category === 'ev_charging' && place.ev_info && (
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>{place.ev_info.available_ports}/{place.ev_info.total_ports} Available</span>
            </span>
          )}
        </div>

        {/* Source Transparency Badge */}
        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
          place.verification_status === 'LIVE_VERIFIED' 
            ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60' 
            : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
        }`}>
          {place.verification_status === 'LIVE_VERIFIED' ? '● VERIFIED' : '🟡 DEMO'}
        </span>
      </div>

      {/* Place Title & Rating */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
          {place.name}
        </h4>
        {place.rating && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{place.rating}</span>
          </div>
        )}
      </div>

      {/* Address */}
      <p className="text-xs text-slate-400 mt-1 line-clamp-1 flex items-center gap-1">
        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
        <span>{place.address}</span>
      </p>

      {/* Corridor Segment Milestone Tag */}
      {place.corridor_segment && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-cyan-300 font-semibold bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-lg w-fit">
          <Navigation className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>Along: {place.corridor_segment}</span>
        </div>
      )}

      {/* Metrics Row: Distance & Walking Time */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-3 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block">Distance</span>
          <span className="font-black text-cyan-300">
            {place.distance_meters ? `${place.distance_meters} m` : 'Adjacent'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Walking Time</span>
          <span className="font-black text-amber-300 flex items-center gap-1">
            <Footprints className="w-3 h-3 text-amber-400" />
            <span>{place.walking_minutes ? `~${place.walking_minutes} min` : '1 min'}</span>
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-500 block">Status</span>
          <span className="font-semibold text-emerald-400 truncate block">
            {place.status || 'Open'}
          </span>
        </div>
      </div>

      {/* "I Have Time" feasibility verdict */}
      {place.has_time_verdict && (
        <div className="mb-3">
          {getFeasibilityBadge(place.has_time_verdict)}
        </div>
      )}

      {/* Risk Zone Alert if path traverses safety boundary */}
      {place.risk_zone_warning && (
        <div className="mb-3 p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <span>{place.risk_zone_warning}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(place);
          }}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
        >
          <span>View Details</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {onAddToJourney && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToJourney(place);
            }}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-102"
          >
            <span>Add to Journey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigateExternal) onNavigateExternal(place);
            else window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, '_blank');
          }}
          title="Get Directions"
          className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
