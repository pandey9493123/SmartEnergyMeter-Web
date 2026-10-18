import { useContext } from 'react';
import { DeviceContext } from '../contexts/device-context';

export function useDevice() {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error('useDevice must be used inside DeviceProvider.');
  return ctx;
}
