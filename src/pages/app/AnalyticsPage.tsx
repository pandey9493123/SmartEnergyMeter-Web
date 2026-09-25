export default function AnalyticsPage() {
  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Historical Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Hourly and Daily consumption profiles.</p>
      </div>

      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--surface-primary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--border-radius)', color: 'var(--text-secondary)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Historical Data Aggregation Pending</h3>
        <p>The current ESP32 firmware writes instantaneous data to the Live path. Once the CloudModule firmware is updated to aggregate hourly history, Time-of-Use and Peak Power charts will populate here.</p>
      </div>
    </div>
  );
}