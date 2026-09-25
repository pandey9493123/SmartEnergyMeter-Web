export interface MeterLive {
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency: number;
  powerFactor: number;

  // Financial
  tariff: number;
  bill: number;
  budgetLimit: number;
  budgetExceeded: boolean;

  // Hardware State
  relayState: boolean;
  faultActive: boolean;
  lastFault: string | null;

  // Diagnostics (Browser-side timestamp)
  receivedAt: number | null;

  /**
   * Device-side timestamp in epoch ms, when firmware provides one.
   * Firmware should write ServerValue.TIMESTAMP to `updatedAt`
   * on every Live push. Null when firmware is older.
   */
  deviceUpdatedAt?: number | null;

  /** Which device this reading came from + which RTDB path served it. */
  deviceId?: string;
  sourcePath?: string;
}
