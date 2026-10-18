import { createContext } from 'react';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertItem {
  id: number;
  title: string;
  body: string;
  severity: AlertSeverity;
  at: number;
}

export interface NotificationContextValue {
  alerts: AlertItem[];
  notify: (title: string, body: string, severity?: AlertSeverity) => number;
  dismiss: (id: number) => void;
  clear: () => void;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);
