import { onValue, ref, serverTimestamp, set } from 'firebase/database';
import { db } from './config';

export type AckStatus = 'done' | 'blocked' | 'error';

export interface CommandAck {
  id: string;
  status: AckStatus;
  note?: string;
  at?: number;
}

function cmdRef(deviceId: string, node: string) {
  return ref(db, `SmartEnergyMeter/Devices/${deviceId}/Commands/${node}`);
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Write a command, then wait for the ESP32 acknowledgement with matching id. */
async function sendAndWaitAck(
  deviceId: string,
  node: string,
  payload: Record<string, unknown>,
  timeoutMs = 12000,
): Promise<CommandAck> {
  const id = newId();
  await set(cmdRef(deviceId, node), { ...payload, id, at: serverTimestamp() });

  return new Promise<CommandAck>((resolve, reject) => {
    const ackRef = cmdRef(deviceId, `${node}Ack`);
    let settled = false;

    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      unsub();
      reject(new Error('Device did not acknowledge. Is the ESP32 online?'));
    }, timeoutMs);

    const unsub = onValue(
      ackRef,
      (snapshot) => {
        const value = snapshot.val() as CommandAck | null;
        if (value && value.id === id && !settled) {
          settled = true;
          window.clearTimeout(timer);
          unsub();
          resolve(value);
        }
      },
      () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        reject(new Error('Permission denied. Check Firebase rules.'));
      },
    );
  });
}

export function sendRelayCommand(deviceId: string, action: 'open' | 'close', uid?: string) {
  return sendAndWaitAck(deviceId, 'relay', { action, by: uid ?? 'web' });
}

export function sendConfigCommand(deviceId: string, tariff: number, budgetLimit: number, uid?: string) {
  return sendAndWaitAck(deviceId, 'config', { tariff, budgetLimit, by: uid ?? 'web' });
}

export function sendFaultReset(deviceId: string, uid?: string) {
  return sendAndWaitAck(deviceId, 'faultReset', { by: uid ?? 'web' });
}

export function sendEnergyReset(deviceId: string, uid?: string) {
  return sendAndWaitAck(deviceId, 'energyReset', { by: uid ?? 'web' }, 15000);
}

export function sendThresholdsCommand(deviceId: string, voltMax: number, voltMin: number, currMax: number, uid?: string) {
  return sendAndWaitAck(deviceId, 'thresholds', { voltMax, voltMin, currMax, by: uid ?? 'web' });
}
