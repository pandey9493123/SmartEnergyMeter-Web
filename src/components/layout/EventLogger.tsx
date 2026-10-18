import { useEventLog } from '../../hooks/useEventLog';

/** Invisible component that runs the event watcher. Mounted once in App. */
export default function EventLogger() {
  useEventLog();
  return null;
}
