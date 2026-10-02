import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  Sun, 
  Accessibility, 
  Bus, 
  MapPin, 
  ThumbsUp, 
  Send, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportTrapModal: React.FC = () => {
  const { 
    isReportModalOpen, 
    setIsReportModalOpen, 
    reportPreFill, 
    addReport, 
    upvoteReportAction, 
    reports, 
    currentUser,
    databaseName
  } = useApp();

  const [category, setCategory] = useState<'excessive_wait' | 'dangerous_crossing' | 'extreme_heat_no_shade' | 'broken_ramp' | 'unscheduled_delay'>('excessive_wait');
  const [severity, setSeverity] = useState<'moderate' | 'high' | 'critical'>('high');
  const [locationName, setLocationName] = useState(reportPreFill?.locationName || 'Vannarpettai Bypass Road (FXEC Entrance)');
  const [district, setDistrict] = useState('Tirunelveli');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // When prefill updates
  React.useEffect(() => {
    if (reportPreFill?.locationName) {
      setLocationName(reportPreFill.locationName);
    }
  }, [reportPreFill]);

  if (!isReportModalOpen) return null;

  const categories = [
    { id: 'excessive_wait', label: 'Excessive Wait', icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'dangerous_crossing', label: 'Dangerous Crossing', icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { id: 'extreme_heat_no_shade', label: 'Heat & No Shade', icon: Sun, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
    { id: 'broken_ramp', label: 'Broken Ramp / Inaccessible', icon: Accessibility, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { id: 'unscheduled_delay', label: 'Missing Feeder Bus', icon: Bus, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  ];

  const quickChips = [
    "Waited 25+ min on highway shoulder at Vagaikulam",
    "Hazardous 4-lane crossing at Vannarpettai Bypass without signal",
    "Extreme 39°C midday sun, no tree shade walking to FXEC",
    "Broken wheelchair ramp at Tirunelveli Railway Junction",
    "Overcrowded peak-hour bus with footboard standing"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const success = await addReport({
      locationName: locationName.trim(),
      district: district.trim(),
      category,
      severity,
      title: title.trim(),
      description: description.trim(),
      coordinates: reportPreFill?.lat ? { lat: reportPreFill.lat, lng: reportPreFill.lng } : { lat: 8.7300, lng: 77.7126 }
    });

    setIsSubmitting(false);
    if (success) {
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setIsReportModalOpen(false);
        setTitle('');
        setDescription('');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#101726] border border-slate-800 rounded-3xl shadow-2xl shadow-cyan-950/20 max-h-[90vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#101726]/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Report a Human Friction Trap
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Citizen Crowdsource
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Flag real bottlenecks to notify municipal authorities and update community friction scores.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setIsReportModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Report Successfully Recorded!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your report has been saved to the live <strong>MongoDB Atlas</strong> database. City planners and fellow commuters can now see this friction alert.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                1. Select Trap Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        isSelected 
                          ? `${cat.color} font-bold shadow-sm` 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                2. Friction Severity
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSeverity('moderate')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    severity === 'moderate'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Moderate Delay
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('high')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    severity === 'high'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  High Fatigue / Wait
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('critical')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    severity === 'critical'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Critical Hazard
                </button>
              </div>
            </div>

            {/* Location & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Location Name / Landmark
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Vannarpettai Bypass Road"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  District / Region
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                >
                  <option value="Tirunelveli">Tirunelveli District</option>
                  <option value="Thoothukudi">Thoothukudi District</option>
                  <option value="NH 138 Corridor">NH 138 Corridor (TCR ➔ FXEC)</option>
                </select>
              </div>
            </div>

            {/* Quick Chips */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Quick Description Templates (Click to fill)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTitle(chip.split(',')[0]);
                      setDescription(chip);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-300 transition-colors"
                  >
                    + {chip.slice(0, 38)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Report Summary Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 25-minute wait with zero shelter on NH 138"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Detailed Commuter Experience
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe why this part of the journey is exhausting or dangerous..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Syncs to MongoDB Atlas: <strong>{databaseName}</strong>
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Friction Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Existing Recent Community Reports */}
        <div className="p-5 border-t border-slate-800 bg-[#0c121e] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Live Crowdsourced Reports in Tirunelveli & Thoothukudi ({reports.length})
            </span>
            <span className="text-[10px] text-cyan-400">Click 👍 to upvote priority</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {reports.slice(0, 4).map((rep) => (
              <div
                key={rep.id}
                className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white font-semibold text-xs">{rep.title}</strong>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      rep.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      rep.severity === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {rep.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {rep.description}
                  </p>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2">
                    <span className="text-cyan-400">{rep.locationName}</span>
                    <span>•</span>
                    <span>By {rep.reportedBy}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => upvoteReportAction(rep.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 font-bold text-[11px] flex items-center gap-1.5 transition-colors flex-shrink-0"
                  title="Upvote this bottleneck for municipal action"
                >
                  <ThumbsUp className="w-3 h-3 text-cyan-400" />
                  <span>{rep.upvotes}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
