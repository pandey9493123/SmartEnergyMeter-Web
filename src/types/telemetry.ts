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

  /** Protection thresholds reported by firmware. */
  thrVoltMax?: number;
  thrVoltMin?: number;
  thrCurrMax?: number;

  /**
   * Firmware integrity signals. These are deliberately normalized by the
   * live telemetry mapper so older firmware simply reports an inactive state.
   */
  anomalyActive: boolean;
  anomalyReason: string | null;
  tamperActive: boolean;
  tamperReason: string | null;

  /**
   * The latest monthly billing cycle snapshot written by firmware. A null
   * value means this firmware has not published that part of the schema yet.
   */
  billingMonth: string | null;
  billingStartEnergy: number | null;
  billingEnergy: number | null;
  billingConsumedEnergy?: number | null;
  billingBill: number | null;
  billingTariff?: number | null;
  billingCycleStartAt?: number | null;
  monthlyArchivedAt: number | null;
}
