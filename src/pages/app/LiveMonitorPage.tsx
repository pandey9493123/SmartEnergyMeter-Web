import { useEffect, useState } from 'react';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { RealTimeChart } from '../../components/instruments/RealTimeChart';

const MAX_DATAPOINTS = 20;

interface StreamData {
  receivedAt: number;
  voltage: number;
  current: number;
  power: number;
}

export default function LiveMonitorPage() {
  const { telemetry, loading, error } = useLiveTelemetry();
  const [stream, setStream] = useState<StreamData[]>([]);

  /*
   * Firebase telemetry is an external data source.
   *
   * The update is queued asynchronously instead of calling setStream
   * synchronously inside the effect. This satisfies the current React
   * Hooks ESLint rule: react-hooks/set-state-in-effect.
   */
  useEffect(() => {
    if (!telemetry?.receivedAt) {
      return;
    }

    const sample: StreamData = {
      receivedAt: telemetry.receivedAt,
      voltage: telemetry.voltage,
      current: telemetry.current,
      power: telemetry.power,
    };

    const updateId = window.setTimeout(() => {
      setStream((previousStream) => {
        const lastSample = previousStream[previousStream.length - 1];

        /*
         * Prevent duplicate points when React re-renders without a new
         * Firebase or simulation reading.
         */
        if (lastSample?.receivedAt === sample.receivedAt) {
          return previousStream;
        }

        const updatedStream = [...previousStream, sample];

        if (updatedStream.length > MAX_DATAPOINTS) {
          return updatedStream.slice(-MAX_DATAPOINTS);
        }

        return updatedStream;
      });
    }, 0);

    return () => {
      window.clearTimeout(updateId);
    };
  }, [telemetry]);

  if (loading && stream.length === 0) {
    return (
      <div className="page-container">
        <p style={{ color: 'var(--text-secondary)' }}>
          Initializing telemetry stream...
        </p>
      </div>
    );
  }

  if (error && stream.length === 0) {
    return (
      <div className="page-container">
        <div
          style={{
            color: 'var(--fault)',
            border: '1px solid var(--fault)',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            padding: '16px',
            borderRadius: 'var(--border-radius)',
          }}
        >
          Unable to load the telemetry stream.
        </div>
      </div>
    );
  }

  const labels = stream.map((sample) =>
    new Date(sample.receivedAt).toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  );

  const voltageData = stream.map((sample) => sample.voltage);
  const currentData = stream.map((sample) => sample.current);
  const powerData = stream.map((sample) => sample.power);

  const voltage = telemetry?.voltage ?? 0;
  const current = telemetry?.current ?? 0;
  const power = telemetry?.power ?? 0;

  const currentChartMaximum = Math.max(10, Math.ceil(current + 2));

  return (
    <div className="page-container">
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 4vw, 2rem)',
            marginBottom: '4px',
          }}
        >
          Live Monitor
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '0.85rem',
          }}
        >
          REAL-TIME OSCILLOSCOPE STREAM
        </p>
      </header>

      {/* Current digital readings */}
      <section
        className="responsive-grid"
        aria-label="Current electrical readings"
      >
        <div
          style={{
            backgroundColor: 'var(--surface-recessed)',
            padding: '16px',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.5)',
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              letterSpacing: '2px',
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            RMS VOLTAGE
          </div>

          <div
            className="tech-number"
            style={{
              fontSize: 'clamp(2rem, 9vw, 2.5rem)',
              color: 'var(--action)',
              textShadow: 'var(--neon-glow-action)',
              maxWidth: '100%',
              overflowWrap: 'anywhere',
            }}
          >
            {voltage.toFixed(1)}{' '}
            <span
              style={{
                fontSize: '1rem',
                color: 'var(--text-muted)',
              }}
            >
              V
            </span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface-recessed)',
            padding: '16px',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.5)',
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              letterSpacing: '2px',
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            RMS CURRENT
          </div>

          <div
            className="tech-number"
            style={{
              fontSize: 'clamp(2rem, 9vw, 2.5rem)',
              color: 'var(--warning)',
              textShadow: 'var(--neon-glow-warning)',
              maxWidth: '100%',
              overflowWrap: 'anywhere',
            }}
          >
            {current.toFixed(2)}{' '}
            <span
              style={{
                fontSize: '1rem',
                color: 'var(--text-muted)',
              }}
            >
              A
            </span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface-recessed)',
            padding: '16px',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.5)',
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              letterSpacing: '2px',
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            ACTIVE POWER
          </div>

          <div
            className="tech-number"
            style={{
              fontSize: 'clamp(2rem, 9vw, 2.5rem)',
              color: 'var(--normal)',
              textShadow: 'var(--neon-glow-normal)',
              maxWidth: '100%',
              overflowWrap: 'anywhere',
            }}
          >
            {power.toFixed(0)}{' '}
            <span
              style={{
                fontSize: '1rem',
                color: 'var(--text-muted)',
              }}
            >
              W
            </span>
          </div>
        </div>
      </section>

      {/* Telemetry charts */}
      <section
        className="responsive-grid-large"
        aria-label="Real-time telemetry charts"
      >
        <RealTimeChart
          title="Voltage"
          labels={labels}
          dataStream={voltageData}
          lineColor="#3b82f6"
          backgroundColor="rgba(59, 130, 246, 0.1)"
          yMin={0}
          yMax={300}
          unit="V"
        />

        <RealTimeChart
          title="Current"
          labels={labels}
          dataStream={currentData}
          lineColor="#f59e0b"
          backgroundColor="rgba(245, 158, 11, 0.1)"
          yMin={0}
          yMax={currentChartMaximum}
          unit="A"
        />

        <RealTimeChart
          title="Power"
          labels={labels}
          dataStream={powerData}
          lineColor="#10b981"
          backgroundColor="rgba(16, 185, 129, 0.1)"
          yMin={0}
          unit="W"
        />
      </section>
    </div>
  );
}