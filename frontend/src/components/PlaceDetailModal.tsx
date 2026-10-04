import React, { useState, useEffect } from 'react';
import { NearbyPlace, DetourAnalysisResult } from '../types/places';
import { analyzePlaceDetour } from '../services/api';
import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  Accessibility, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  Footprints, 
  Navigation, 
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';

interface PlaceDetailModalProps {
  place: NearbyPlace | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToJourney: (place: NearbyPlace) => void;
  userLocation: { lat: number; lng: number };
  destinationLocation?: { lat: number; lng: number };
  busEtaMin?: number;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  isOpen,
  onClose,
  onAddToJourney,
  userLocation,
  destinationLocation = { lat: 8.7300, lng: 77.7126 },
  busEtaMin
}) => {
  const [detourAnalysis, setDetourAnalysis] = useState<DetourAnalysisResult | null>(null);
  const [loadingDetour, setLoadingDetour] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && place) {
      setLoadingDetour(true);
      analyzePlaceDetour({
        place_id: place.id,
        current_lat: userLocation.lat,
        current_lng: userLocation.lng,
        destination_lat: destinationLocation.lat,
        destination_lng: destinationLocation.lng,
        bus_eta_minutes: busEtaMin,
        journey_friction_score: 48,
        journey_duration_min: 45
      }).then(res => {
        setDetourAnalysis(res);
      }).finally(() => {
        setLoadingDetour(false);
      });
    }
  }, [isOpen, place, userLocation, destinationLocation, busEtaMin]);

  if (!isOpen || !place) return null;

  const isEmergency = ['hospital', 'pharmacy', 'police', 'fire_station'].includes(place.category);

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            {place.category_label}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            place.verification_status === 'LIVE_VERIFIED' 
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
              : 'bg-amber-950 text-amber-300 border-amber-700'
          }`}>
            {place.verification_status === 'LIVE_VERIFIED' ? '● VERIFIED DATA' : '🟡 SIMULATED DEMO'}
          </span>
          {place.status && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">
              {place.status}
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          {place.name}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-start gap-1.5">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>{place.address}</span>
        </p>

        {/* Distance & Feasibility Quick Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Walking Distance</span>
            <span className="text-base font-black text-cyan-400">{place.distance_meters || 180} m</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Walking Time</span>
            <span className="text-base font-black text-amber-400">~{place.walking_minutes || 2} min</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Driving Time</span>
            <span className="text-base font-black text-indigo-400">~{place.driving_minutes || 1} min</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Feasibility</span>
            <span className={`text-xs font-black block mt-0.5 ${place.has_time_verdict === 'Not recommended' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {place.has_time_verdict || 'Feasible'}
            </span>
          </div>
        </div>

        {/* Practical Information */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Place Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {place.opening_hours && (
              <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Operating Hours</span>
                  <span className="text-slate-200 font-medium">{place.opening_hours}</span>
                </div>
              </div>
            )}

            {place.phone && (
              <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Telephone</span>
                  <a href={`tel:${place.phone}`} className="text-emerald-300 font-bold hover:underline">
                    {place.phone}
                  </a>
                </div>
              </div>
            )}

            {place.website && (
              <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 col-span-1 sm:col-span-2">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block">Official Website</span>
                  <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-cyan-300 font-bold hover:underline truncate block">
                    {place.website}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Accessibility Amenities Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2.5">
              <Accessibility className="w-4 h-4 text-emerald-400" />
              <span>Universal Accessibility Profile</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                {place.accessibility.step_free_entrance ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={place.accessibility.step_free_entrance ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                  Step-free Entrance
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {place.accessibility.wheelchair_ramp ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={place.accessibility.wheelchair_ramp ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                  Wheelchair Ramp
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {place.accessibility.accessible_restroom ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={place.accessibility.accessible_restroom ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                  Accessible Restroom
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {place.accessibility.elevator_available ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={place.accessibility.elevator_available ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                  Elevator Available
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {place.accessibility.tactile_paving ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={place.accessibility.tactile_paving ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                  Tactile Paving
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {place.accessibility.braille_signage ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={place.accessibility.braille_signage ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                  Braille Signage
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 italic">
              Note: {place.accessibility.summary}
            </p>
          </div>

          {/* EV Charging details if present */}
          {place.category === 'ev_charging' && place.ev_info && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
              <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 mb-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>EV Fast Charging Telemetry</span>
              </h4>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Peak Output</span>
                  <strong className="text-white">{place.ev_info.power_kw} kW Fast DC</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Available Ports</span>
                  <strong className="text-emerald-400">{place.ev_info.available_ports} of {place.ev_info.total_ports} Ready</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Connectors</span>
                  <strong className="text-white">{place.ev_info.connector_types.join(', ')}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Detour & Friction Analysis Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Mobility Detour & Friction Engine</span>
              </h4>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                detourAnalysis?.detour_severity === 'Large detour' ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
              }`}>
                {detourAnalysis?.detour_severity || 'Small detour'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs my-2 text-center">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Extra Walking</span>
                <strong className="text-cyan-400 text-sm">+{detourAnalysis?.extra_distance_meters || 270} m</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Extra Journey Time</span>
                <strong className="text-amber-400 text-sm">+{detourAnalysis?.extra_time_min || 8} min</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Friction Impact</span>
                <strong className="text-rose-400 text-sm">+{detourAnalysis?.friction_impact_pts || 5} pts</strong>
              </div>
            </div>

            {detourAnalysis?.transfer_risk_warning && (
              <p className="text-xs text-rose-300 mt-2 flex items-center gap-1.5 bg-rose-950/50 p-2 rounded-lg border border-rose-500/40">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{detourAnalysis.transfer_risk_warning}</span>
              </p>
            )}
          </div>
        </div>

        {/* Disclaimers */}
        <div className="text-[10px] text-slate-500 space-y-1 mb-5 border-t border-slate-800 pt-3">
          {isEmergency && (
            <p className="text-rose-400/90 font-medium">
              🚨 Important: MobiLens is not an emergency dispatch system. For immediate life-safety emergencies, call 108 or 112.
            </p>
          )}
          {place.category === 'pharmacy' && (
            <p>
              💊 Medical Notice: MobiLens does not provide medical consultations or guarantee specific medicine inventory.
            </p>
          )}
          <p>
            🟡 Data Mode: {place.verification_status === 'LIVE_VERIFIED' ? 'Verified municipal mapping data.' : 'Simulated demonstration dataset.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, '_blank');
            }}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span>Get Directions</span>
          </button>

          <button
            onClick={() => {
              onAddToJourney(place);
              onClose();
            }}
            className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102"
          >
            <span>Add Stop to Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
