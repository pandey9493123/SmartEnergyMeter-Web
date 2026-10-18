import { createContext } from 'react';
import type { MeterLive } from '../types/telemetry';

export interface SimulationContextValue {
  isSimulating: boolean;
  simulatedData: MeterLive;
  toggleSimulation: () => void;
  triggerOverVoltage: () => void;
  triggerUnderVoltage: () => void;
  triggerOverCurrent: () => void;
  triggerLoadSpike: () => void;
  triggerBudgetWarning: () => void;
  resetFaults: () => void;
}

export const SimulationContext =
  createContext<SimulationContextValue | null>(null);