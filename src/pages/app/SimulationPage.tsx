import { useState } from 'react';
import { useSimulation } from '../../hooks/useSimulation';
import esp32Photo from '../../assets/sim/esp32.jpg';
import pzemPhoto from '../../assets/sim/pzem.jpg';
import relayPhoto from '../../assets/sim/relay.jpg';

interface LogEntry {
  id: number;
  time: string;
  label: string;
  kind: 'fault' | 'info' | 'safe';
}

const card: React.CSSProperties = {
  backgroundColor: 'var(--surface-primary)',
  padding: '24px',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--border-radius)',
};

export default function SimulationPage() {
  const {
    isSimulating,
    simulatedData,
    toggleSimulation,
    triggerOverVoltage,
    triggerUnderVoltage,
    triggerOverCurrent,
    triggerLoadSpike,
    triggerBudgetWarning,
    resetFaults,
  } = useSimulation();

  const [log, setLog] = useState<LogEntry[]>([]);

  const addLog = (label: string, kind: LogEntry['kind']) => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setLog((prev) => {
      const id = (prev.length > 0 ? prev[0].id : 0) + 1;
      return [{ id, time, label, kind }, ...prev].slice(0, 30);
    });
  };

  const run = (label: string, kind: LogEntry['kind'], fn: () => void) => () => {
    fn();
    addLog(label, kind);
  };

  const handleToggle = () => {
    toggleSimulation();
    if (!isSimulating) {
      setLog([]);
      addLog('Simulation engine enabled — telemetry is now spoofed.', 'info');
    }
  };

  const d = simulatedData;
  const relayOpen = !d.relayState;

  const scenarios: {
    label: string;
    desc: string;
    accent: string;
    action: () => void;
  }[] = [
    {
      label: 'Trigger Overvoltage',
      desc: 'Mains surge to 275.4V — relay trips, buzzer scenario.',
      accent: 'var(--fault)',
      action: run('FAULT INJECTED: overvoltage 275.4V — relay OPEN.', 'fault', triggerOverVoltage),
    },
    {
      label: 'Trigger Undervoltage',
      desc: 'Brownout sag to 165.3V — load isolated for safety.',
      accent: 'var(--fault)',
      action: run('FAULT INJECTED: undervoltage 165.3V — relay OPEN.', 'fault', triggerUnderVoltage),
    },
    {
      label: 'Trigger Overcurrent',
      desc: 'Short-circuit style 35.2A draw — instant trip.',
      accent: 'var(--fault)',
      action: run('FAULT INJECTED: overcurrent 35.2A — relay OPEN.', 'fault', triggerOverCurrent),
    },
    {
      label: 'Simulate Load Spike',
      desc: 'Motor startup 12.8A — realistic surge, no trip.',
      accent: 'var(--action)',
      action: run('EVENT: load spike 12.8A (non-fault, relay stays closed).', 'info', triggerLoadSpike),
    },
    {
      label: 'Trigger Budget Warning',
      desc: 'Bill crosses the monthly limit — warning state.',
      accent: 'var(--warning)',
      action: run('EVENT: bill exceeded budget limit — warning raised.', 'info', triggerBudgetWarning),
    },
    {
      label: 'Reset to Safe State',
      desc: 'Clear faults, close relay, resume normal readings.',
      accent: 'var(--normal)',
      action: run('System reset to safe state — relay CLOSED.', 'safe', resetFaults),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Presentation Simulation Mode</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Trigger software faults for academic demonstration without hardware risks.</p>
      </div>

      {/* Engine status */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ marginBottom: '8px' }}>Simulation Engine Status</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              When active, the entire application will display internally generated telemetry instead of Firebase data.
            </p>
          </div>
          <button
            onClick={handleToggle}
            style={{
              backgroundColor: isSimulating ? 'var(--fault)' : 'var(--action)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '4px',
              fontWeight: 700,
            }}
          >
            {isSimulating ? 'DISABLE SIMULATION' : 'ENABLE SIMULATION'}
          </button>
        </div>
      </div>

      {isSimulating && (
        <>
          {/* Live simulated readings */}
          <div style={card}>
            <h3 style={{ marginBottom: '16px' }}>Live Simulated Output</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              {[
                { label: 'VOLTAGE', value: `${d.voltage.toFixed(1)} V`, color: 'var(--action)' },
                { label: 'CURRENT', value: `${d.current.toFixed(2)} A`, color: 'var(--warning)' },
                { label: 'POWER', value: `${d.power.toFixed(0)} W`, color: 'var(--normal)' },
                { label: 'ENERGY', value: `${d.energy.toFixed(2)} kWh`, color: 'var(--text-primary)' },
                { label: 'BILL', value: `₹${d.bill.toFixed(2)}`, color: d.budgetExceeded ? 'var(--warning)' : 'var(--text-primary)' },
                { label: 'RELAY', value: relayOpen ? 'OPEN' : 'CLOSED', color: relayOpen ? 'var(--fault)' : 'var(--normal)' },
              ].map((m) => (
                <div key={m.label} style={{ backgroundColor: 'var(--surface-recessed)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>{m.label}</div>
                  <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 600, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            {d.faultActive && (
              <div className="mono" style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--fault)', borderRadius: '4px', color: 'var(--fault)', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠ {d.lastFault ?? 'FAULT ACTIVE — RELAY OPEN'}
              </div>
            )}
          </div>

          {/* Real hardware reference */}
          <div style={card}>
            <h3 style={{ marginBottom: '8px' }}>Hardware Under Simulation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              The scenarios below replicate the real behaviour of these three physical components.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <figure style={{ margin: 0, backgroundColor: 'var(--surface-recessed)', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <img src={esp32Photo} alt="ESP32 DevKit microcontroller board" style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                <figcaption style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>ESP32 DevKit</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Main controller — reads the sensor over UART, enforces safety thresholds, syncs to Firebase.
                    <span className="mono" style={{ display: 'block', marginTop: '8px', color: d.faultActive ? 'var(--fault)' : 'var(--normal)' }}>
                      {d.faultActive ? '● FAULT LATCHED' : '● RUNNING NORMALLY'}
                    </span>
                  </div>
                </figcaption>
              </figure>

              <figure style={{ margin: 0, backgroundColor: 'var(--surface-recessed)', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <img src={pzemPhoto} alt="PZEM-004T energy monitoring module with current transformer" style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                <figcaption style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>PZEM-004T + CT Clamp</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Sensing module — measures V, I, P, energy, frequency &amp; power factor via a 100A CT clamp.
                    <span className="mono" style={{ display: 'block', marginTop: '8px', color: 'var(--action)' }}>
                      ◉ REPORTING {d.voltage.toFixed(0)}V / {d.current.toFixed(1)}A
                    </span>
                  </div>
                </figcaption>
              </figure>

              <figure style={{ margin: 0, backgroundColor: 'var(--surface-recessed)', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <img src={relayPhoto} alt="5V single channel relay module" style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                <figcaption style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>5V Relay Module</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Safety switch — driven by GPIO 26, physically isolates AC mains on any fault.
                    <span className="mono" style={{ display: 'block', marginTop: '8px', color: relayOpen ? 'var(--fault)' : 'var(--normal)' }}>
                      {relayOpen ? '○ CONTACTS OPEN (ISOLATED)' : '● CONTACTS CLOSED (ENERGIZED)'}
                    </span>
                  </div>
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Fault scenarios */}
          <div style={card}>
            <h3 style={{ marginBottom: '8px' }}>Fault &amp; Event Scenarios</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Each scenario injects realistic readings across the whole dashboard — try them while watching the Overview page.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {scenarios.map((s) => (
                <button
                  key={s.label}
                  onClick={s.action}
                  style={{
                    backgroundColor: 'var(--surface-control)',
                    border: '1px solid var(--border-color)',
                    borderLeft: `4px solid ${s.accent}`,
                    padding: '16px',
                    borderRadius: '4px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '6px' }}>{s.label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Session event log */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Session Event Log</h3>
              {log.length > 0 && (
                <button
                  onClick={() => setLog([])}
                  style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}
                >
                  Clear
                </button>
              )}
            </div>
            {log.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No events yet — trigger a scenario above.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {log.map((entry) => (
                  <div
                    key={entry.id}
                    className="mono"
                    style={{
                      display: 'flex',
                      gap: '12px',
                      fontSize: '0.8rem',
                      padding: '10px 12px',
                      backgroundColor: 'var(--surface-recessed)',
                      border: '1px solid var(--border-color)',
                      borderLeft: `3px solid ${entry.kind === 'fault' ? 'var(--fault)' : entry.kind === 'safe' ? 'var(--normal)' : 'var(--action)'}`,
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{entry.time}</span>
                    <span>{entry.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
