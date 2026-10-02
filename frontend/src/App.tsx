import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { MainLayout } from './layouts/MainLayout';
import { OverviewPage } from './pages/OverviewPage';
import { MyJourneyPage } from './pages/MyJourneyPage';
import { JourneyAnalyzerPage } from './pages/JourneyAnalyzerPage';
import { MobilityFrictionMapPage } from './pages/MobilityFrictionMapPage';
import { CityIntelligencePage } from './pages/CityIntelligencePage';
import { AIInterventionsPage } from './pages/AIInterventionsPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { CitizenSafeRoutesPage } from './pages/CitizenSafeRoutesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { AboutPitchPage } from './pages/AboutPitchPage';
import { LiveJourneyPage } from './pages/LiveJourneyPage';
import { MobilityRiskMapPage } from './pages/MobilityRiskMapPage';
import { CitizenReportsPage } from './pages/CitizenReportsPage';
import { JourneyHistoryPage } from './pages/JourneyHistoryPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Guard: If not logged in, force redirect to /login
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, role } = useApp();

  // Role-based default destination after login
  const getDefaultRoute = () => {
    if (role === 'planner') return '/city-intelligence';
    if (role === 'accessibility') return '/accessibility';
    return '/my-journey';
  };

  return (
    <Routes>
      {/* Standalone Login & Signup Screen (NO sidebar, NO navbar, NO other options) */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />
        } 
      />

      {/* Authenticated Dashboard Layout: Accessible ONLY after login */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={getDefaultRoute()} replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="dashboard" element={<Navigate to="/overview" replace />} />
        <Route path="my-journey" element={<MyJourneyPage />} />
        <Route path="live-journey" element={<LiveJourneyPage />} />
        <Route path="analyzer" element={<JourneyAnalyzerPage />} />
        <Route path="journey-analyzer" element={<Navigate to="/analyzer" replace />} />
        <Route path="map" element={<MobilityFrictionMapPage />} />
        <Route path="friction-map" element={<Navigate to="/map" replace />} />
        <Route path="risk-map" element={<MobilityRiskMapPage />} />
        <Route path="city-intelligence" element={<CityIntelligencePage />} />
        <Route path="interventions" element={<AIInterventionsPage />} />
        <Route path="simulator" element={<WhatIfSimulatorPage />} />
        <Route path="what-if" element={<Navigate to="/simulator" replace />} />
        <Route path="accessibility" element={<AccessibilityPage />} />
        <Route path="citizen-reports" element={<CitizenReportsPage />} />
        <Route path="routes" element={<CitizenSafeRoutesPage />} />
        <Route path="journey-history" element={<JourneyHistoryPage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="about" element={<AboutPitchPage />} />
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Route>

      {/* Catch-all redirect to /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};


export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
