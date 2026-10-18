import { useEffect, useMemo, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useDevice } from '../../hooks/useDevice';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { fetchRecentHistory } from '../../firebase/history';
import type { DayData } from '../../firebase/history';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
);

const card: React.CSSProperties = {
  backgroundColor: 'var(--surface-primary)',
  padding: '20px',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--border-radius)',
};

const tickStyle = {
  font: { family: 'IBM Plex Mono', size: 10 as const },
  color: '#8b96a8',
};

export default function AnalyticsPage() {
  const { deviceId } = useDevice();
  const { telemetry } = useLiveTelemetry();
  const [days, setDays] = useState<DayData[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [watched, setWatched] = useState(deviceId);

  if (watched !== deviceId) {
    setWatched(deviceId);
    setDays([]);
    setSelectedKey(null);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    fetchRecentHistory(deviceId, 7)
      .then((list) => {
        window.setTimeout(() => {
          if (cancelled) return;
          setDays(list);
          setSelectedKey((prev) => prev ?? list[0]?.dayKey ?? null);
          setLoading(false);
        }, 0);
      })
      .catch(() => {
        window.setTimeout(() => {
          if (!cancelled) setLoading(false);
        }, 0);
      });
    return () => {
      cancelled = true;
    };
  }, [deviceId, refreshTick]);

  const selected = useMemo(
    () => days.find((d) => d.dayKey === selectedKey) ?? days[0] ?? null,
    [days, selectedKey],
  );

  const labels = useMemo(() => {
    if (!selected) return [];
    return selected.slots.map((s) =>
      selected.dayKey === 'uptime' ? `+${s.hour}h` : `${s.hour}:00`,
    );
  }, [selected]);

  const tariff = telemetry?.tariff ?? 0;
  const estCost = selected ? selected.totalKwh * tariff : 0;

  if (loading) {
    return <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Loading history...</div>;
  }

  if (!selected) {
    return (
      <div style={{ padding: '24px 32px' }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Historical Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Hourly and Daily consumption profiles for <span className="mono">{deviceId}</span>.</p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--surface-primary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--border-radius)', color: 'var(--text-secondary)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No history yet</h3>
          <p>Hourly slots appear here once the ESP32 runs the firmware with history logging. Upload the updated sketch and leave the device online — the first bar shows within seconds, and the chart fills as hours pass.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Historical Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Hourly and Daily consumption profiles for <span className="mono">{deviceId}</span>.</p>
        </div>
        <button
          onClick={() => { setLoading(true); setRefreshTick((t) => t + 1); }}
          style={{ backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}
        >
          REFRESH
        </button>
      </div>

      {/* Day selector */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {days.map((d) => (
          <button
            key={d.dayKey}
            onClick={() => setSelectedKey(d.dayKey)}
            style={{
              padding: '8px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap',
              backgroundColor: d.dayKey === selected.dayKey ? 'var(--action)' : 'var(--surface-control)',
              color: d.dayKey === selected.dayKey ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        {[
          { label: 'TOTAL ENERGY', value: `${selected.totalKwh.toFixed(2)} kWh`, color: 'var(--action)' },
          { label: 'EST. COST', value: tariff > 0 ? `₹${estCost.toFixed(2)}` : '—', color: 'var(--warning)' },
          { label: 'PEAK POWER', value: `${selected.peakPower.toFixed(0)} W`, color: 'var(--normal)' },
          { label: 'VOLTAGE RANGE', value: selected.voltMin > 0 ? `${selected.voltMin.toFixed(0)}–${selected.voltMax.toFixed(0)} V` : '—', color: 'var(--text-primary)' },
        ].map((kpi) => (
          <div key={kpi.label} style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px', marginBottom: '6px' }}>{kpi.label}</div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div style={{ ...card, height: '320px', display: 'flex', flexDirection: 'column' }}>
          <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>ENERGY PER HOUR (kWh)</div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <Bar
              data={{
                labels,
                datasets: [{
                  label: 'kWh',
                  data: selected.slots.map((s) => +s.kwh.toFixed(3)),
                  backgroundColor: '#3b82f6',
                  borderRadius: 3,
                }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.parsed.y} kWh` } } },
                scales: { x: { ticks: tickStyle, grid: { color: 'rgba(128,128,128,0.12)' } }, y: { beginAtZero: true, ticks: tickStyle, grid: { color: 'rgba(128,128,128,0.12)' } } },
              }}
            />
          </div>
        </div>

        <div style={{ ...card, height: '320px', display: 'flex', flexDirection: 'column' }}>
          <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>AVERAGE POWER PER HOUR (W)</div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <Line
              data={{
                labels,
                datasets: [{
                  label: 'Avg W',
                  data: selected.slots.map((s) => +s.avgPower.toFixed(1)),
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16,185,129,0.12)',
                  fill: true,
                  tension: 0.35,
                  pointRadius: 2,
                }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.parsed.y} W` } } },
                scales: { x: { ticks: tickStyle, grid: { color: 'rgba(128,128,128,0.12)' } }, y: { beginAtZero: true, ticks: tickStyle, grid: { color: 'rgba(128,128,128,0.12)' } } },
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        {selected.slots.length} hourly slot{selected.slots.length === 1 ? '' : 's'} · logged by {deviceId} · cost uses live tariff ₹{tariff.toFixed(2)}
      </div>
    </div>
  );
}
