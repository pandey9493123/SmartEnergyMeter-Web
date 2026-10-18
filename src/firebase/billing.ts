import { get, ref } from 'firebase/database';
import { db } from './config';

/** A normalized monthly record suitable for tables and exports. */
export interface BillingArchive {
  month: string;
  startEnergy: number | null;
  energy: number | null;
  bill: number | null;
  archivedAt: number | null;
}

interface RawBillingRecord {
  billingMonth?: unknown;
  month?: unknown;
  billingStartEnergy?: unknown;
  startEnergy?: unknown;
  billingEnergy?: unknown;
  energy?: unknown;
  billingBill?: unknown;
  bill?: unknown;
  monthlyArchivedAt?: unknown;
  archivedAt?: unknown;
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function optionalTimestamp(value: unknown): number | null {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) return null;
  return numberValue < 1e12
    ? Math.floor(numberValue * 1000)
    : Math.floor(numberValue);
}

function optionalText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function isBillingRecord(value: Record<string, unknown>): boolean {
  return [
    'billingMonth',
    'month',
    'billingStartEnergy',
    'startEnergy',
    'billingEnergy',
    'energy',
    'billingBill',
    'bill',
    'monthlyArchivedAt',
    'archivedAt',
  ].some((key) => key in value);
}

function parseRecord(key: string, value: unknown): BillingArchive | null {
  const raw = asObject(value) as RawBillingRecord | null;
  if (!raw) return null;

  const month = optionalText(raw.billingMonth ?? raw.month) ?? key;
  const startEnergy = optionalNumber(
    raw.billingStartEnergy ?? raw.startEnergy,
  );
  const energy = optionalNumber(raw.billingEnergy ?? raw.energy);
  const bill = optionalNumber(raw.billingBill ?? raw.bill);
  const archivedAt = optionalTimestamp(
    raw.monthlyArchivedAt ?? raw.archivedAt,
  );

  // Ignore unrelated metadata beneath the Billing node while retaining a
  // month-keyed record even when one of its numeric values is zero.
  if (
    key === 'current' &&
    month === key &&
    startEnergy === null &&
    energy === null &&
    bill === null &&
    archivedAt === null
  ) {
    return null;
  }

  return { month, startEnergy, energy, bill, archivedAt };
}

/**
 * Read monthly records written by firmware at
 * SmartEnergyMeter/Devices/{deviceId}/Billing.
 *
 * The reader accepts both the current field names (billingEnergy, etc.) and
 * concise month-record aliases, which keeps it compatible with firmware that
 * stores the same archive under a month key.
 */
export async function fetchBillingArchives(
  deviceId: string,
  limit = 12,
): Promise<BillingArchive[]> {
  const snapshot = await get(
    ref(db, `SmartEnergyMeter/Devices/${deviceId}/Billing`),
  );
  if (!snapshot.exists()) return [];

  const value = asObject(snapshot.val());
  if (!value) return [];

  const records = isBillingRecord(value)
    ? [['current', value] as const]
    : Object.entries(value);

  return records
    .map(([key, record]) => parseRecord(key, record))
    .filter((record): record is BillingArchive => record !== null)
    .sort((left, right) => {
      const rightTime = right.archivedAt ?? 0;
      const leftTime = left.archivedAt ?? 0;
      if (rightTime !== leftTime) return rightTime - leftTime;
      return right.month.localeCompare(left.month);
    })
    .slice(0, Math.max(1, limit));
}
