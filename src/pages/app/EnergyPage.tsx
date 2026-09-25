import { useState } from 'react';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { InstrumentPanel, InstrumentScreen } from '../../components/instruments/InstrumentPanel';
import { ProgressBar } from '../../components/ui/ProgressBar';

export default function EnergyPage() {
  const { telemetry, loading } = useLiveTelemetry();
  const [syncing, setSyncing] = useState(false);

  if (loading || !telemetry) return <div style={{ padding: '32px' }}>Loading...</div>;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setSyncing(true);
    // Simulating cloud command queue delay (Hardware implementation later)
    setTimeout(() => setSyncing(false), 1500); 
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
              <input type="number" step="0.1" defaultValue={telemetry.tariff} className="mono" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Monthly Budget Limit (₹)</label>
              <input type="number" defaultValue={telemetry.budgetLimit} className="mono" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }} />
            </div>

            <button type="submit" disabled={syncing} style={{ backgroundColor: 'var(--action)', color: '#fff', padding: '12px', borderRadius: '4px', fontWeight: 600, marginTop: '8px', opacity: syncing ? 0.7 : 1 }}>
              {syncing ? 'SYNCING TO ESP32...' : 'UPDATE DEVICE PREFERENCES'}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Updates require network connectivity to sync with hardware.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}