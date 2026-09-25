import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db } from '../firebase/config';
import type { MeterLive } from '../types/telemetry';
import { useSimulation } from './useSimulation';
import { useDevice } from './useDevice';

/** After this long without a device write, the device is OFFLINE. */
export const ONLINE_THRESHOLD_MS = 30_000;

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'on' || s === 'closed') return true;
    if (s === 'false' || s === '0' || s === 'off' || s === 'open') return false;
  }
  return Boolean(v);
}

/** Firmware may write any of these timestamp keys (epoch ms or seconds). */
function extractDeviceTimestamp(raw: Record<string, unknown>): number | null {
  const candidates = [
    raw.updatedAt,
    raw.timestamp,
    raw.lastUpdate,
    raw.lastSeen,
    raw.serverTime,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (!Number.isFinite(n) || n <= 0) continue;
    // Heuristic: seconds (10 digits) vs ms (13 digits).
    if (n < 1e12) return Math.floor(n * 1000);
    return Math.floor(n);
  }
  return null;
}

function mapRaw(
  raw: Record<string, unknown>,
  deviceId: string,
  sourcePath: string,
): MeterLive {
  return {
    voltage: toNumber(raw.voltage),
    current: toNumber(raw.current),
    power: toNumber(raw.power),
    energy: toNumber(raw.energy),
    frequency: toNumber(raw.frequency),
    powerFactor: toNumber(raw.powerFactor),
    tariff: toNumber(raw.tariff),
    bill: toNumber(raw.bill),
    budgetLimit: toNumber(raw.budgetLimit),
    budgetExceeded: toBool(raw.budgetExceeded),
    // Support both new (relayState) and legacy (relay) hardware keys.
    relayState:
      raw.relayState !== undefined ? toBool(raw.relayState) : toBool(raw.relay),
    // Support both new (faultActive) and legacy (fault) keys.
    faultActive:
      raw.faultActive !== undefined ? toBool(raw.faultActive) : toBool(raw.fault),
    lastFault:
      raw.lastFault !== undefined && raw.lastFault !== null
        ? String(raw.lastFault)
        : null,
    receivedAt: Date.now(),
    deviceUpdatedAt: extractDeviceTimestamp(raw),
    deviceId,
    sourcePath,
  };
}

export interface TelemetryState {
  telemetry: MeterLive | null;
  loading: boolean;
  error: string | null;
  /** Active device id being subscribed. */
  deviceId: string;
  /** True when the device has written recently (real online status). */
  isOnline: boolean;
  /** ms since the last device write (device clock when available). */
  dataAgeMs: number | null;
  /** True when the device path exists in Firebase. */
  deviceExists: boolean;
}

export function useLiveTelemetry(): TelemetryState {
  const { deviceId } = useDevice();
  const [realTelemetry, setRealTelemetry] = useState<MeterLive | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceExists, setDeviceExists] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const { isSimulating, simulatedData } = useSimulation();

  // Tick so online/offline flips in real time even without new packets.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Reset per-device state during render (React-endorsed pattern for
  // adjusting to prop/context changes without cascading effects).
  const [subscribedDevice, setSubscribedDevice] = useState(deviceId);
  if (subscribedDevice !== deviceId) {
    setSubscribedDevice(deviceId);
    setLoading(true);
    setError(null);
    setRealTelemetry(null);
    setDeviceExists(false);
  }

  useEffect(() => {
    const primaryPath = `SmartEnergyMeter/Devices/${deviceId}/Live`;
    const legacyPath = 'SmartEnergyMeter/Live';

    const primaryRef = ref(db, primaryPath);
    let legacyUnsub: (() => void) | null = null;
    let settledWithPrimary = false;

    const subscribeLegacy = () => {
      const legacyRef = ref(db, legacyPath);
      legacyUnsub = onValue(
        legacyRef,
        (snapshot) => {
          try {
            if (!snapshot.exists()) {
              setRealTelemetry(null);
              setDeviceExists(false);
              setError(
                `Device "${deviceId}" has no data. Check the device ID or power on the hardware.`,
              );
              setLoading(false);
              return;
            }
            const mapped = mapRaw(
              snapshot.val() as Record<string, unknown>,
              deviceId,
              legacyPath,
            );
            setRealTelemetry(mapped);
            setDeviceExists(true);
            setError(null);
          } catch {
            setError('Unable to parse incoming telemetry data.');
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError(
            'Permission denied or Firebase Realtime Database is unavailable.',
          );
          setLoading(false);
        },
      );
    };

    const primaryUnsub = onValue(
      primaryRef,
      (snapshot) => {
        try {
          if (!snapshot.exists()) {
            // Fall back to legacy flat path (old firmware writes here).
            subscribeLegacy();
            return;
          }
          settledWithPrimary = true;
          const mapped = mapRaw(
            snapshot.val() as Record<string, unknown>,
            deviceId,
            primaryPath,
          );
          setRealTelemetry(mapped);
          setDeviceExists(true);
          setError(null);
        } catch {
          setError('Unable to parse incoming telemetry data.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        // On permission error for the device path, still try legacy once.
        if (!settledWithPrimary) subscribeLegacy();
        else {
          setError(
            'Permission denied or Firebase Realtime Database is unavailable.',
          );
          setLoading(false);
        }
      },
    );

    return () => {
      primaryUnsub();
      if (legacyUnsub) legacyUnsub();
    };
  }, [deviceId]);

  const derived = useMemo(() => {
    if (!realTelemetry) {
      return { isOnline: false, dataAgeMs: null as number | null };
    }
    // Prefer the device clock (true online status). Fall back to the
    // browser receipt clock for legacy firmware without timestamps.
    const anchor =
      realTelemetry.deviceUpdatedAt ?? realTelemetry.receivedAt ?? null;
    if (anchor === null) return { isOnline: false, dataAgeMs: null };
    const age = Math.max(0, now - anchor);
    return { isOnline: age < ONLINE_THRESHOLD_MS, dataAgeMs: age };
  }, [realTelemetry, now]);

  if (isSimulating) {
    return {
      telemetry: { ...simulatedData, deviceId, sourcePath: 'simulation' },
      loading: false,
      error: null,
      deviceId,
      isOnline: true,
      dataAgeMs: 0,
      deviceExists: true,
    };
  }

  return {
    telemetry: realTelemetry,
    loading,
    error,
    deviceId,
    isOnline: derived.isOnline,
    dataAgeMs: derived.dataAgeMs,
    deviceExists,
  };
}
