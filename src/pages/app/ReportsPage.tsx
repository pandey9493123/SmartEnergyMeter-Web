import { useEffect, useState } from 'react';
import { useHistory } from '../../hooks/useHistory';
import { useDevice } from '../../hooks/useDevice';
import { fetchEventsOnce } from '../../firebase/events';
import { fetchBillingArchives } from '../../firebase/billing';
import type { BillingArchive } from '../../firebase/billing';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';

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

function formatBillingMonth(month: string): string {
  const normalized = month.trim();
  const match = /^(\d{4})[-/]?(\d{2})$/.exec(normalized);
  if (!match) return normalized || '—';
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return Number.isNaN(date.getTime())
    ? normalized
    : date.toLocaleDateString([], { month: 'long', year: 'numeric' });
}

function formatEnergy(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(3)} kWh`;
}

function formatBill(value: number | null): string {
  return value === null ? '—' : `₹${value.toFixed(2)}`;
}

function formatArchiveTime(value: number | null): string {
  return value === null
    ? '—'
    : new Date(value).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
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
  const { telemetry } = useLiveTelemetry();
  const [exportingEvents, setExportingEvents] = useState(false);
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [billingArchives, setBillingArchives] = useState<BillingArchive[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingDevice, setBillingDevice] = useState(deviceId);

  // Keep the displayed recorder duration current without calling Date.now()
  // during render (React treats that as an impure render-time read).
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (billingDevice !== deviceId) {
    setBillingDevice(deviceId);
    setBillingArchives([]);
    setBillingError(null);
    setBillingLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    fetchBillingArchives(deviceId)
      .then((archives) => {
        window.setTimeout(() => {
          if (cancelled) return;
          setBillingArchives(archives);
          setBillingLoading(false);
        }, 0);
      })
      .catch(() => {
        window.setTimeout(() => {
          if (cancelled) return;
          setBillingError('Monthly billing archive is unavailable.');
          setBillingLoading(false);
        }, 0);
      });
    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  const liveBilling = telemetry && (
    telemetry.billingMonth !== null ||
    telemetry.billingStartEnergy !== null ||
    telemetry.billingEnergy !== null ||
    telemetry.billingBill !== null ||
    telemetry.monthlyArchivedAt !== null
  )
    ? {
        month: telemetry.billingMonth ?? 'Current cycle',
        startEnergy: telemetry.billingStartEnergy,
        energy: telemetry.billingEnergy,
        bill: telemetry.billingBill,
        archivedAt: telemetry.monthlyArchivedAt,
      }
    : null;

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
                : `${samples.length} sample${samples.length === 1 ? '' : 's'} recorded since ${recordingSince ? new Date(recordingSince).toLocaleTimeString([], { hour12: false }) : '—'} (${recordingSince ? formatDuration(now - recordingSince) : '—'}).`}
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

      <section style={card} aria-labelledby="billing-archive-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 id="billing-archive-heading" style={{ marginBottom: '4px' }}>Monthly Billing Archive</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Archived billing-cycle snapshots from the firmware at <span className="mono">Billing/&#123;month&#125;</span>.
            </p>
          </div>
          <span className="mono" style={{ color: billingArchives.length > 0 || liveBilling ? 'var(--normal)' : 'var(--text-muted)', fontSize: '0.75rem' }}>
            {billingLoading ? 'READING...' : billingArchives.length > 0 || liveBilling ? 'ARCHIVE DATA FOUND' : 'NO ARCHIVE DATA'}
          </span>
        </div>

        {billingError && (
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '4px', backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid var(--warning)', color: 'var(--warning)', fontSize: '0.85rem' }}>
            {billingError} The live cycle fields are still shown when the device publishes them.
          </div>
        )}

        {!billingLoading && !billingError && billingArchives.length === 0 && !liveBilling && (
          <div style={{ marginTop: '16px', padding: '24px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No monthly archive has been published for this device yet.
          </div>
        )}

        {liveBilling && (
          <div style={{ marginTop: '16px', padding: '14px', border: '1px solid var(--action)', borderRadius: '4px', backgroundColor: 'rgba(59,130,246,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <strong style={{ color: 'var(--action)' }}>Latest firmware snapshot · {formatBillingMonth(liveBilling.month)}</strong>
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>LIVE TELEMETRY</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '0.85rem' }}>
              <span>Start: <strong className="mono">{formatEnergy(liveBilling.startEnergy)}</strong></span>
              <span>End: <strong className="mono">{formatEnergy(liveBilling.energy)}</strong></span>
              <span>Bill: <strong className="mono">{formatBill(liveBilling.bill)}</strong></span>
              <span>Archived: <strong>{formatArchiveTime(liveBilling.archivedAt)}</strong></span>
            </div>
          </div>
        )}

        {billingArchives.length > 0 && (
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '10px 8px' }}>MONTH</th>
                  <th style={{ padding: '10px 8px' }}>START ENERGY</th>
                  <th style={{ padding: '10px 8px' }}>ARCHIVED ENERGY</th>
                  <th style={{ padding: '10px 8px' }}>BILL</th>
                  <th style={{ padding: '10px 8px' }}>ARCHIVED AT</th>
                </tr>
              </thead>
              <tbody>
                {billingArchives.map((archive) => (
                  <tr key={`${archive.month}-${archive.archivedAt ?? 'unknown'}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 700 }}>{formatBillingMonth(archive.month)}</td>
                    <td className="mono" style={{ padding: '10px 8px' }}>{formatEnergy(archive.startEnergy)}</td>
                    <td className="mono" style={{ padding: '10px 8px' }}>{formatEnergy(archive.energy)}</td>
                    <td className="mono" style={{ padding: '10px 8px', color: 'var(--warning)' }}>{formatBill(archive.bill)}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{formatArchiveTime(archive.archivedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
