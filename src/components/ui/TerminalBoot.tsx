import { useState, useEffect } from 'react';

export function TerminalBoot({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    const sequence = [
      "INITIALIZING SYSTEM CORE...",
      "AUTHENTICATING USER CREDENTIALS... [OK]",
      "ESTABLISHING SECURE CONNECTION TO ESP32...",
      "SYNCING FIREBASE TELEMETRY... [OK]",
      "LOADING INSTRUMENTATION DASHBOARD..."
    ];
    
    let currentLine = 0;
    const interval = setInterval(() => {
      setLines(prev => [...prev, sequence[currentLine]]);
      currentLine++;
      
      if (currentLine >= sequence.length) {
        clearInterval(interval);
        setTimeout(onComplete, 600); // Wait a fraction of a second before fading out
      }
    }, 300);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: '#03050a', color: '#10b981',
      fontFamily: 'IBM Plex Mono, monospace',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '40px',
      fontSize: '0.9rem', letterSpacing: '1px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '24px', opacity: 0.7 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        {lines.map((line, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>&gt; {line}</div>
        ))}
        <div style={{ animation: 'blink 1s step-end infinite' }}>&gt; _</div>
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}