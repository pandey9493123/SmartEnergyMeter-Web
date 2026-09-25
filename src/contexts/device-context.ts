import { createContext } from 'react';

export interface DeviceContextValue {
  /** Currently selected device id, e.g. "device001" */
  deviceId: string;
  /** Devices the user can switch between (profile device + defaults). */
  knownDevices: string[];
  loading: boolean;
  /** Switch device and persist to Users/{uid}/deviceId */
  setDeviceId: (id: string) => Promise<void>;
  /** Add a device id to the switcher list */
  addDevice: (id: string) => void;
}

export const DeviceContext = createContext<DeviceContextValue | null>(null);
