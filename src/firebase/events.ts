import { get, limitToLast, onValue, orderByChild, push, query, ref, remove, serverTimestamp } from 'firebase/database';
import { db } from './config';

export type EventType =
  | 'FAULT_TRIPPED'
  | 'FAULT_CLEARED'
  | 'RELAY_OPENED'
  | 'RELAY_CLOSED'
  | 'BUDGET_EXCEEDED'
  | 'BUDGET_OK'
  | 'DEVICE_ONLINE'
  | 'DEVICE_OFFLINE';

export interface LogEventItem {
  key: string;
  type: EventType;
  details: string;
  deviceId: string;
  source: 'live' | 'simulation';
  at: number;
}

function eventsRef(deviceId: string) {
  return ref(db, `SmartEnergyMeter/Devices/${deviceId}/Events`);
}

export async function logEvent(
  deviceId: string,
  type: EventType,
  details: string,
  source: 'live' | 'simulation',
): Promise<void> {
  await push(eventsRef(deviceId), { type, details, deviceId, source, at: serverTimestamp() });
}

export function subscribeEvents(deviceId: string, cb: (items: LogEventItem[]) => void): () => void {
  const q = query(eventsRef(deviceId), orderByChild('at'), limitToLast(50));
  return onValue(q, (snapshot) => {
    const items: LogEventItem[] = [];
    snapshot.forEach((child) => {
      const value = child.val() as Omit<LogEventItem, 'key'>;
      items.push({ ...value, key: child.key ?? '' });
    });
    cb(items.reverse()); // newest first
  });
}

export async function fetchEventsOnce(deviceId: string): Promise<LogEventItem[]> {
  const q = query(eventsRef(deviceId), orderByChild('at'), limitToLast(200));
  const snapshot = await get(q);
  const items: LogEventItem[] = [];
  snapshot.forEach((child) => {
    const value = child.val() as Omit<LogEventItem, 'key'>;
    items.push({ ...value, key: child.key ?? '' });
  });
  return items.reverse(); // newest first
}

export async function clearEvents(deviceId: string): Promise<void> {
  await remove(eventsRef(deviceId));
}
