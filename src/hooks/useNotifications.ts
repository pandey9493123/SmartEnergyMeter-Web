import { useContext } from 'react';
import { NotificationContext } from '../contexts/notification-context';

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider.');
  return ctx;
}
