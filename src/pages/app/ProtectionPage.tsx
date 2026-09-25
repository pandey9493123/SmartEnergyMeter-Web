import { useState } from 'react';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';

export default function ProtectionPage() {
  const { telemetry, loading } = useLiveTelemetry();
  const [resetting, setResetting] = useState(false);

  if (loading || !telemetry) return <div style={{ padding: '32px' }}>Loading...</div>;

  const handleReset = () => {
    setResetting(true);
    setTimeout(() => setResetting(false), 2000);
  };

  const isFaulted = telemetry.faultActive;

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Hardware Protection</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Local ESP32 safety thresholds and fault diagnostics.</p>
      </div>

      {/* Active Fault Status */}
      <div style={{
        backgroundColor: isFaulted ? 'rgba(150, 59, 52, 0.1)' : 'rgba(57, 116, 84, 0.1)',
        border: `1px solid ${isFaulted ? 'var(--fault)' : 'var(--normal)'}`,
        borderRadius: 'var(--border-radius)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h2 style={{ fontSize: '1.1rem', color: isFaulted ? 'var(--fault)' : 'var(--normal)' }}>
          {isFaulted ? 'FAULT LATCHED: PHYSICAL RELAY OPEN' : 'SYSTEM SAFE: NO FAULTS DETECTED'}
        </h2>
        
        {isFaulted && (
          <>
            <p className="mono" style={{ color: 'var(--text-primary)' }}>REASON: {telemetry.lastFault}</p>
            <div style={{ padding: '16px', backgroundColor: 'var(--surface-recessed)', borderLeft: '4px solid var(--warning)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              WARNING: Resetting a fault while hazardous conditions persist may cause immediate re-tripping or hardware damage. Verify electrical safety before proceeding.
            </div>
            <button onClick={handleReset} disabled={resetting} style={{ backgroundColor: 'var(--fault)', color: '#fff', padding: '12px 24px', borderRadius: '4px', fontWeight: 700, width: 'fit-content' }}>
              {resetting ? 'ISSUING RESET COMMAND...' : 'REMOTE FAULT RESET'}
            </button>
          </>
        )}
      </div>

      {/* Threshold Configuration */}
      <div style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '24px', color: 'var(--text-primary)' }}>ESP32 Local Protection Thresholds</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Max Voltage (V)</label>
            <input type="number" defaultValue="265" disabled className="mono" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Min Voltage (V)</label>
            <input type="number" defaultValue="170" disabled className="mono" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Max Current (A)</label>
            <input type="number" defaultValue="30" disabled className="mono" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }} />
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px' }}>
          * Hardware threshold overrides require standard ESP32 Command Queue architecture (Pending Firmware Update).
        </p>
      </div>
    </div>
  );
}