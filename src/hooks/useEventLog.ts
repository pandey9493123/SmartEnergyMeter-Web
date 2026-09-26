import { useEffect, useRef } from 'react';
import { useLiveTelemetry } from './useLiveTelemetry';
import { useSimulation } from './useSimulation';
import { logEvent } from '../firebase/events';
import type { EventType } from '../firebase/events';

interface WatchedState {
  faultActive: boolean;
  relayState: boolean;
  budgetExceeded: boolean;
  isOnline: boolean;
  lastFault: string | null;
}

/**
 * Watches telemetry transitions and persists them as timestamped
 * events in Firebase. Mount once (see EventLogger) — renders nothing.
 */
export function useEventLog(): void {
  const { telemetry, loading, isOnline, deviceId } = useLiveTelemetry();
  const { isSimulating } = useSimulation();
  const prevRef = useRef<{ deviceId: string; state: WatchedState } | null>(null);

  useEffect(() => {
    if (loading || !telemetry) return;

    const source = isSimulating ? 'simulation' : 'live';
    const curr: WatchedState = {
      faultActive: telemetry.faultActive,
      relayState: telemetry.relayState,
      budgetExceeded: telemetry.budgetExceeded,
      isOnline,
      lastFault: telemetry.lastFault,
    };

    const prev = prevRef.current;
    if (!prev || prev.deviceId !== deviceId) {
      // First sight of this device: set baseline, don't backfill history.
      prevRef.current = { deviceId, state: curr };
      return;
    }

    const fire = (type: EventType, details: string) => {
      logEvent(deviceId, type, details, source).catch(() => {
        /* offline — skip this entry */
      });
    };

    if (!prev.state.faultActive && curr.faultActive) {
      fire('FAULT_TRIPPED', curr.lastFault || 'Safety fault tripped.');
    }
    if (prev.state.faultActive && !curr.faultActive) {
      fire('FAULT_CLEARED', 'Fault cleared. System safe.');
    }
    if (prev.state.relayState && !curr.relayState) {
      fire('RELAY_OPENED', 'Relay opened — load isolated.');
    }
    if (!prev.state.relayState && curr.relayState) {
      fire('RELAY_CLOSED', 'Relay closed — load energized.');
    }
    if (!prev.state.budgetExceeded && curr.budgetExceeded) {
      fire('BUDGET_EXCEEDED', 'Bill crossed the budget limit.');
    }
    if (prev.state.budgetExceeded && !curr.budgetExceeded) {
      fire('BUDGET_OK', 'Bill back under budget.');
    }
    if (!prev.state.isOnline && curr.isOnline) {
      fire('DEVICE_ONLINE', `${deviceId} came online.`);
    }
    if (prev.state.isOnline && !curr.isOnline) {
      fire('DEVICE_OFFLINE', `${deviceId} went offline (no data).`);
    }

    prevRef.current = { deviceId, state: curr };
  }, [telemetry, loading, isOnline, deviceId, isSimulating]);
}
