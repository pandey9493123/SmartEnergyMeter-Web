interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
}

export function ProgressBar({ current, max, label }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100)) || 0;
  
  let color = 'var(--normal)';
  if (percentage >= 80) color = 'var(--warning)';
  if (percentage >= 100) color = 'var(--fault)';

  return (
    <div style={{ width: '100%', marginBottom: '16px' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          <span className="mono" style={{ color: color, fontWeight: 600 }}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
      <div style={{ 
        width: '100%', 
        height: '12px', 
        backgroundColor: 'var(--surface-recessed)', 
        borderRadius: '2px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.5s ease-in-out, background-color 0.5s ease-in-out'
        }} />
      </div>
    </div>
  );
}