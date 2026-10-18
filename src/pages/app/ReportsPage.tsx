import { useState } from 'react';
import { useHistory } from '../../hooks/useHistory';
import { useDevice } from '../../hooks/useDevice';
import { fetchEventsOnce } from '../../firebase/events';

function download(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number | boolean): string {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

const card: React.CSSProperties = {
  backgroundColor: 'var(--surface-primary)',
  padding: '24px',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--border-radius)',
};

const primaryBtn: React.CSSProperties = {
  backgroundColor: 'var(--action)', color: '#fff', padding: '10px 16px',
  borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem',
};

const ghostBtn: React.CSSProperties = {
  backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)',
  color: 'var(--text-primary)', padding: '10px 16px', borderRadius: '4px',
  fontWeight: 700, fontSize: '0.85rem',
};

export default function ReportsPage() {
  const { samples, recordingSince, clear } = useHistory();
  const { deviceId } = useDevice();
  const [exportingEvents, setExportingEvents] = useState(false);
  const [message, setMessage] = useState('');

  const handleExportHistory = () => {
    if (samples.length === 0) return;
    const header = 'Timestamp,Device,Source,Voltage(V),Current(A),Power(W),Energy(kWh),Frequency(Hz),PowerFactor,Tariff(INR/kWh),Bill(INR),RelayClosed,FaultActive';
    const rows = samples.map((s) =>
      [
        new Date(s.at).toISOString(),
        s.deviceId,
        s.source,
        s.voltage.toFixed(2),
        s.current.toFixed(2),
        s.power.toFixed(1),
        s.energy.toFixed(3),
        s.frequency.toFixed(2),
        s.powerFactor.toFixed(3),
        s.tariff.toFixed(2),
        s.bill.toFixed(2),
        s.relayClosed ? 'YES' : 'NO',
        s.faultActive ? 'YES' : 'NO',
      ].map(csvCell).join(','),
    );
    download(`SEM_History_${deviceId}_${Date.now()}.csv`, [header, ...rows].join('\n'), 'text/csv');
    setMessage(`Exported ${samples.length} samples to CSV.`);
  };

  const handleExportEvents = async () => {
    setExportingEvents(true);
    setMessage('');
    try {
      const events = await fetchEventsOnce(deviceId);
      if (events.length === 0) {
        setMessage('No events recorded yet — nothing to export.');
        return;
      }
      const header = 'Timestamp,Device,EventType,Source,Details';
      const rows = events.map((e) =>
        [
          e.at ? new Date(e.at).toISOString() : '',
          e.deviceId,
          e.type,
          e.source,
          e.details || '',
        ].map(csvCell).join(','),
      );
      download(`SEM_Events_${deviceId}_${Date.now()}.csv`, [header, ...rows].join('\n'), 'text/csv');
      setMessage(`Exported ${events.length} events to CSV.`);
    } catch {
      setMessage('Event export failed. Check your connection.');
    } finally {
      setExportingEvents(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Data Export & Reports</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Generate billing statements and CSV telemetry logs for <span className="mono">{deviceId}</span>.</p>
      </div>

      {/* Session recording status */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ marginBottom: '4px' }}>Session Recorder</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {samples.length === 0
                ? 'Waiting for telemetry... samples record automatically every ~5 seconds while the app is open.'
                : `${samples.length} sample${samples.length === 1 ? '' : 's'} recorded since ${recordingSince ? new Date(recordingSince).toLocaleTimeString([], { hour12: false }) : '—'} (${recordingSince ? formatDuration(Date.now() - recordingSince) : '—'}).`}
            </p>
          </div>
          {samples.length > 0 && (
            <button onClick={clear} style={{ ...ghostBtn, color: 'var(--fault)' }}>CLEAR HISTORY</button>
          )}
        </div>
        {message && (
          <div style={{ marginTop: '16px', padding: '10px 12px', fontSize: '0.85rem', borderRadius: '4px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid var(--normal)', color: 'var(--normal)' }}>
            {message}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div style={card}>
          <h3 style={{ marginBottom: '16px' }}>Session History (CSV)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Downloads every recorded sample of this session — timestamps, V/I/P, energy, tariff, bill, relay and fault flags. Best for Excel analysis and college report graphs.
          </p>
          <button onClick={handleExportHistory} disabled={samples.length === 0} style={{ ...primaryBtn, opacity: samples.length === 0 ? 0.5 : 1 }}>
            DOWNLOAD CSV ({samples.length} ROWS)
          </button>
        </div>

        <div style={card}>
          <h3 style={{ marginBottom: '16px' }}>Event Log (CSV)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Downloads the timestamped event history from Firebase — fault trips, relay actions, budget alerts and device online/offline transitions.
          </p>
          <button onClick={handleExportEvents} disabled={exportingEvents} style={{ ...primaryBtn, opacity: exportingEvents ? 0.6 : 1 }}>
            {exportingEvents ? 'FETCHING...' : 'DOWNLOAD EVENTS CSV'}
          </button>
        </div>

        <div style={card}>
          <h3 style={{ marginBottom: '16px' }}>Billing Statement (PDF)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Generates a printable monthly report summarizing total energy consumption and final billing parameters.
          </p>
          <button onClick={handleExportPDF} style={ghostBtn}>GENERATE PDF</button>
        </div>
      </div>
    </div>
  );
}
