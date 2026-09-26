import { useRef, useState } from 'react';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { useDevice } from '../../hooks/useDevice';
import { useAuth } from '../../hooks/useAuth';
import { sendConfigCommand, sendEnergyReset } from '../../firebase/commands';
import { InstrumentPanel, InstrumentScreen } from '../../components/instruments/InstrumentPanel';
import { ProgressBar } from '../../components/ui/ProgressBar';

type Result = { ok: boolean; text: string } | null;

export default function EnergyPage() {
  const { telemetry, loading } = useLiveTelemetry();
  const { deviceId } = useDevice();
  const { currentUser } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const tariffRef = useRef<HTMLInputElement>(null);
  const budgetRef = useRef<HTMLInputElement>(null);

  if (loading || !telemetry) return <div style={{ padding: '32px' }}>Loading...</div>;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const tariff = Number(tariffRef.current?.value);
    const budget = Number(budgetRef.current?.value);
    if (!Number.isFinite(tariff) || tariff <= 0 || tariff > 100) {
      setResult({ ok: false, text: 'Enter a valid tariff between 0 and 100.' });
      return;
    }
    if (!Number.isFinite(budget) || budget <= 0) {
      setResult({ ok: false, text: 'Enter a valid budget limit.' });
      return;
    }
    setSyncing(true);
    setResult(null);
    try {
      const ack = await sendConfigCommand(deviceId, tariff, budget, currentUser?.uid);
      if (ack.status === 'done') {
        setResult({ ok: true, text: `Device updated: tariff ₹${tariff}/kWh, budget ₹${budget}. Bill will recalculate on the next reading.` });
      } else {
        setResult({ ok: false, text: `Device refused: ${ack.note || 'invalid values'}.` });
      }
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : 'Sync failed.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleEnergyReset = async () => {
    if (!window.confirm(`Reset the cumulative energy counter to 0 on ${deviceId}? This clears the hardware counter in the PZEM module.`)) return;
    setResetting(true);
    setResult(null);
    try {
      const ack = await sendEnergyReset(deviceId, currentUser?.uid);
      if (ack.status === 'done') {
        setResult({ ok: true, text: 'Energy counter reset to 0 on hardware. Bill recalculated.' });
      } else {
        setResult({ ok: false, text: `Reset failed: ${ack.note || 'device error'}.` });
      }
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : 'Reset failed.' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Energy & Billing</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Financial analytics and Time-of-Use configuration.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>

        {/* Analytics Panel */}
        <InstrumentPanel title="Current Cycle Analytics">
          <InstrumentScreen label="Total Cumulative Energy" value={telemetry.energy.toFixed(2)} unit="kWh" />
          <InstrumentScreen label="Active Tariff" value={`₹${telemetry.tariff.toFixed(2)}`} unit="/ kWh" />
          <InstrumentScreen
            label="Current Bill"
            value={`₹${telemetry.bill.toFixed(2)}`}
            valueColor={telemetry.budgetExceeded ? 'var(--warning)' : 'var(--text-primary)'}
          />
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
            <ProgressBar
              current={telemetry.bill}
              max={telemetry.budgetLimit}
              label={`Budget Usage (Limit: ₹${telemetry.budgetLimit})`}
            />
          </div>
        </InstrumentPanel>

        {/* Configuration Panel */}
        <div style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Financial Configuration</h3>

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Standard Tariff (₹/kWh)</label>
              <input ref={tariffRef} type="number" step="0.01" min="0" defaultValue={telemetry.tariff} className="mono" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Monthly Budget Limit (₹)</label>
              <input ref={budgetRef} type="number" step="1" min="0" defaultValue={telemetry.budgetLimit} className="mono" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }} />
            </div>

            <button type="submit" disabled={syncing} style={{ backgroundColor: 'var(--action)', color: '#fff', padding: '12px', borderRadius: '4px', fontWeight: 600, marginTop: '8px', opacity: syncing ? 0.7 : 1 }}>
              {syncing ? 'WAITING FOR DEVICE...' : 'UPDATE DEVICE PREFERENCES'}
            </button>
          </form>

          {result && (
            <div style={{ marginTop: '16px', padding: '12px', fontSize: '0.85rem', borderRadius: '4px', backgroundColor: result.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${result.ok ? 'var(--normal)' : 'var(--fault)'}`, color: result.ok ? 'var(--normal)' : 'var(--fault)' }}>
              {result.text}
            </div>
          )}

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
            <button onClick={handleEnergyReset} disabled={resetting} style={{ width: '100%', padding: '12px', borderRadius: '4px', fontWeight: 700, backgroundColor: 'transparent', border: '1px solid var(--fault)', color: 'var(--fault)', opacity: resetting ? 0.7 : 1 }}>
              {resetting ? 'RESETTING HARDWARE...' : 'RESET ENERGY COUNTER TO 0'}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
              Clears the cumulative kWh counter inside the PZEM module on {deviceId}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
