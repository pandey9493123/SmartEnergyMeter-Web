import { get, ref } from 'firebase/database';
import { db } from './config';

export interface SlotView {
  hour: string;
  at: number;
  samples: number;
  energy: number;
  avgPower: number;
  powerMax: number;
  voltMin: number;
  voltMax: number;
  kwh: number;
}

export interface DayData {
  dayKey: string;
  label: string;
  slots: SlotView[];
  totalKwh: number;
  peakPower: number;
  voltMin: number;
  voltMax: number;
}

interface RawSlot {
  at?: number;
  samples?: number;
  energy?: number;
  avgPower?: number;
  powerMax?: number;
  voltMin?: number;
  voltMax?: number;
}

function localDayKey(offsetDaysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDaysAgo);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}${m}${day}`;
}

function dayLabel(dayKey: string): string {
  if (dayKey === 'uptime') return 'Uptime';
  const dt = new Date(+dayKey.slice(0, 4), +dayKey.slice(4, 6) - 1, +dayKey.slice(6, 8));
  if (isNaN(dt.getTime())) return dayKey;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const onlyDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const diffDays = Math.round((today.getTime() - onlyDate.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return dt.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function buildDay(
  dayKey: string,
  raw: Record<string, RawSlot>,
  carryEnergy: number | null,
): { day: DayData; lastEnergy: number } {
  const hours = Object.keys(raw).sort((a, b) => Number(a) - Number(b));
  let prev = carryEnergy;
  let peak = 0;
  let vmin = Infinity;
  let vmax = 0;
  const slots: SlotView[] = hours.map((hour) => {
    const r = raw[hour] || {};
    const energy = Number(r.energy) || 0;
    const kwh = prev == null ? 0 : Math.max(0, energy - prev);
    prev = energy;
    peak = Math.max(peak, Number(r.powerMax) || 0);
    if (Number(r.voltMin) > 0) vmin = Math.min(vmin, Number(r.voltMin));
    vmax = Math.max(vmax, Number(r.voltMax) || 0);
    return {
      hour,
      at: Number(r.at) || 0,
      samples: Number(r.samples) || 0,
      energy,
      avgPower: Number(r.avgPower) || 0,
      powerMax: Number(r.powerMax) || 0,
      voltMin: Number(r.voltMin) || 0,
      voltMax: Number(r.voltMax) || 0,
      kwh,
    };
  });
  return {
    day: {
      dayKey,
      label: dayLabel(dayKey),
      slots,
      totalKwh: slots.reduce((sum, s) => sum + s.kwh, 0),
      peakPower: peak,
      voltMin: vmin === Infinity ? 0 : vmin,
      voltMax: vmax,
    },
    lastEnergy: slots.length ? slots[slots.length - 1].energy : (carryEnergy ?? 0),
  };
}

export async function fetchRecentHistory(deviceId: string, daysToShow = 7): Promise<DayData[]> {
  const keys: string[] = [];
  for (let i = 0; i <= daysToShow; i++) keys.push(localDayKey(i)); // +1 extra for continuity
  keys.push('uptime');

  const snaps = await Promise.all(
    keys.map((k) => get(ref(db, `SmartEnergyMeter/Devices/${deviceId}/History/${k}`))),
  );
  const rawByKey = new Map<string, Record<string, RawSlot>>();
  snaps.forEach((snap, i) => {
    if (snap.exists()) rawByKey.set(keys[i], snap.val() as Record<string, RawSlot>);
  });

  // Oldest → newest so each day inherits the previous day's last energy.
  const datedAsc = keys.filter((k) => k !== 'uptime').reverse();
  let carry: number | null = null;
  const built: DayData[] = [];
  for (const key of datedAsc) {
    const raw = rawByKey.get(key);
    if (!raw) continue;
    const { day, lastEnergy } = buildDay(key, raw, carry);
    carry = lastEnergy;
    built.push(day);
  }
  built.reverse(); // today first
  const shown = built.slice(0, daysToShow);

  const upRaw = rawByKey.get('uptime');
  if (upRaw) {
    const { day } = buildDay('uptime', upRaw, null);
    if (day.slots.length) shown.push(day);
  }
  return shown;
}
