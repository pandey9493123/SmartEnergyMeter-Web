import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SimulationProvider } from './contexts/SimulationContext';
import { DeviceProvider } from './contexts/DeviceContext';
import PublicHeader from './components/layout/PublicHeader';
import PublicFooter from './components/layout/PublicFooter';
import HomePage from './pages/public/HomePage';
import TeamPage from './pages/public/TeamPage';
import DocsPage from './pages/public/DocsPage';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import OverviewPage from './pages/app/OverviewPage';
import LiveMonitorPage from './pages/app/LiveMonitorPage';
import EnergyPage from './pages/app/EnergyPage';
import ProtectionPage from './pages/app/ProtectionPage';
import ControlsPage from './pages/app/ControlsPage';
import DiagnosticsPage from './pages/app/DiagnosticsPage';
import ReportsPage from './pages/app/ReportsPage';
import EventsPage from './pages/app/EventsPage';
import AnalyticsPage from './pages/app/AnalyticsPage';
import SimulationPage from './pages/app/SimulationPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import NotFoundPage from './pages/public/NotFoundPage';
import ProfilePage from './pages/app/ProfilePage';

function PublicLayout() {
  return (
    <>
      <PublicHeader />
      <Outlet />
      <PublicFooter />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <DeviceProvider>
      <SimulationProvider>
        <BrowserRouter>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Routes>
                           {/* PUBLIC ROUTES */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/app/profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* PROTECTED AUTHENTICATED ROUTES (APP SHELL) */}
              <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<OverviewPage />} />
                <Route path="monitor" element={<LiveMonitorPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="energy" element={<EnergyPage />} />
                <Route path="protection" element={<ProtectionPage />} />
                <Route path="controls" element={<ControlsPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="diagnostics" element={<DiagnosticsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="simulation" element={<SimulationPage />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </SimulationProvider>
      </DeviceProvider>
    </AuthProvider>
  );
}

export default App;