import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  MapPin, 
  Layers, 
  Sliders, 
  Accessibility, 
  BarChart3, 
  Bot, 
  Bell, 
  Sparkles, 
  Tv, 
  Play, 
  User, 
  ShieldCheck, 
  Navigation, 
  ArrowRight, 
  Menu, 
  X,
  Compass,
  GitCompare,
  TrendingDown,
  Info,
  Database,
  ChevronDown,
  LogOut,
  Radio,
  ShieldAlert,
  History,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationPanel } from '../components/NotificationPanel';
import { AIChatModal } from '../components/AIChatModal';
import { HackathonDemoModal } from '../components/HackathonDemoModal';
import { HackathonDemoVideo } from '../components/HackathonDemoVideo';
import { PresentationMode } from '../components/PresentationMode';
import { LocationModal } from '../components/LocationModal';
import { ReportTrapModal } from '../components/ReportTrapModal';

export const MainLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    role, 
    userEmail, 
    currentUser, 
    logout,
    showAllTools,
    setShowAllTools,
    unreadCount, 
    isNotificationOpen, 
    setIsNotificationOpen, 
    setIsAIAssistantOpen,
    startHackathonDemo,
    setIsPresentationMode,
    isDemoMode,
    setIsDemoMode,
    backendStatus,
    databaseName,
    currentLocation,
    setIsLocationModalOpen,
    showDemoVideo,
    setShowDemoVideo,
    setIsHackathonDemoRunning,
    setHackathonStep,
  } = useApp();

  const allNavLinks = [
    { to: '/overview', label: 'Dashboard', icon: Activity, roles: ['citizen', 'planner', 'accessibility', 'admin'] },
    { to: '/my-journey', label: 'My Journey', icon: Navigation, badge: '61 Min', roles: ['citizen', 'accessibility', 'admin'] },
    { to: '/live-journey', label: 'Live Journey', icon: Radio, badge: 'Live GPS', roles: ['citizen', 'planner', 'accessibility', 'admin'] },
    { to: '/nearby', label: 'Nearby', icon: Compass, badge: 'Essentials', roles: ['citizen', 'planner', 'accessibility', 'admin'] },
    { to: '/analyzer', label: 'Journey Analyzer', icon: TrendingDown, badge: 'Bottlenecks', roles: ['citizen', 'accessibility', 'admin'] },
    { to: '/map', label: 'Mobility Friction Map', icon: MapPin, roles: ['citizen', 'planner', 'accessibility', 'admin'] },
    { to: '/risk-map', label: 'Mobility Risk Map', icon: ShieldAlert, badge: 'CV Vision', roles: ['citizen', 'planner', 'accessibility', 'admin'] },
    { to: '/city-intelligence', label: 'City Intelligence', icon: Layers, badge: 'District KPIs', roles: ['planner', 'admin'] },
    { to: '/interventions', label: 'AI Interventions', icon: Sparkles, badge: '-43% ROI', roles: ['planner', 'admin'] },
    { to: '/simulator', label: 'What-If Simulator', icon: Sliders, roles: ['planner', 'admin'] },
    { to: '/accessibility', label: 'Accessibility', icon: Accessibility, badge: 'Step-Free', roles: ['accessibility', 'admin'] },
    { to: '/citizen-reports', label: 'Citizen Reports', icon: AlertTriangle, badge: 'Community', roles: ['citizen', 'accessibility', 'admin', 'planner'] },
    { to: '/journey-history', label: 'Journey History', icon: History, roles: ['citizen', 'accessibility', 'admin'] },
    { to: '/ai-assistant', label: 'AI Assistant', icon: Bot, badge: 'NLP', roles: ['citizen', 'planner', 'accessibility', 'admin'] },
    { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['citizen', 'planner', 'accessibility', 'admin'] },
    { to: '/settings', label: 'Settings', icon: Settings, roles: ['citizen', 'planner', 'accessibility', 'admin'] },
  ];


  // Filter links according to active role unless "Judge Mode" is toggled
  const activeNavLinks = showAllTools 
    ? allNavLinks 
    : allNavLinks.filter(item => item.roles.includes(role));

  const roleLabels: Record<string, { label: string; badge: string; color: string }> = {
    citizen: { label: 'Citizen Commuter', badge: 'Student & Traveler', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    planner: { label: 'Transit Planner', badge: 'TNSTC & Authority', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    accessibility: { label: 'Inclusive Mobility', badge: 'Barrier-Free', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    admin: { label: 'System Admin', badge: 'Full Access', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
  };

  const currentRoleInfo = roleLabels[role] || roleLabels.citizen;

  return (
    <div className="flex h-screen bg-[#0B0F19] text-slate-100 overflow-hidden font-sans">
      {/* Location Selector Modal */}
      <LocationModal />

      {/* Crowdsourced Citizen Friction Report Modal */}
      <ReportTrapModal />

      {/* Presentation Mode Fullscreen Overlay */}
      <PresentationMode />

      {/* Cinematic Hackathon Demo Video (plays before step-by-step modal) */}
      {showDemoVideo && (
        <HackathonDemoVideo
          onClose={() => setShowDemoVideo(false)}
          onFinished={() => {
            setShowDemoVideo(false);
            setIsHackathonDemoRunning(true);
            setHackathonStep(1);
          }}
        />
      )}

      {/* Guided Hackathon Demo Walkthrough */}
      <HackathonDemoModal />

      {/* Floating AI Assistant Chat */}
      <AIChatModal />

      {/* Notifications Drawer */}
      <NotificationPanel />

      {/* Desktop Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo and Tagline */}
        <div>
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
                ML
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white text-lg flex items-center gap-1.5">
                  MobiLens <span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold block uppercase tracking-wider -mt-0.5">
                  Mobility Intelligence
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic mt-2 leading-tight">
              "See the journey beyond the vehicle."
            </p>
          </div>

          {/* Active Role Indicator Card */}
          <div className="mx-3 mt-3 p-3 rounded-2xl bg-[#0d1424] border border-slate-800/90 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${currentRoleInfo.color}`}>
                {currentRoleInfo.label}
              </span>
              <NavLink 
                to="/login"
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2"
                title="Switch persona or sign in"
              >
                Switch
              </NavLink>
            </div>
            <div className="text-[11px] font-bold text-white truncate">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {currentUser.organization || 'Francis Xavier Engg College'}
            </div>

            {/* Toggle: Role Filter vs Judge Mode (Show All) */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">
                {showAllTools ? 'Showing All 15 Tools' : 'Showing Tailored Tools'}
              </span>

              <button
                type="button"
                onClick={() => setShowAllTools(!showAllTools)}
                className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                  showAllTools 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle between focused role view and full 11-tool suite"
              >
                {showAllTools ? 'Focused' : 'Judge View'}
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-330px)] overflow-y-auto scrollbar-thin">
            {activeNavLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60 group-hover:text-cyan-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Status Card */}
        <div className="p-4 border-t border-slate-800 bg-[#0E1524]">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-slate-400 font-medium">Demo Mode</span>
            <button
              type="button"
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                isDemoMode ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isDemoMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Live MongoDB Status */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-2 text-slate-300 truncate max-w-[80%]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="truncate">Atlas: <strong className="text-emerald-400">{databaseName}</strong></span>
            </span>
            <Database className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          </div>

          <div className="mt-2 text-[10px] text-slate-500 text-center">
            {backendStatus}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#111827]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 z-40">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Interactive Dynamic Location Pill */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 hover:border-cyan-400/50 transition-all text-xs text-left group shadow-sm"
              title="Click to detect GPS or choose real city"
            >
              <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block -mb-0.5 group-hover:text-cyan-300">
                  {currentLocation.isLiveGPS ? 'Live GPS Location' : 'City / Transit Hub'}
                </span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-white font-semibold">
                    {currentLocation.city}
                  </strong>
                  <span className="text-[10px] text-slate-400 hidden sm:inline truncate max-w-[120px]">
                    ({currentLocation.name})
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                </div>
              </div>
            </button>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Run Hackathon Demo Button */}
            <button
              type="button"
              onClick={startHackathonDemo}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Run Hackathon Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>

            {/* Presentation Mode Button */}
            <button
              type="button"
              onClick={() => setIsPresentationMode(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Pitch Mode / Presentation View"
            >
              <Tv className="w-4 h-4 text-purple-400" />
              <span className="hidden lg:inline">Pitch Deck</span>
            </button>

            {/* AI Assistant Trigger */}
            <button
              type="button"
              onClick={() => setIsAIAssistantOpen(true)}
              className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Open AI Assistant"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Notifications Trigger */}
            <button
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* User Profile Pill / Role Switcher */}
            <div className="flex items-center gap-1.5">
              <NavLink
                to="/login"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs transition-colors shadow-sm group"
                title="Switch persona or sign in"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-cyan-400 capitalize font-medium -mt-0.5">
                    {role}
                  </div>
                </div>
              </NavLink>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 border border-slate-800 hover:border-rose-500/30 transition-colors"
                title="Log Out / Switch User"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Nested Page Content with independent scroll */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
