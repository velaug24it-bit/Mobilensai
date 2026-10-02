import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Plus, 
  ThumbsUp, 
  Filter, 
  Camera, 
  CheckCircle2, 
  Clock, 
  Search,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CitizenReport } from '../types';

export const CitizenReportsPage: React.FC = () => {
  const { reports, addReport, upvoteReportAction, setIsReportModalOpen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Form State for in-page submission option
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    locationName: '',
    district: 'Tirunelveli',
    category: 'dangerous_crossing',
    severity: 'high',
    title: '',
    description: '',
    photoAttached: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories = [
    { id: 'all', label: 'All Hazards' },
    { id: 'dangerous_crossing', label: 'Unsafe / Missing Crossing' },
    { id: 'broken_ramp', label: 'Broken Sidewalk / Ramp' },
    { id: 'excessive_wait', label: 'Blocked / Problem Bus Stop' },
    { id: 'extreme_heat_no_shade', label: 'No Shade / Extreme Heat' },
    { id: 'unscheduled_delay', label: 'Transit Delay / Reliability' }
  ];

  const filteredReports = reports.filter(r => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSeverity = filterSeverity === 'all' || r.severity === filterSeverity;
    const matchesSearch = !searchQuery || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.locationName) return;

    setIsSubmitting(true);
    const success = await addReport({
      locationName: formData.locationName,
      district: formData.district,
      category: formData.category as any,
      severity: formData.severity as any,
      title: formData.title,
      description: formData.description,
      coordinates: { lat: 8.7300, lng: 77.7126 }
    });

    setIsSubmitting(false);
    if (success) {
      setSubmitSuccess(true);
      setShowForm(false);
      setFormData({
        locationName: '',
        district: 'Tirunelveli',
        category: 'dangerous_crossing',
        severity: 'high',
        title: '',
        description: '',
        photoAttached: false
      });
      setTimeout(() => setSubmitSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Citizen Mobility Cell
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              🟠 USER REPORTED
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Citizen Mobility Reporting
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Crowdsource real-world sidewalk friction, missing crossings, inaccessible ramps, and bus stop hazards directly to city planners.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancel Report' : 'Report Mobility Hazard'}</span>
        </button>
      </div>

      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Thank you! Your mobility hazard report has been logged and submitted with tag: <strong>Reported by citizen — pending verification</strong>.</span>
        </div>
      )}

      {/* Inline Report Submission Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span>Submit a New Mobility Friction or Road Hazard Report</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Location / Landmark *</label>
              <input
                type="text"
                required
                value={formData.locationName}
                onChange={e => setFormData({ ...formData, locationName: e.target.value })}
                placeholder="e.g. Vannarpettai Bypass Road opposite FXEC Gate"
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Hazard Category *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
              >
                <option value="dangerous_crossing">Unsafe Crossing / Missing Crosswalk</option>
                <option value="broken_ramp">Broken Sidewalk / Broken Wheelchair Ramp</option>
                <option value="excessive_wait">Blocked Bus Stop / No Shelter</option>
                <option value="extreme_heat_no_shade">Extreme Heat / Zero Tree Shade</option>
                <option value="unscheduled_delay">Transit Delay / Missed Transfer</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Severity Rating</label>
              <select
                value={formData.severity}
                onChange={e => setFormData({ ...formData, severity: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
              >
                <option value="critical">🔴 Critical (Immediate Safety Risk)</option>
                <option value="high">🟠 High (Major Daily Burden)</option>
                <option value="moderate">🟡 Moderate (Inconvenience / Discomfort)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Report Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Dangerous 4-lane highway crossing without pedestrian light"
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold text-xs block mb-1">Detailed Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe why this location causes friction or safety risk for commuters..."
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Attach Photo:</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, photoAttached: !formData.photoAttached })}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  formData.photoAttached ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {formData.photoAttached ? '✓ Photo Attached (Simulated)' : '+ Add Photo'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? 'Recording Report...' : 'Submit Citizen Report'}
            </button>
          </div>
        </form>
      )}

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search reports or locations..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Reports Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map(rep => {
          const isCritical = rep.severity === 'critical';
          const isHigh = rep.severity === 'high';

          return (
            <div 
              key={rep.id} 
              className={`p-5 rounded-2xl bg-slate-900 border transition-all hover:border-slate-700 space-y-3 shadow-lg ${
                isCritical ? 'border-rose-500/40 bg-gradient-to-br from-slate-900 to-rose-950/20' :
                isHigh ? 'border-orange-500/30' : 'border-slate-800'
              }`}
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  🟠 Reported by citizen — pending verification
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  isHigh ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {rep.severity} Severity
                </span>
              </div>

              {/* Title & Location */}
              <div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {rep.title}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-cyan-400 mt-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{rep.locationName}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                "{rep.description}"
              </p>

              {/* Meta & Upvote Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span>By: <strong className="text-slate-300">{rep.reportedBy}</strong></span>
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(rep.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => upvoteReportAction(rep.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 hover:border-cyan-400/50"
                  title="Upvote this hazard report to increase municipal priority"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{rep.upvotes || 1} Confirmations</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
