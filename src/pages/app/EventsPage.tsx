import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';

export default function EventsPage() {
  const { telemetry, loading } = useLiveTelemetry();

  if (loading || !telemetry) return <div style={{ padding: '32px' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>System Event Log</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Chronological history of faults and configuration changes.</p>
      </div>

      <div style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--surface-control)', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <tr>
              <th style={{ padding: '12px 16px' }}>TIMESTAMP</th>
              <th style={{ padding: '12px 16px' }}>EVENT TYPE</th>
              <th style={{ padding: '12px 16px' }}>DETAILS</th>
            </tr>
          </thead>
          <tbody className="mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {/* Show current fault if active, otherwise show empty state until firmware array is built */}
            {telemetry.faultActive ? (
              <tr style={{ backgroundColor: 'rgba(150, 59, 52, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 16px' }}>{new Date().toLocaleString()}</td>
                <td style={{ padding: '12px 16px', color: 'var(--fault)', fontWeight: 600 }}>SAFETY FAULT TRIPPED</td>
                <td style={{ padding: '12px 16px' }}>{telemetry.lastFault}</td>
              </tr>
            ) : (
              <tr>
                <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No historical events recorded in current session.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}