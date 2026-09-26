import { createContext } from 'react';

export interface HistorySample {
  at: number;
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency: number;
  powerFactor: number;
  tariff: number;
  bill: number;
  relayClosed: boolean;
  faultActive: boolean;
  source: 'live' | 'simulation';
  deviceId: string;
}

export interface HistoryContextValue {
  samples: HistorySample[];
  recordingSince: number | null;
  deviceId: string;
  clear: () => void;
}

export const HistoryContext = createContext<HistoryContextValue | null>(null);
