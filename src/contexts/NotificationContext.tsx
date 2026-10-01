import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { NotificationContext } from './notification-context';
import type { AlertItem, AlertSeverity } from './notification-context';
import { playAlertSound } from '../utils/alertSound';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clear = useCallback(() => {
    setAlerts([]);
  }, []);

  const notify = useCallback((title: string, body: string, severity: AlertSeverity = 'info'): number => {
    idRef.current += 1;
    const id = idRef.current;
    const item: AlertItem = { id, title, body, severity, at: Date.now() };
    setAlerts((prev) => [...prev.slice(-4), item]);
    playAlertSound(severity);
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, { body, tag: `sem-${id}` });
      }
    } catch {
      /* OS notification unavailable — toast is enough */
    }
    window.setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 9000);
    return id;
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof Notification === 'undefined') {
      setPermission('denied');
      return 'denied';
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      const current = Notification.permission;
      setPermission(current);
      return current;
    }
  }, []);

  const value = useMemo(
    () => ({ alerts, notify, dismiss, clear, permission, requestPermission }),
    [alerts, notify, dismiss, clear, permission, requestPermission],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
