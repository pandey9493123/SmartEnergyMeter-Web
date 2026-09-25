import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  DEFAULT_DEVICE_ID,
  loadUserProfile,
  updateUserProfile,
} from '../firebase/profile';
import { DeviceContext } from './device-context';

const LOCAL_KEY = 'sem-known-devices';

function readLocalDevices(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((d): d is string => typeof d === 'string' && d.trim().length > 0);
  } catch {
    return [];
  }
}

export function DeviceProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [deviceId, setDeviceIdState] = useState<string>(DEFAULT_DEVICE_ID);
  const [knownDevices, setKnownDevices] = useState<string[]>([DEFAULT_DEVICE_ID]);
  const [loading, setLoading] = useState(true);

  // Load profile device + merge with locally known devices.
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoading(true);
      const local = readLocalDevices();
      if (!currentUser) {
        if (!cancelled) {
          setDeviceIdState(DEFAULT_DEVICE_ID);
          setKnownDevices(
            local.length > 0 ? Array.from(new Set([DEFAULT_DEVICE_ID, ...local])) : [DEFAULT_DEVICE_ID],
          );
          setLoading(false);
        }
        return;
      }
      try {
        const profile = await loadUserProfile(currentUser.uid);
        const profileDevice = profile?.deviceId?.trim() || DEFAULT_DEVICE_ID;
        if (!cancelled) {
          setDeviceIdState(profileDevice);
          const merged = Array.from(new Set([profileDevice, DEFAULT_DEVICE_ID, ...local]));
          setKnownDevices(merged);
          localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
        }
      } catch {
        if (!cancelled) {
          setDeviceIdState(DEFAULT_DEVICE_ID);
          setKnownDevices(
            local.length > 0 ? Array.from(new Set([DEFAULT_DEVICE_ID, ...local])) : [DEFAULT_DEVICE_ID],
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const setDeviceId = useCallback(
    async (id: string) => {
      const clean = id.trim();
      if (!clean) return;
      setDeviceIdState(clean);
      setKnownDevices((prev) => {
        const next = Array.from(new Set([clean, ...prev]));
        try {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
      if (currentUser) {
        try {
          await updateUserProfile(currentUser.uid, { deviceId: clean });
        } catch {
          /* offline — local switch still applies */
        }
      }
    },
    [currentUser],
  );

  const addDevice = useCallback((id: string) => {
    const clean = id.trim();
    if (!clean) return;
    setKnownDevices((prev) => {
      if (prev.includes(clean)) return prev;
      const next = [...prev, clean];
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ deviceId, knownDevices, loading, setDeviceId, addDevice }),
    [deviceId, knownDevices, loading, setDeviceId, addDevice],
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}
