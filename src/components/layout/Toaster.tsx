import { useNotifications } from '../../hooks/useNotifications';
import type { AlertSeverity } from '../../contexts/notification-context';

const border: Record<AlertSeverity, string> = {
  critical: 'var(--fault)',
  warning: 'var(--warning)',
  info: 'var(--action)',
};

export default function Toaster() {
  const { alerts, dismiss, permission, requestPermission, notify } = useNotifications();

  const handleBell = async () => {
    if (permission === 'default') {
      const result = await requestPermission();
      if (result === 'granted') {
        notify('Browser alerts ON', 'You will get OS notifications for faults even when this tab is hidden.', 'info');
      } else {
        notify('Browser alerts blocked', 'Enable notifications in the browser site settings to get OS alerts.', 'warning');
      }
    } else {
      notify(
        'Test alert',
        `Notification system OK. OS alerts ${permission === 'granted' ? 'enabled' : 'disabled'}.`,
        'info',
      );
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', top: '72px', right: '16px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: 'min(360px, calc(100vw - 32px))' }}>
        {alerts.map((a) => (
          <div
            key={a.id}
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: `1px solid ${border[a.severity]}`,
              borderLeft: `5px solid ${border[a.severity]}`,
              borderRadius: '8px',
              padding: '12px 14px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: border[a.severity] }}>{a.title}</div>
              <button
                onClick={() => dismiss(a.id)}
                style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0 2px' }}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{a.body}</div>
            <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {new Date(a.at).toLocaleTimeString([], { hour12: false })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleBell}
        title={permission === 'granted' ? 'Alerts enabled — click to test' : 'Enable browser notifications'}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
          width: '48px', height: '48px', borderRadius: '50%',
          backgroundColor: 'var(--action)', color: '#fff', fontSize: '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
        }}
      >
        🔔
        {permission === 'default' && (
          <span style={{ position: 'absolute', top: '8px', right: '10px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--fault)', border: '2px solid #fff' }} />
        )}
      </button>
    </>
  );
}
