import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuth } from '../../hooks/useAuth';

export default function OverviewPage() {
  const { telemetry, loading, error, isOnline, deviceId, dataAgeMs } = useLiveTelemetry();
  const { currentUser } = useAuth();

  const formatPower = (watts: number) => {
    if (watts >= 1000) return { val: (watts / 1000).toFixed(2), unit: 'kW' };
    return { val: watts.toFixed(1), unit: 'W' };
  };

  const getPfClass = (pf: number) => {
    if (pf >= 0.95) return { label: 'EXCELLENT', color: 'var(--normal)' };
    if (pf >= 0.85) return { label: 'GOOD', color: 'var(--warning)' };
    return { label: 'POOR', color: 'var(--fault)' };
  };

  const calculateProjection = (currentBill: number) => {
    const today = new Date();
    const daysElapsed = today.getDate() || 1; 
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return ((currentBill / daysElapsed) * daysInMonth).toFixed(2);
  };

  const handleExportCSV = () => {
    if (!telemetry) return;
    const headers = "Timestamp,Voltage(V),Current(A),Power(W),Energy(kWh),Frequency(Hz),PowerFactor,Bill(INR)\n";
    const row = `${new Date().toISOString()},${telemetry.voltage},${telemetry.current},${telemetry.power},${telemetry.energy},${telemetry.frequency},${telemetry.powerFactor},${telemetry.bill}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SEM_Quick_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="page-container">
        <p style={{ color: 'var(--text-secondary)' }}>Initializing dashboard telemetry...</p>
      </div>
    );
  }

  if (error || !telemetry) {
    return (
      <div className="page-container">
        <div style={{ color: 'var(--fault)', border: '1px solid var(--fault)', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '16px', borderRadius: 'var(--border-radius)' }}>
          CRITICAL ERROR: {error || 'No telemetry data available.'}
        </div>
      </div>
    );
  }

  const power = formatPower(telemetry.power);
  const pfStatus = getPfClass(telemetry.powerFactor);
  const systemSafe = !telemetry.faultActive;

  return (
    <div className="page-container">
      
      {/* Top Header: Welcome & Online Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Welcome back, {currentUser?.displayName?.split(' ')[0] || 'User'} 
            <span style={{ fontSize: '1.2rem' }}>👋</span>
          </h1>
        </div>
        
        {/* Sleek Online Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'var(--surface-control)', border: `1px solid ${isOnline ? 'var(--normal)' : 'var(--fault)'}`, borderRadius: '20px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? 'var(--normal)' : 'var(--fault)', boxShadow: isOnline ? 'var(--neon-glow-normal)' : 'var(--neon-glow-fault)' }}></span>
          <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 600, color: isOnline ? 'var(--normal)' : 'var(--fault)' }}>
            {deviceId} {isOnline ? 'Online' : 'Offline'}
            {!isOnline && dataAgeMs !== null ? ` · ${Math.floor(dataAgeMs / 1000)}s stale` : ''}
          </span>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--action)', fontWeight: 700, display: 'flex', alignItems: 'center', marginRight: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Quick Actions
        </div>
        <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
          Export CSV
        </button>
        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Export PDF
        </button>
      </div>

      {/* MAIN 3-BLOCK METRICS */}
      <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div style={{ backgroundColor: 'var(--surface-primary)', padding: '20px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', borderBottom: '3px solid var(--action)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px', marginBottom: '12px' }}>VOLTAGE</div>
          <div className="tech-number" style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>{telemetry.voltage.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>V</span></div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--action)', padding: '2px 6px', borderRadius: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--action)' }}></span> Live
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-primary)', padding: '20px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', borderBottom: '3px solid var(--warning)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px', marginBottom: '12px' }}>CURRENT</div>
          <div className="tech-number" style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>{telemetry.current.toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>A</span></div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--warning)', padding: '2px 6px', borderRadius: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span> Live
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-primary)', padding: '20px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', borderBottom: '3px solid var(--normal)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px', marginBottom: '12px' }}>POWER</div>
          <div className="tech-number" style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>{power.val} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{power.unit}</span></div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--normal)', padding: '2px 6px', borderRadius: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--normal)' }}></span> Live
          </div>
        </div>
      </div>

      {/* SECOND ROW: Split Bill Card & Fault Status */}
      <div className="responsive-grid">
        
        {/* Split Bill Card */}
        <div style={{ backgroundColor: 'var(--surface-primary)', padding: '24px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--action)', fontWeight: 700 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            Bill Estimation
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1 }}>
            <div style={{ backgroundColor: 'var(--surface-recessed)', padding: '16px', borderRadius: '4px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Daily Bill</div>
              <div className="mono" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>₹{(telemetry.bill / (new Date().getDate() || 1)).toFixed(2)}</div>
            </div>
            
            <div style={{ backgroundColor: 'var(--surface-recessed)', padding: '16px', borderRadius: '4px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Monthly Est.</div>
              <div className="mono" style={{ fontSize: '1.25rem', color: telemetry.budgetExceeded ? 'var(--warning)' : 'var(--text-primary)', fontWeight: 600 }}>₹{calculateProjection(telemetry.bill)}</div>
            </div>
            
            <div style={{ backgroundColor: 'var(--surface-recessed)', padding: '16px', borderRadius: '4px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Tariff Rate</div>
              <div className="mono" style={{ fontSize: '1.25rem', color: 'var(--warning)', fontWeight: 600 }}>₹{telemetry.tariff.toFixed(2)}</div>
            </div>
            
            <div style={{ backgroundColor: 'var(--surface-recessed)', padding: '16px', borderRadius: '4px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Energy</div>
              <div className="mono" style={{ fontSize: '1.25rem', color: 'var(--normal)', fontWeight: 600 }}>{telemetry.energy.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>kWh</span></div>
            </div>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <ProgressBar current={telemetry.bill} max={telemetry.budgetLimit} label={`Budget: ₹${telemetry.budgetLimit}`} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Fault Status Card */}
          <div style={{ backgroundColor: 'var(--surface-primary)', padding: '24px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--action)', fontWeight: 700 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Fault Status
            </div>

            <div style={{ backgroundColor: systemSafe ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '4px', border: `1px solid ${systemSafe ? 'var(--normal)' : 'var(--fault)'}`, display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: systemSafe ? 'var(--normal)' : 'var(--fault)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {systemSafe ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: systemSafe ? 'var(--normal)' : 'var(--fault)', fontSize: '1.1rem' }}>{systemSafe ? 'All Normal' : 'Safety Tripped'}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{systemSafe ? 'No faults detected in the circuit.' : telemetry.lastFault}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Recent Activity</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-primary)' }}>System Relay State</span>
              <span className="mono" style={{ color: telemetry.relayState ? 'var(--warning)' : 'var(--text-muted)' }}>{telemetry.relayState ? 'ENERGIZED' : 'ISOLATED'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-primary)' }}>Power Quality (PF)</span>
              <span className="mono" style={{ color: pfStatus.color }}>{pfStatus.label}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}