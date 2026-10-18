import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLiveTelemetry } from '../hooks/useLiveTelemetry';
import { useSimulation } from '../hooks/useSimulation';
import { HistoryContext } from './history-context';
import type { HistorySample } from './history-context';

const MAX_SAMPLES = 1000;
const MIN_INTERVAL_MS = 5000;

export function HistoryProvider({ children }: { children: ReactNode }) {
  const { telemetry, deviceId } = useLiveTelemetry();
  const { isSimulating } = useSimulation();
  const [samples, setSamples] = useState<HistorySample[]>([]);
  const [recordingSince, setRecordingSince] = useState<number | null>(null);
  const lastAtRef = useRef(0);
  const deviceRef = useRef(deviceId);

  useEffect(() => {
    if (!telemetry || telemetry.receivedAt == null) return;

    const capturedAt = Date.now();
    const sample: HistorySample = {
      at: telemetry.deviceUpdatedAt ?? telemetry.receivedAt ?? capturedAt,
      voltage: telemetry.voltage,
      current: telemetry.current,
      power: telemetry.power,
      energy: telemetry.energy,
      frequency: telemetry.frequency,
      powerFactor: telemetry.powerFactor,
      tariff: telemetry.tariff,
      bill: telemetry.bill,
      relayClosed: telemetry.relayState,
      faultActive: telemetry.faultActive,
      source: isSimulating ? 'simulation' : 'live',
      deviceId,
    };

    // Deferred so recording never triggers cascading renders
    // (same pattern as the live monitor stream).
    const timer = window.setTimeout(() => {
      if (deviceRef.current !== deviceId) {
        deviceRef.current = deviceId;
        lastAtRef.current = 0;
        setSamples([]);
        setRecordingSince(null);
      }
      if (capturedAt - lastAtRef.current < MIN_INTERVAL_MS) return;
      lastAtRef.current = capturedAt;
      setSamples((prev) => [...prev.slice(-(MAX_SAMPLES - 1)), sample]);
      setRecordingSince((prev) => prev ?? capturedAt);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [telemetry, deviceId, isSimulating]);

  const clear = useCallback(() => {
    lastAtRef.current = 0;
    setSamples([]);
    setRecordingSince(null);
  }, []);

  const value = useMemo(
    () => ({ samples, recordingSince, deviceId, clear }),
    [samples, recordingSince, deviceId, clear],
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}
