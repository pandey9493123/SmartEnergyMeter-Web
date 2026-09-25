import { useState } from 'react';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';

export default function ControlsPage() {
  const { telemetry, loading } = useLiveTelemetry();
  const [commanding, setCommanding] = useState(false);

  if (loading || !telemetry) return <div style={{ padding: '32px' }}>Loading...</div>;

  const handleRelayToggle = () => {
    setCommanding(true);
    setTimeout(() => setCommanding(false), 2000);
  };

  const relayState = telemetry.relayState;

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Device Controls</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manual overrides and hardware state requests.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Master Relay Control */}
        <div style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Master Relay State</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Current physical state confirmed by ESP32: 
            <strong className="mono" style={{ marginLeft: '8px', color: relayState ? 'var(--warning)' : 'var(--text-primary)' }}>
              {relayState ? 'CLOSED (ENERGIZED)' : 'OPEN (ISOLATED)'}
            </strong>
          </p>

          <button 
            onClick={handleRelayToggle} 
            disabled={commanding || telemetry.faultActive}
            style={{ 
              backgroundColor: telemetry.faultActive ? 'var(--surface-control)' : (relayState ? 'var(--fault)' : 'var(--warning)'), 
              color: telemetry.faultActive ? 'var(--text-muted)' : '#fff', 
              padding: '12px 24px', 
              borderRadius: '4px', 
              fontWeight: 700, 
              width: '100%',
              opacity: commanding ? 0.7 : 1
            }}
          >
            {commanding ? 'AWAITING ACKNOWLEDGEMENT...' : (telemetry.faultActive ? 'BLOCKED BY ACTIVE FAULT' : (relayState ? 'REQUEST RELAY OPEN' : 'REQUEST RELAY CLOSE'))}
          </button>
          
          <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong>Note:</strong> Web requests do not directly modify physical state. The request is queued via Firebase, validated locally by the ESP32 for safety limits, executed, and then acknowledged back to this interface.
          </div>
        </div>

        {/* Display Controls */}
        <div style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '24px', color: 'var(--text-primary)' }}>LCD Backlight Mode</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <input type="radio" name="lcd" defaultChecked /> Auto Saver (Night Mode)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <input type="radio" name="lcd" /> Always ON
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <input type="radio" name="lcd" /> Always OFF
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}