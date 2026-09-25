import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { useSimulation } from '../../hooks/useSimulation';
import { useDevice } from '../../hooks/useDevice';
import ThemeToggle from './ThemeToggle';
import './AppLayout.css';

export default function AppLayout() {
  const navigate = useNavigate();
  const { isOnline, dataAgeMs, deviceExists, error } = useLiveTelemetry();
  const { isSimulating } = useSimulation();
  const { deviceId, knownDevices, setDeviceId, addDevice } = useDevice();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');

  const showOfflineBanner = !isOnline && !isSimulating;
  const dataAgeSec = dataAgeMs === null ? null : Math.floor(dataAgeMs / 1000);

  const handleSignOut = () => {
    signOut(auth);
    navigate('/login');
  };

  const closeMoreMenu = () => setIsMoreMenuOpen(false);

  const handleDeviceChange = (value: string) => {
    if (value === '__add__') {
      setIsAddingDevice(true);
      return;
    }
    void setDeviceId(value);
  };

  const handleAddDevice = () => {
    const clean = newDeviceId.trim();
    if (!clean) return;
    addDevice(clean);
    void setDeviceId(clean);
    setNewDeviceId('');
    setIsAddingDevice(false);
  };

  const statusColor = isSimulating
    ? 'var(--warning)'
    : isOnline
      ? 'var(--normal)'
      : 'var(--fault)';
  const statusLabel = isSimulating
    ? 'SIMULATION'
    : isOnline
      ? 'ONLINE'
      : 'OFFLINE';

  return (
    <div className="app-shell">
      {/* DESKTOP SIDEBAR */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.5rem', color: 'var(--text-primary)' }}>SEM SYSTEM</div>

          {/* Device switcher — bound to Firebase paths */}
          {!isAddingDevice ? (
            <select
              className="meter-selector"
              value={deviceId}
              onChange={(e) => handleDeviceChange(e.target.value)}
              aria-label="Select device"
              style={{ marginTop: '12px' }}
            >
              {knownDevices.map((d) => (
                <option key={d} value={d}>
                  {d}{d === deviceId ? ' (Active)' : ''}
                </option>
              ))}
              <option value="__add__">+ Add device…</option>
            </select>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input
                className="meter-selector"
                value={newDeviceId}
                onChange={(e) => setNewDeviceId(e.target.value)}
                placeholder="e.g. device002"
                aria-label="New device ID"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddDevice();
                  if (e.key === 'Escape') setIsAddingDevice(false);
                }}
              />
              <button
                onClick={handleAddDevice}
                style={{ backgroundColor: 'var(--action)', color: '#fff', borderRadius: '4px', padding: '0 12px', fontWeight: 700 }}
              >
                ✓
              </button>
              <button
                onClick={() => setIsAddingDevice(false)}
                style={{ color: 'var(--text-secondary)', fontWeight: 700, padding: '0 4px' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Live device status pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor }}></span>
            <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: statusColor }}>
              {deviceId} · {statusLabel}
            </span>
          </div>
          {dataAgeSec !== null && !isSimulating && (
            <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              last update {dataAgeSec}s ago
            </div>
          )}
          {!deviceExists && !isSimulating && (
            <div style={{ fontSize: '0.7rem', color: 'var(--fault)', marginTop: '4px' }}>
              No data at this device path.
            </div>
          )}
        </div>

        <nav className="app-nav">
          <div className="nav-section-title">Telemetry</div>
          <NavLink to="/app" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Overview</NavLink>
          <NavLink to="/app/monitor" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Live Monitor</NavLink>
          <NavLink to="/app/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Analytics</NavLink>
          <NavLink to="/app/energy" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Energy & Billing</NavLink>

          <div className="nav-section-title">System & Logs</div>
          <NavLink to="/app/protection" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Protection</NavLink>
          <NavLink to="/app/controls" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Device Controls</NavLink>
          <NavLink to="/app/events" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Event Log</NavLink>
          <NavLink to="/app/diagnostics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Diagnostics</NavLink>
          <NavLink to="/app/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Reports & Export</NavLink>

          <div className="nav-section-title">Presentation</div>
          <NavLink to="/app/simulation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ color: 'var(--warning)' }}>Simulation Panel</NavLink>
        </nav>

        {/* Sidebar Footer: User Profile Block */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-control)', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <NavLink to="/app/profile" className="nav-item" style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: 'none' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--action)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
              {auth.currentUser?.displayName?.charAt(0).toUpperCase() || auth.currentUser?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {auth.currentUser?.displayName || 'User Account'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {auth.currentUser?.email}
              </div>
            </div>
          </NavLink>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 8px' }}>
            <NavLink to="/" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>← Public Home Site</NavLink>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Theme</span>
              <ThemeToggle />
            </div>
            <button onClick={handleSignOut} style={{ padding: '4px 0', textAlign: 'left', color: 'var(--fault)', fontWeight: 600, fontSize: '0.85rem' }}>SIGN OUT</button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="app-main">
        {showOfflineBanner && (
          <div style={{ backgroundColor: 'var(--fault)', color: '#fff', padding: '10px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, zIndex: 50 }}>
            {error || `WARNING: ${deviceId.toUpperCase()} OFFLINE — NO DATA FOR ${dataAgeSec ?? '—'}s`}
          </div>
        )}
        {isSimulating && (
          <div style={{ backgroundColor: 'var(--warning)', color: '#000', padding: '10px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, zIndex: 50 }}>
            SIMULATION MODE ACTIVE — DATA IS SPOOFED
          </div>
        )}

        {/* Mobile device bar */}
        <div className="mobile-device-bar" style={{ display: 'none' }}>
          <select
            className="meter-selector"
            value={deviceId}
            onChange={(e) => handleDeviceChange(e.target.value)}
            aria-label="Select device"
          >
            {knownDevices.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
            <option value="__add__">+ Add device…</option>
          </select>
          <span className="mono" style={{ fontSize: '0.7rem', fontWeight: 700, color: statusColor }}>
            ● {statusLabel}
          </span>
        </div>
        <style>{`@media (max-width: 767px) { .mobile-device-bar { display: flex !important; gap: 12px; align-items: center; padding: 10px 16px; background-color: var(--surface-primary); border-bottom: 1px solid var(--border-color); } .mobile-device-bar .meter-selector { flex: 1; margin-top: 0 !important; } }`}</style>

        <div style={{ opacity: showOfflineBanner ? 0.75 : 1, transition: 'opacity 0.3s', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="app-bottom-nav" style={{ position: 'relative' }}>

        {isMoreMenuOpen && (
          <div className="mobile-more-sheet">
            <div className="nav-section-title">System & Logs</div>
            <NavLink to="/app/controls" onClick={closeMoreMenu} className="more-sheet-item">Device Controls</NavLink>
            <NavLink to="/app/analytics" onClick={closeMoreMenu} className="more-sheet-item">Analytics</NavLink>
            <NavLink to="/app/events" onClick={closeMoreMenu} className="more-sheet-item">Event Log</NavLink>
            <NavLink to="/app/diagnostics" onClick={closeMoreMenu} className="more-sheet-item">Diagnostics</NavLink>
            <NavLink to="/app/reports" onClick={closeMoreMenu} className="more-sheet-item">Reports & Export</NavLink>
            <NavLink to="/app/simulation" onClick={closeMoreMenu} className="more-sheet-item" style={{ color: 'var(--warning)' }}>Simulation Panel</NavLink>

            <div className="nav-section-title">Account</div>
            <NavLink to="/" onClick={closeMoreMenu} className="more-sheet-item">← Public Home Site</NavLink>
            <div className="more-sheet-item" style={{ justifyContent: 'space-between' }}>
              <span>Theme</span> <ThemeToggle />
            </div>
            <button onClick={handleSignOut} className="more-sheet-item" style={{ color: 'var(--fault)', borderBottom: 'none' }}>Sign Out</button>
          </div>
        )}

        <NavLink to="/app" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={closeMoreMenu}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Overview
        </NavLink>
        <NavLink to="/app/monitor" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={closeMoreMenu}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          Monitor
        </NavLink>
        <NavLink to="/app/protection" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={closeMoreMenu}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Protect
        </NavLink>

        <button className={`bottom-nav-btn ${isMoreMenuOpen ? 'active' : ''}`} onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          More
        </button>
      </nav>
    </div>
  );
}
