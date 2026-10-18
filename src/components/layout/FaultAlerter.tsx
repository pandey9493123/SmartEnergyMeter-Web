import { useEffect, useRef } from 'react';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { useSimulation } from '../../hooks/useSimulation';
import { useNotifications } from '../../hooks/useNotifications';

export default function FaultAlerter() {
  const { telemetry, deviceId } = useLiveTelemetry();
  const { isSimulating } = useSimulation();
  const { notify } = useNotifications();
  const prevRef = useRef<{ fault: boolean; budget: boolean; online: boolean } | null>(null);
  const deviceRef = useRef(deviceId);

  useEffect(() => {
    if (!telemetry || telemetry.receivedAt == null) return;

    const fault = telemetry.faultActive;
    const budget = telemetry.budgetExceeded;
    const online = telemetry.isOnline;
    const faultName = telemetry.lastFault && telemetry.lastFault !== 'NONE' ? telemetry.lastFault : 'FAULT';
    const source = isSimulating ? 'simulation' : 'live';

    // Deferred so alerts never trigger cascading renders.
    const timer = window.setTimeout(() => {
      if (deviceRef.current !== deviceId) {
        deviceRef.current = deviceId;
        prevRef.current = null;
      }
      const prev = prevRef.current;
      if (!prev) {
        prevRef.current = { fault, budget, online };
        if (fault) notify('FAULT ACTIVE', `${faultName} on ${deviceId} (${source}). Relay is open.`, 'critical');
        else if (!online) notify('Device offline', `${deviceId} is not reporting (${source}).`, 'warning');
        return;
      }
      if (fault && !prev.fault) {
        notify('FAULT TRIPPED', `${faultName} on ${deviceId} (${source}). Relay opened automatically.`, 'critical');
      } else if (!fault && prev.fault) {
        notify('Fault cleared', `${deviceId} is back to normal (${source}).`, 'info');
      }
      if (budget && !prev.budget) {
        notify('Budget exceeded', `Energy crossed the budget limit on ${deviceId} (${source}).`, 'warning');
      } else if (!budget && prev.budget) {
        notify('Budget OK', `Consumption is back under budget on ${deviceId}.`, 'info');
      }
      if (!online && prev.online) {
        notify('Device offline', `${deviceId} stopped reporting (${source}).`, 'warning');
      } else if (online && !prev.online) {
        notify('Device online', `${deviceId} is reporting again (${source}).`, 'info');
      }
      prevRef.current = { fault, budget, online };
    }, 0);

    return () => window.clearTimeout(timer);
  }, [telemetry, deviceId, isSimulating, notify]);

  return null;
}
