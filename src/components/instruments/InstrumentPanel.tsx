import type { ReactNode } from 'react';
import './InstrumentPanel.css';

interface InstrumentPanelProps {
  title: string;
  statusText?: string;
  statusColor?: string;
  children: ReactNode;
}

export function InstrumentPanel({ title, statusText, statusColor, children }: InstrumentPanelProps) {
  return (
    <div className="instrument-panel">
      <div className="instrument-header">
        <span>{title}</span>
        {statusText && (
          <span style={{ color: statusColor || 'var(--text-muted)' }}>
            {statusText}
          </span>
        )}
      </div>
      <div className="instrument-body">
        {children}
      </div>
    </div>
  );
}

interface InstrumentScreenProps {
  label: string;
  value: string | number;
  unit?: string;
  valueColor?: string;
}

export function InstrumentScreen({ label, value, unit, valueColor }: InstrumentScreenProps) {
  return (
    <div className="instrument-screen">
      <div className="screen-label">{label}</div>
      <div className="screen-value mono" style={{ color: valueColor || 'var(--text-primary)' }}>
        {value}
        {unit && <span className="screen-unit">{unit}</span>}
      </div>
    </div>
  );
}