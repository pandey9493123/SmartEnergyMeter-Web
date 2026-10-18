import { useEffect, useState } from 'react';
import { useDevice } from '../../hooks/useDevice';
import { clearEvents, subscribeEvents } from '../../firebase/events';
import type { LogEventItem } from '../../firebase/events';

const TYPE_STYLE: Record<string, { label: string; color: string }> = {
  FAULT_TRIPPED: { label: 'FAULT TRIPPED', color: 'var(--fault)' },
  FAULT_CLEARED: { label: 'FAULT CLEARED', color: 'var(--normal)' },
  RELAY_OPENED: { label: 'RELAY OPENED', color: 'var(--warning)' },
  RELAY_CLOSED: { label: 'RELAY CLOSED', color: 'var(--normal)' },
  BUDGET_EXCEEDED: { label: 'BUDGET EXCEEDED', color: 'var(--warning)' },
  BUDGET_OK: { label: 'BUDGET OK', color: 'var(--normal)' },
  DEVICE_ONLINE: { label: 'DEVICE ONLINE', color: 'var(--normal)' },
  DEVICE_OFFLINE: { label: 'DEVICE OFFLINE', color: 'var(--fault)' },
};

function formatTime(ms: number): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleString([], {
    hour12: false,
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function EventsPage() {
  const { deviceId } = useDevice();
  const [events, setEvents] = useState<LogEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [watchedDevice, setWatchedDevice] = useState(deviceId);

  if (watchedDevice !== deviceId) {
    setWatchedDevice(deviceId);
    setEvents([]);
    setLoading(true);
  }

  useEffect(() => {
    return subscribeEvents(deviceId, (items) => {
      setEvents(items);
      setLoading(false);
    });
  }, [deviceId]);

  const handleClear = async () => {
    if (!window.confirm(`Delete all logged events for ${deviceId}?`)) return;
    setClearing(true);
    try {
      await clearEvents(deviceId);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>System Event Log</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Chronological history of faults and configuration changes for <span className="mono">{deviceId}</span>.
          </p>
        </div>
        {events.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            style={{ backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--fault)', padding: '8px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}
          >
            {clearing ? 'CLEARING...' : 'CLEAR LOG'}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Loading event history...</div>
      ) : (
        <div style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '560px' }}>
            <thead style={{ backgroundColor: 'var(--surface-control)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>TIMESTAMP</th>
                <th style={{ padding: '12px 16px' }}>EVENT TYPE</th>
                <th style={{ padding: '12px 16px' }}>SOURCE</th>
                <th style={{ padding: '12px 16px' }}>DETAILS</th>
              </tr>
            </thead>
            <tbody className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No events recorded yet. Faults, relay actions and budget alerts will appear here automatically.
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const style = TYPE_STYLE[event.type] ?? { label: event.type, color: 'var(--text-primary)' };
                  return (
                    <tr key={event.key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{formatTime(event.at)}</td>
                      <td style={{ padding: '12px 16px', color: style.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{style.label}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: event.source === 'simulation' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)', color: event.source === 'simulation' ? 'var(--warning)' : 'var(--action)' }}>
                          {event.source === 'simulation' ? 'SIM' : 'LIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{event.details}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {events.length > 0 && (
            <div style={{ padding: '10px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
              Showing last {events.length} event{events.length === 1 ? '' : 's'} · newest first
            </div>
          )}
        </div>
      )}
    </div>
  );
}
