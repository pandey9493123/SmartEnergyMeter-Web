import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';

export default function ReportsPage() {
  const { telemetry, loading } = useLiveTelemetry();

  if (loading || !telemetry) return <div style={{ padding: '32px' }}>Loading...</div>;

  const handleExportCSV = () => {
    // Generate native CSV string from current snapshot
    const headers = "Timestamp,Voltage(V),Current(A),Power(W),Energy(kWh),Frequency(Hz),PowerFactor,Bill(INR)\n";
    const row = `${new Date().toISOString()},${telemetry.voltage},${telemetry.current},${telemetry.power},${telemetry.energy},${telemetry.frequency},${telemetry.powerFactor},${telemetry.bill}\n`;
    
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SEM_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    // Basic native print dialogue for PDF generation
    window.print();
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Data Export & Reports</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Generate billing statements and CSV telemetry logs.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: 'var(--surface-primary)', padding: '24px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)' }}>
          <h3 style={{ marginBottom: '16px' }}>Current Snapshot (CSV)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Exports the current active electrical parameters to a comma-separated values file for Excel analysis.</p>
          <button onClick={handleExportCSV} style={{ backgroundColor: 'var(--action)', color: '#fff', padding: '10px 16px', borderRadius: '4px', fontWeight: 600 }}>DOWNLOAD CSV</button>
        </div>

        <div style={{ backgroundColor: 'var(--surface-primary)', padding: '24px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)' }}>
          <h3 style={{ marginBottom: '16px' }}>Billing Statement (PDF)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Generates a printable monthly report summarizing total energy consumption and final billing parameters.</p>
          <button onClick={handleExportPDF} style={{ backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 16px', borderRadius: '4px', fontWeight: 600 }}>GENERATE PDF</button>
        </div>
      </div>
    </div>
  );
}