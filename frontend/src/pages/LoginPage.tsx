import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Navigation, 
  Layers, 
  Accessibility, 
  Check, 
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Database,
  Sparkles
} from 'lucide-react';
import { useApp, UserRole, UserProfile } from '../context/AppContext';
import { loginUser, signupUser } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, setRole, setCurrentUser, databaseName } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(role || 'citizen');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('citizen@mobilens.ai');
  const [loginPassword, setLoginPassword] = useState('citizen123');

  // Sign Up Form States
  const [signupName, setSignupName] = useState('Velraj');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDistrict, setSignupDistrict] = useState('Tirunelveli');
  const [signupOrg, setSignupOrg] = useState('Francis Xavier Engineering College');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getTargetRouteForRole = (r: UserRole): string => {
    if (r === 'planner') return '/city-intelligence';
    if (r === 'accessibility') return '/accessibility';
    return '/my-journey';
  };

  // 1-Click Fast Login for Hackathon Judges
  const handleFastDemoLogin = (r: UserRole) => {
    setSelectedRole(r);
    setErrorMessage(null);
    let targetEmail = 'citizen@mobilens.ai';
    let targetName = 'Velraj (Student / Commuter)';
    let targetOrg = 'Francis Xavier Engineering College';
    let targetDistrict = 'Tirunelveli';

    if (r === 'planner') {
      targetEmail = 'planner@mobilens.ai';
      targetName = 'S. Meenakshi (Transit Planning Officer)';
      targetOrg = 'TNSTC / Municipal Mobility Cell';
      targetDistrict = 'Tirunelveli & Thoothukudi';
    } else if (r === 'accessibility') {
      targetEmail = 'access@mobilens.ai';
      targetName = 'Dr. K. Raman (Inclusive Transit Advocate)';
      targetOrg = 'Accessible Tamil Nadu Mission';
      targetDistrict = 'Tirunelveli';
    }

    const demoUser: UserProfile = {
      id: `user-demo-${r}`,
      name: targetName,
      email: targetEmail,
      role: r,
      district: targetDistrict,
      organization: targetOrg
    };

    setCurrentUser(demoUser);
    setRole(r);
    setSuccessMessage(`Welcome, ${targetName}! Unlocking your tailored features...`);

    const dest = getTargetRouteForRole(r);
    setTimeout(() => {
      navigate(dest, { replace: true });
    }, 400);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await loginUser(loginEmail, loginPassword);
      if (res && res.user) {
        const userProfile: UserProfile = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: (res.user.role as UserRole) || selectedRole,
          district: res.user.district,
          organization: res.user.organization
        };
        setCurrentUser(userProfile);
        setRole(userProfile.role);
        setSuccessMessage(`Welcome back, ${userProfile.name}!`);
        
        const dest = getTargetRouteForRole(userProfile.role);
        setTimeout(() => navigate(dest, { replace: true }), 350);
      }
    } catch (err: any) {
      console.warn('Login attempt:', err);
      setErrorMessage(err.message || 'Authentication error. Please check credentials or use 1-Click Fast Login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMessage('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await signupUser({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        role: selectedRole,
        district: signupDistrict.trim(),
        organization: signupOrg.trim()
      });

      if (res && res.user) {
        const newUser: UserProfile = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: (res.user.role as UserRole) || selectedRole,
          district: res.user.district,
          organization: res.user.organization
        };
        setCurrentUser(newUser);
        setRole(newUser.role);
        setSuccessMessage(`Account created & saved to MongoDB Atlas! Welcome, ${newUser.name}.`);
        
        const dest = getTargetRouteForRole(newUser.role);
        setTimeout(() => navigate(dest, { replace: true }), 400);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account. Please try another email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Subtle Glow Background Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Standalone Authentication Container */}
      <div className="w-full max-w-lg space-y-6 relative z-10 animate-fadeIn">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-2xl shadow-cyan-500/30 mx-auto text-xl">
            ML
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              MobiLens <span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mt-0.5">
              Human-Centric Mobility Intelligence
            </p>
          </div>
          <p className="text-xs text-slate-400 italic max-w-sm mx-auto">
            "See the journey beyond the vehicle." Sign in or register to unlock features tailored to your role.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#101726] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          
          {/* Persona / Role Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Select Your Login Persona
              </span>
              <span className="text-[10px] text-cyan-400 font-normal">Controls visible features</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {/* Citizen */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('citizen');
                  setLoginEmail('citizen@mobilens.ai');
                  setLoginPassword('citizen123');
                }}
                className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  selectedRole === 'citizen'
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg ${selectedRole === 'citizen' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                    <Navigation className="w-3.5 h-3.5" />
                  </div>
                  {selectedRole === 'citizen' && <Check className="w-3 h-3 text-cyan-400" />}
                </div>
                <div className="text-[11px] font-bold text-white leading-tight">Citizen / Student</div>
                <div className="text-[9px] text-slate-400 truncate">FXEC Commuter</div>
              </button>

              {/* Transit Planner */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('planner');
                  setLoginEmail('planner@mobilens.ai');
                  setLoginPassword('planner123');
                }}
                className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  selectedRole === 'planner'
                    ? 'bg-blue-500/15 border-blue-400 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg ${selectedRole === 'planner' ? 'bg-blue-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  {selectedRole === 'planner' && <Check className="w-3 h-3 text-blue-400" />}
                </div>
                <div className="text-[11px] font-bold text-white leading-tight">City Planner</div>
                <div className="text-[9px] text-slate-400 truncate">TNSTC & Authority</div>
              </button>

              {/* Accessibility */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('accessibility');
                  setLoginEmail('access@mobilens.ai');
                  setLoginPassword('access123');
                }}
                className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  selectedRole === 'accessibility'
                    ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg ${selectedRole === 'accessibility' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                    <Accessibility className="w-3.5 h-3.5" />
                  </div>
                  {selectedRole === 'accessibility' && <Check className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className="text-[11px] font-bold text-white leading-tight">Inclusive</div>
                <div className="text-[9px] text-slate-400 truncate">Step-Free Mobility</div>
              </button>
            </div>
          </div>

          {/* Mode Switcher: Sign In vs Sign Up */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account (Sign Up)
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. citizen@mobilens.ai"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    Authenticating with Atlas...
                  </span>
                ) : (
                  <>
                    <span>Sign In to MobiLens AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Velraj"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. velraj@fxec.ac.in"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    District / City
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={signupDistrict}
                      onChange={(e) => setSignupDistrict(e.target.value)}
                      placeholder="Tirunelveli"
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Institution / Org
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={signupOrg}
                      onChange={(e) => setSignupOrg(e.target.value)}
                      placeholder="Francis Xavier Engg"
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all mt-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    Registering in MongoDB Atlas...
                  </span>
                ) : (
                  <>
                    <span>Create Account & Save to Atlas</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 1-Click Fast Login for Judges */}
          <div className="pt-4 border-t border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2.5 text-center">
              1-Click Fast Login (For Hackathon Judges):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('citizen')}
                className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all"
              >
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                <span>Student Demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemoLogin('planner')}
                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Planner Demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemoLogin('accessibility')}
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all"
              >
                <Accessibility className="w-3.5 h-3.5 text-emerald-400" />
                <span>Inclusive Demo</span>
              </button>
            </div>
          </div>

          {/* MongoDB Atlas Database Pill */}
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Database: <strong className="text-emerald-400">MongoDB Atlas ({databaseName})</strong></span>
          </div>

        </div>

        <p className="text-center text-[11px] text-slate-500">
          Features and dashboards unlock automatically upon login based on your selected persona.
        </p>

      </div>
    </div>
  );
};
