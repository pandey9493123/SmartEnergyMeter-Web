import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { InstrumentPanel, InstrumentScreen } from '../../components/instruments/InstrumentPanel';

export default function DiagnosticsPage() {
  const { telemetry, loading, isOnline, dataAgeMs, deviceId, deviceExists } = useLiveTelemetry();

  if (loading || !telemetry) return <div style={{ padding: '32px' }}>Loading...</div>;

  const dataAge = dataAgeMs === null ? null : Math.floor(dataAgeMs / 1000);
  const hasDeviceClock = telemetry.deviceUpdatedAt != null;

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Device Diagnostics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Hardware heartbeat and network health for <span className="mono">{deviceId}</span>.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <InstrumentPanel
          title="Connection Health"
          statusText={isOnline ? 'ONLINE' : 'STALE / OFFLINE'}
          statusColor={isOnline ? 'var(--normal)' : 'var(--fault)'}
        >
          <InstrumentScreen
            label="Device Path Exists"
            value={deviceExists ? 'YES' : 'NO'}
            valueColor={deviceExists ? 'var(--text-primary)' : 'var(--fault)'}
          />
          <InstrumentScreen
            label="Last Sync Age"
            value={dataAge === null ? '--' : String(dataAge)}
            unit="seconds ago"
            valueColor={isOnline ? 'var(--text-primary)' : 'var(--fault)'}
          />
          <InstrumentScreen
            label="Clock Source"
            value={hasDeviceClock ? 'DEVICE TIMESTAMP' : 'BROWSER RECEIPT (LEGACY FW)'}
            valueColor={hasDeviceClock ? 'var(--normal)' : 'var(--warning)'}
          />
          <InstrumentScreen label="Sync Frequency" value="~10" unit="seconds (Configured)" />
          {telemetry.sourcePath && (
            <InstrumentScreen label="Source Path" value={telemetry.sourcePath} valueColor="var(--text-muted)" />
          )}
        </InstrumentPanel>

        <InstrumentPanel title="Hardware Telemetry (Pending Firmware Update)">
          <InstrumentScreen label="Wi-Fi RSSI" value="--" unit="dBm" valueColor="var(--text-muted)" />
          <InstrumentScreen label="Local IP" value="--.--.--.--" valueColor="var(--text-muted)" />
          <InstrumentScreen label="System Uptime" value="--" unit="hrs" valueColor="var(--text-muted)" />
        </InstrumentPanel>
      </div>

      {!hasDeviceClock && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--warning)', borderRadius: 'var(--border-radius)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--warning)' }}>Firmware tip: </strong>
          for true online/offline detection, update the ESP32 to write <span className="mono">updatedAt = ServerValue.TIMESTAMP</span> on
          every <span className="mono">SmartEnergyMeter/Devices/{deviceId}/Live</span> push.
          Until then, staleness is measured from browser receipt time.
        </div>
      )}
    </div>
  );
}
