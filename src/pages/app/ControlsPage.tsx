import { useState } from 'react';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { useDevice } from '../../hooks/useDevice';
import { useAuth } from '../../hooks/useAuth';
import { sendRelayCommand } from '../../firebase/commands';

type Result = { ok: boolean; text: string } | null;

export default function ControlsPage() {
  const { telemetry, loading } = useLiveTelemetry();
  const { deviceId } = useDevice();
  const { currentUser } = useAuth();
  const [commanding, setCommanding] = useState(false);
  const [result, setResult] = useState<Result>(null);

  if (loading || !telemetry) return <div style={{ padding: '32px' }}>Loading...</div>;

  const relayClosed = telemetry.relayState;

  const handleRelayToggle = async () => {
    setCommanding(true);
    setResult(null);
    try {
      const ack = await sendRelayCommand(deviceId, relayClosed ? 'open' : 'close', currentUser?.uid);
      if (ack.status === 'done') {
        setResult({ ok: true, text: `Relay ${relayClosed ? 'OPENED (load isolated)' : 'CLOSED (load energized)'} — acknowledged by ${deviceId}.` });
      } else {
        setResult({ ok: false, text: `Command ${ack.status}: ${ack.note || 'device refused'}.` });
      }
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : 'Command failed.' });
    } finally {
      setCommanding(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Device Controls</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manual overrides and hardware state requests for <span className="mono">{deviceId}</span>.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

        {/* Master Relay Control */}
        <div style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Master Relay State</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Current physical state confirmed by ESP32:
            <strong className="mono" style={{ marginLeft: '8px', color: relayClosed ? 'var(--normal)' : 'var(--fault)' }}>
              {relayClosed ? 'CLOSED (ENERGIZED)' : 'OPEN (ISOLATED)'}
            </strong>
          </p>

          <button
            onClick={handleRelayToggle}
            disabled={commanding}
            style={{
              backgroundColor: commanding ? 'var(--surface-control)' : (relayClosed ? 'var(--fault)' : 'var(--normal)'),
              color: commanding ? 'var(--text-muted)' : '#fff',
              padding: '12px 24px',
              borderRadius: '4px',
              fontWeight: 700,
              width: '100%',
              opacity: commanding ? 0.7 : 1
            }}
          >
            {commanding ? 'SENDING TO DEVICE...' : (relayClosed ? 'OPEN RELAY (CUT LOAD)' : 'CLOSE RELAY (RESTORE LOAD)')}
          </button>

          {result && (
            <div style={{ marginTop: '16px', padding: '12px', fontSize: '0.85rem', borderRadius: '4px', backgroundColor: result.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${result.ok ? 'var(--normal)' : 'var(--fault)'}`, color: result.ok ? 'var(--normal)' : 'var(--fault)' }}>
              {result.text}
            </div>
          )}

          <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong>Note:</strong> Requests are written to Firebase, validated locally by the ESP32 for safety limits (a close request during an active fault is blocked), executed on GPIO 26, and acknowledged back here.
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
